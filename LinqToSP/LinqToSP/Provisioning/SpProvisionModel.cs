using Microsoft.SharePoint.Client;
using SP.Client.Linq.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

namespace SP.Client.Linq.Provisioning
{
  public class SpProvisionModel<TContext, TEntity>
      where TContext : class, ISpEntryDataContext
      where TEntity : class, IListItemEntity
  {
    public TContext Context { get; }

    private List _list;

    private Dictionary<ContentType, ContentTypeProvisionHandler<TContext, TEntity>> _contentTypes;

    private Dictionary<Field, FieldProvisionHandler<TContext, TEntity>> _fields;

    private List<SpProvisionHandler<TContext, TEntity>> ProvisionHandlers { get; set; }

    public SpProvisionModel(TContext context)
    {
      Context = context;
      RetrieveHandlers();
    }

    private void RetrieveHandlers()
    {
      ProvisionHandlers = new List<SpProvisionHandler<TContext, TEntity>>();
      var contentTypes = AttributeHelper.GetCustomAttributes<TEntity, ContentTypeAttribute>(true);
      var list = AttributeHelper.GetCustomAttributes<TEntity, ListAttribute>(false).FirstOrDefault();
      var fields = AttributeHelper.GetFieldAttributes<TEntity, FieldAttribute>().Concat(AttributeHelper.GetPropertyAttributes<TEntity, FieldAttribute>()).OrderBy(f => f.Value.Order);

      if (list != null)
      {
        var listHandler = new ListProvisionHandler<TContext, TEntity>(list, this);
        listHandler.OnProvisioning += ListHandler_OnProvisioning;
        listHandler.OnProvisioned += ListHandler_OnProvisioned;
        ProvisionHandlers.Add(listHandler);
      }

      foreach (var field in fields.OrderBy(f => typeof(CalculatedFieldAttribute).IsAssignableFrom(f.Value.GetType()) ? 1 : 0))
      {
        if (typeof(DependentLookupFieldAttribute).IsAssignableFrom(field.Value.GetType()))
        {
          continue;
        }

        //if (typeof(LookupFieldAttribute).IsAssignableFrom(field.Value.GetType()))
        //{
        //}

        Type valueType = null;
        if (field.Key is PropertyInfo)
        {
          valueType = (field.Key as PropertyInfo).PropertyType;
        }
        else if (field.Key is FieldInfo)
        {
          valueType = (field.Key as FieldInfo).FieldType;
        }
        var fieldHandler = new FieldProvisionHandler<TContext, TEntity>(field.Value,
            AttributeHelper.GetCustomAttributes<TEntity, ContentTypeAttribute>(true).LastOrDefault(), list, this, valueType);
        fieldHandler.OnProvisioned += FieldHandler_OnProvisioned;
        fieldHandler.OnProvisioning += FieldHandler_OnProvisioning;

        ProvisionHandlers.Add(fieldHandler);
      }

      foreach (var contentType in contentTypes)
      {
        if (contentType != null)
        {
          var contentTypeHandler = new ContentTypeProvisionHandler<TContext, TEntity>(contentType, list, this);
          contentTypeHandler.OnProvisioned += ContentTypeHandler_OnProvisioned;
          contentTypeHandler.OnProvisioning += ContentTypeHandler_OnProvisioning;
          ProvisionHandlers.Add(contentTypeHandler);
        }
      }
    }

    protected virtual void ListHandler_OnProvisioning(ListProvisionHandler<TContext, TEntity> handler, List list)
    {
      if (ProvisionHandlers != null && ProvisionHandlers.Any(h => typeof(ContentTypeProvisionHandler<TContext, TEntity>).IsAssignableFrom(h.GetType())))
      {
        list.ContentTypesEnabled = true;
      }
    }

    protected virtual void ListHandler_OnProvisioned(ListProvisionHandler<TContext, TEntity> handler, List list)
    {
      _list = list;
    }

    protected virtual void ContentTypeHandler_OnProvisioning(ContentTypeProvisionHandler<TContext, TEntity> handler, ContentType contentType)
    {
    }

    protected virtual void ContentTypeHandler_OnProvisioned(ContentTypeProvisionHandler<TContext, TEntity> handler, ContentType contentType)
    {
      _contentTypes.Add(contentType, handler);
    }

    protected virtual void FieldHandler_OnProvisioning(FieldProvisionHandler<TContext, TEntity> handler, Field field)
    {
    }

    protected virtual void FieldHandler_OnProvisioned(FieldProvisionHandler<TContext, TEntity> handler, Field field)
    {
      _fields.Add(field, handler);
    }

    public virtual void Provision(bool overwrite = false)
    {
      if (ProvisionHandlers != null)
      {
        _list = null;
        _contentTypes = new Dictionary<ContentType, ContentTypeProvisionHandler<TContext, TEntity>>();
        _fields = new Dictionary<Field, FieldProvisionHandler<TContext, TEntity>>();

        foreach (var provisionHandler in ProvisionHandlers)
        {
          if (provisionHandler != null)
            provisionHandler.Provision(overwrite);
        }

        var allFields = new Dictionary<string, int>();
        foreach (var fieldHandler in ProvisionHandlers.OfType<FieldProvisionHandler<TContext, TEntity>>())
        {
          allFields[fieldHandler.Field.Name] = fieldHandler.Field.Order;
        }

        if (_fields.Count > 0)
        {
          if (_contentTypes.Count > 0)
          {
            foreach (ContentType contentType in _contentTypes.Keys)
            {
              if (contentType.Sealed || contentType.ReadOnly) continue;

              var fieldLinks = contentType.FieldLinks;
              contentType.Context.Load(fieldLinks);
              contentType.Context.ExecuteQuery();

              var newFieldLinks = new List<FieldLinkCreationInformation>();
              foreach (Field field in _fields.Keys)
              {
                var fieldLink = fieldLinks.FirstOrDefault(f => f.Id == field.Id);
                if (fieldLink == null)
                {
                  newFieldLinks.Add(new FieldLinkCreationInformation() { Field = field });
                }
              }

              var fieldLinkNames = fieldLinks.Select(f => f.Name).ToList();

              foreach (var newFieldLink in newFieldLinks)
              {
                var fieldLink = contentType.FieldLinks.Add(newFieldLink);
                if (!fieldLinkNames.Contains(newFieldLink.Field.InternalName))
                {
                  fieldLinkNames.Add(newFieldLink.Field.InternalName);
                }
              }

              contentType.Update(false);
              contentType.Context.ExecuteQuery();

              var sortedFieldNames = fieldLinkNames.ToArray();

              Array.Sort(sortedFieldNames, new Comparison<string>(
                  (f1, f2) =>
                  {
                    if (allFields.ContainsKey(f1) && allFields.ContainsKey(f2))
                    {
                      return allFields[f1].CompareTo(allFields[f2]);
                    }
                    else if (allFields.ContainsKey(f1))
                    {
                      return 1;
                    }
                    else if (allFields.ContainsKey(f2))
                    {
                      return -1;
                    }
                    return 0;
                  }));

              contentType.FieldLinks.Reorder(sortedFieldNames);
              contentType.Update(false);
              contentType.Context.ExecuteQuery();
            }
          }

          if (_list != null)
          {
            View view = _list.DefaultView;
            view.Context.Load(view.ViewFields);
            view.Context.ExecuteQuery();
            var viewFields = view.ViewFields.ToList();
            view.ViewFields.RemoveAll();

            foreach (var field in _fields.Keys)
            {
              if (!viewFields.Contains(field.InternalName))
              {
                viewFields.Add(field.InternalName);
              }
            }

            var sortedViewFields = viewFields.ToArray();

            Array.Sort(sortedViewFields, new Comparison<string>(
                (f1, f2) =>
                {
                  if (allFields.ContainsKey(f1) && allFields.ContainsKey(f2))
                  {
                    return allFields[f1].CompareTo(allFields[f2]);
                  }
                  else if (allFields.ContainsKey(f1))
                  {
                    return 1;
                  }
                  else if (allFields.ContainsKey(f2))
                  {
                    return -1;
                  }
                  return 0;
                }));

            foreach (string viewField in sortedViewFields)
            {
              view.ViewFields.Add(viewField);
            }

            view.Update();
            view.Context.ExecuteQuery();
          }
        }
      }
    }
  }
}
