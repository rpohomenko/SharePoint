using Microsoft.SharePoint.Client;
using SP.Client.Extensions;
using SP.Client.Linq.Attributes;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Reflection;

namespace SP.Client.Linq.Provisioning
{
    public class SpProvisionModel<TContext, TEntity>
        where TContext : class, ISpEntryDataContext
        where TEntity : class, IListItemEntity, new()
    {
        public TContext Context { get; }

        private List _list;

        private Dictionary<ContentTypeProvisionHandler<TContext, TEntity>, ContentType> _contentTypes;

        private Dictionary<FieldProvisionHandler<TContext, TEntity>, Field> _fields;

        protected List<SpProvisionHandler<TContext, TEntity>> ProvisionHandlers { get; set; }

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

            if (list != null && list.Behavior != ProvisionBehavior.None)
            {
                var listHandler = new ListProvisionHandler<TContext, TEntity>(list, this);
                listHandler.OnProvisioning += ListHandler_OnProvisioning;
                listHandler.OnProvisioned += ListHandler_OnProvisioned;
                listHandler.OnUnProvisioning += ListHandler_OnUnProvisioning;
                listHandler.OnUnProvisioned += ListHandler_OnUnProvisioned;

                ProvisionHandlers.Add(listHandler);
            }

            foreach (var contentType in contentTypes)
            {
                if (contentType != null && contentType.Behavior != ProvisionBehavior.None)
                {
                    var contentTypeHandler = new ContentTypeProvisionHandler<TContext, TEntity>(contentType, list, this);
                    contentTypeHandler.OnProvisioned += ContentTypeHandler_OnProvisioned;
                    contentTypeHandler.OnProvisioning += ContentTypeHandler_OnProvisioning;
                    contentTypeHandler.OnUnProvisioned += ContentTypeHandler_OnUnProvisioned;
                    contentTypeHandler.OnUnProvisioning += ContentTypeHandler_OnUnProvisioning;
                    ProvisionHandlers.Add(contentTypeHandler);
                }
            }

            foreach (var field in fields.OrderBy(f => typeof(CalculatedFieldAttribute).IsAssignableFrom(f.Value.GetType()) ? 1 : 0))
            {
                if (field.Value.Behavior == ProvisionBehavior.None) continue;

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

                if (field.Value.DataType == FieldType.Lookup)
                {
                    if (/*!typeof(IListItemEntity).IsAssignableFrom(valueType) &&*/ !typeof(ISpEntityLookup).IsAssignableFrom(valueType) && !typeof(ISpEntityLookupCollection).IsAssignableFrom(valueType))
                    {
                        continue;
                    }
                }

                var duplicateField = ProvisionHandlers.OfType<FieldProvisionHandler<TContext, TEntity>>().FirstOrDefault(f => f.Field.Name == field.Value.Name);

                if (duplicateField != null)
                {
                    throw new Exception($"Duplicate field: {duplicateField.Field}.");
                }

                var fieldHandler = new FieldProvisionHandler<TContext, TEntity>(field.Value,
                    AttributeHelper.GetCustomAttributes<TEntity, ContentTypeAttribute>(true).LastOrDefault(), list, this, valueType);
                fieldHandler.OnProvisioned += FieldHandler_OnProvisioned;
                fieldHandler.OnProvisioning += FieldHandler_OnProvisioning;
                fieldHandler.OnUnProvisioned += FieldHandler_OnUnProvisioned;
                fieldHandler.OnUnProvisioning += FieldHandler_OnUnProvisioning;

                ProvisionHandlers.Add(fieldHandler);
            }
        }

        protected virtual void ListHandler_OnProvisioning(ListProvisionHandler<TContext, TEntity> handler, List list)
        {
            if (ProvisionHandlers != null && ProvisionHandlers.Any(h => typeof(ContentTypeProvisionHandler<TContext, TEntity>).IsAssignableFrom(h.GetType())))
            {
                if (!list.IsPropertyAvailable("ContentTypesEnabled") || !list.ContentTypesEnabled)
                {
                    list.ContentTypesEnabled = true;
                }
            }
        }

        protected virtual void ListHandler_OnProvisioned(ListProvisionHandler<TContext, TEntity> handler, List list)
        {
            Debug.WriteLine($"List '{list.Title}' has been provisioned.");
            _list = list;
        }

        protected virtual void ListHandler_OnUnProvisioned(ListProvisionHandler<TContext, TEntity> handler, List list)
        {
            Debug.WriteLine($"List '{list.Title}' has been unprovisioned.");
            _list = null;
        }
        protected virtual void ListHandler_OnUnProvisioning(ListProvisionHandler<TContext, TEntity> handler, List list)
        {
        }

        protected virtual void ContentTypeHandler_OnProvisioning(ContentTypeProvisionHandler<TContext, TEntity> handler, ContentType contentType)
        {
        }

        protected virtual void ContentTypeHandler_OnProvisioned(ContentTypeProvisionHandler<TContext, TEntity> handler, ContentType contentType)
        {
            Debug.WriteLine($"ContentType '{contentType.Name}' has been provisioned on {handler.ContentType.Level}.");
            _contentTypes.Add(handler, contentType);
        }

        protected virtual void ContentTypeHandler_OnUnProvisioning(ContentTypeProvisionHandler<TContext, TEntity> handler, ContentType contentType)
        {

        }

        protected virtual void ContentTypeHandler_OnUnProvisioned(ContentTypeProvisionHandler<TContext, TEntity> handler, ContentType contentType)
        {
            Debug.WriteLine($"ContentType '{contentType.Name}' has been provisioned on {handler.ContentType.Level}.");
            if (_contentTypes != null && _contentTypes.ContainsKey(handler))
            {
                _contentTypes.Remove(handler);
            }
        }

        protected virtual void FieldHandler_OnProvisioning(FieldProvisionHandler<TContext, TEntity> handler, Field field)
        {
        }

        protected virtual void FieldHandler_OnProvisioned(FieldProvisionHandler<TContext, TEntity> handler, Field field)
        {
            Debug.WriteLine($"Field '{field.Title}' has been provisioned on {handler.Field.Level}.");
            _fields.Add(handler, field);
        }

        protected virtual void FieldHandler_OnUnProvisioning(FieldProvisionHandler<TContext, TEntity> handler, Field field)
        {
        }

        protected virtual void FieldHandler_OnUnProvisioned(FieldProvisionHandler<TContext, TEntity> handler, Field field)
        {
            Debug.WriteLine($"Field '{field.Title}' has been unprovisioned on {handler.Field.Level}.");
            if (_fields != null && _fields.ContainsKey(handler))
            {
                _fields.Remove(handler);
            }
        }

        private void SetFieldLinks(ContentType contentType, IEnumerable<Field> fields, Comparison<string> comparison)
        {
            if (contentType == null || contentType.Sealed || contentType.ReadOnly || !fields.Any()) return;

            var fieldLinks = contentType.FieldLinks;
            contentType.Context.Load(fieldLinks);
            contentType.Context.ExecuteQuery();

            var newFieldLinks = new List<FieldLinkCreationInformation>();
            foreach (Field field in fields)
            {
                var fieldLink = fieldLinks.FirstOrDefault(f => f.Id == field.Id);
                if (fieldLink == null)
                {
                    newFieldLinks.Add(new FieldLinkCreationInformation() { Field = field });
                }
            }

            var arrFieldLinks = fieldLinks.Select(f => f.Name).ToArray();
            var fieldLinkNames = arrFieldLinks.ToList();

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

            Array.Sort(sortedFieldNames, comparison);

            if (!sortedFieldNames.SequenceEqual(arrFieldLinks))
            {
                contentType.FieldLinks.Reorder(sortedFieldNames);
                contentType.Update(false);
                contentType.Context.ExecuteQuery();
            }
        }

        private void SetFieldsToList(ListProvisionHandler<TContext, TEntity> listHandler, ProvisionLevel level, bool forceOverwrite)
        {
            if (_list != null && listHandler.List.Behavior != ProvisionBehavior.None && _fields != null)
            {
                foreach (var field in _fields)
                {
                    SetFieldToList(field.Value, field.Key, level, forceOverwrite);
                }
            }
        }

        private void SetFieldToList(Field field, FieldProvisionHandler<TContext, TEntity> fieldHandler, ProvisionLevel level, bool forceOverwrite)
        {
            if (fieldHandler != null && (fieldHandler.Field.Level == ProvisionLevel.Web || level == ProvisionLevel.Web))
            {
                Field existField = _list.Fields.GetByInternalNameOrTitle(fieldHandler.Field.Name);
                _list.Context.Load(existField);
                try
                {
                    _list.Context.ExecuteQuery();
                }
                catch (Exception)
                {
                    existField = null;
                }
                if (existField == null)
                {
                    if (forceOverwrite || fieldHandler.Field.Behavior == ProvisionBehavior.Overwrite)
                    {
                        if (typeof(CalculatedFieldAttribute).IsAssignableFrom(fieldHandler.Field.GetType()))
                        {
                            string fieldRefs = (fieldHandler.Field as CalculatedFieldAttribute).FieldRefs == null
                                ? null
                                : string.Join("", (fieldHandler.Field as CalculatedFieldAttribute).FieldRefs.Select(fieldRef => new Caml.CamlFieldRef() { Name = fieldRef }.ToString()));
                            string formula = (fieldHandler.Field as CalculatedFieldAttribute).Formula;

                            if (!string.IsNullOrEmpty(fieldRefs) && !string.IsNullOrEmpty(formula))
                            {
                                var refFields = new List<Field>();
                                foreach (string fieldName in (fieldHandler.Field as CalculatedFieldAttribute).FieldRefs)
                                {
                                    var refField = _list.Fields.GetByInternalNameOrTitle(fieldName);
                                    _list.Context.Load(refField, f => f.Title, f => f.InternalName, f => f.Id);
                                    refFields.Add(refField);
                                }
                                _list.Context.ExecuteQuery();
                                foreach (Field refField in refFields)
                                {
                                    formula = formula.Replace($"[{refField.InternalName}]", $"[{refField.Title}]");
                                }
                              (fieldHandler.Field as CalculatedFieldAttribute).Formula = formula;
                                field.ReplaceFormula(formula, (fieldHandler.Field as CalculatedFieldAttribute).FieldRefs);
                            }
                        }
                    }

                    Field newField = _list.Fields.Add(field);
                    if (forceOverwrite || fieldHandler.Field.Behavior == ProvisionBehavior.Overwrite)
                    {
                        newField = fieldHandler.ApplyField(newField);
                        newField.Update();
                    }
                    newField.Context.ExecuteQuery();
                }
            }
        }

        private void SetContentTypeToList(ContentType contentType, ContentTypeProvisionHandler<TContext, TEntity> contentTypeHandler, ListProvisionHandler<TContext, TEntity> listHandler, ProvisionLevel level, Comparison<string> comparison)
        {
            if ((contentTypeHandler.ContentType.Level == ProvisionLevel.Web || level == ProvisionLevel.Web)
                && _list != null && listHandler != null && listHandler.List.Behavior != ProvisionBehavior.None)
            {
                string ctName;
                string ctId = contentType.Id.StringValue;
                var listContentTypes = _list.Context.LoadQuery(_list.ContentTypes.Where(ct => ct.Id.StringValue == ctId
                                                            || ct.Parent.Id.StringValue == ctId));
                ContentType listContentType;
                try
                {
                    _list.Context.ExecuteQuery();
                    listContentType = listContentTypes.FirstOrDefault();
                    if (listContentType != null)
                        ctName = listContentType.Name;
                }
                catch
                {
                    listContentType = null;
                }
                if (listContentType == null)
                {
                    listContentType = _list.ContentTypes.AddExistingContentType(contentType);
                    _list.Context.Load(listContentType);
                    _list.Context.ExecuteQuery();

                    if (_fields != null)
                    {
                        SetFieldLinks(contentType, _fields.Values, comparison);
                    }
                }
            }
        }

        private void UpdateDefaultListView(ListProvisionHandler<TContext, TEntity> listHandler, Comparison<string> comparison)
        {
            if (_list != null && listHandler != null && listHandler.List.Behavior != ProvisionBehavior.None)
            {
                View view = _list.DefaultView;
                view.Context.Load(view.ViewFields);
                view.Context.ExecuteQuery();
                var oriViewFields = view.ViewFields.ToArray();
                var viewFields = oriViewFields.ToList();

                foreach (var field in _fields.Values)
                {
                    if (!viewFields.Contains(field.InternalName))
                    {
                        viewFields.Add(field.InternalName);
                    }
                }

                var sortedViewFields = viewFields.ToArray();
                Array.Sort(sortedViewFields, comparison);

                if (!sortedViewFields.SequenceEqual(oriViewFields))
                {
                    view.ViewFields.RemoveAll();
                    foreach (string viewField in sortedViewFields)
                    {
                        view.ViewFields.Add(viewField);
                    }
                    view.Update();
                    view.Context.ExecuteQuery();
                }
            }
        }

        public virtual void Provision(bool forceOverwrite = false, ProvisionLevel level = ProvisionLevel.Default)
        {
            if (ProvisionHandlers != null)
            {
                _list = null;
                ListProvisionHandler<TContext, TEntity> listHandler = null;
                _contentTypes = new Dictionary<ContentTypeProvisionHandler<TContext, TEntity>, ContentType>();
                _fields = new Dictionary<FieldProvisionHandler<TContext, TEntity>, Field>();
                var allFields = new Dictionary<string, int>();

                foreach (var provisionHandler in ProvisionHandlers)
                {
                    if (provisionHandler != null)
                    {
                        if (provisionHandler is ListProvisionHandler<TContext, TEntity>)
                        {
                            listHandler = provisionHandler as ListProvisionHandler<TContext, TEntity>;
                        }
                        else if (provisionHandler is FieldProvisionHandler<TContext, TEntity>)
                        {
                            allFields[(provisionHandler as FieldProvisionHandler<TContext, TEntity>).Field.Name]
                              = (provisionHandler as FieldProvisionHandler<TContext, TEntity>).Field.Order;
                        }
                        provisionHandler.Provision(forceOverwrite, level);
                    }
                }

                var comparison = new Comparison<string>(
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
                       });

                if (_contentTypes.Count > 0)
                {
                    foreach (var contentType in _contentTypes)
                    {
                        SetFieldLinks(contentType.Value,
                          _fields.Where(f => contentType.Key.ContentType.Level == f.Key.Field.Level || level == f.Key.Field.Level || f.Key.Field.Level == ProvisionLevel.Default).Select(f => f.Value), comparison);

                        SetContentTypeToList(contentType.Value, contentType.Key, listHandler, level, comparison);
                    }
                }

                SetFieldsToList(listHandler, level, forceOverwrite);

                UpdateDefaultListView(listHandler, comparison);
            }
        }

        public virtual void UnProvision(bool ignoreErrors = false, ProvisionLevel level = ProvisionLevel.Default)
        {
            if (ProvisionHandlers != null)
            {
                foreach (var provisionHandler in ProvisionHandlers)
                {
                    if (provisionHandler != null)
                    {
                        if (ignoreErrors)
                        {
                            try
                            {
                                provisionHandler.UnProvision(level);
                            }
                            catch { continue; }
                        }
                        else
                        {
                            provisionHandler.UnProvision(level);
                        }
                    }
                }
            }
        }
    }
}
