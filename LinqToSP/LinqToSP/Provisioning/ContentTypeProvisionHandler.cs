using Microsoft.SharePoint.Client;
using SP.Client.Extensions;
using SP.Client.Linq.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;

namespace SP.Client.Linq.Provisioning
{
  public sealed class ContentTypeProvisionHandler<TContext, TEntity> : SpProvisionHandler<TContext, TEntity>
      where TContext : class, ISpEntryDataContext
      where TEntity : class, IListItemEntity
  {
    public ContentTypeAttribute ContentType { get; }
    public ListAttribute List { get; }

    public event Action<ContentTypeProvisionHandler<TContext, TEntity>, ContentType> OnProvisioning;

    public event Action<ContentTypeProvisionHandler<TContext, TEntity>, ContentType> OnProvisioned;

    public ContentTypeProvisionHandler(ContentTypeAttribute contentType, SpProvisionModel<TContext, TEntity> model) : this(contentType, null, model)
    {
    }

    public ContentTypeProvisionHandler(ContentTypeAttribute contentType, ListAttribute list, SpProvisionModel<TContext, TEntity> model) : base(model)
    {
      ContentType = contentType;
      List = list;
    }

    public override void Provision(bool overwrite)
    {
      if (ContentType != null && Model != null && Model.Context != null && Model.Context.Context != null)
      {
        if (ContentType.Behavior == ProvisionBehavior.None) return;

        if (ContentType.Level == ProvisionLevel.Default)
        {
          ContentType.Level = List != null ? ProvisionLevel.List : ProvisionLevel.Web;
        }

        var context = Model.Context.Context;
        Web web = context.Web;
        List list = null;
        ContentType parentContentType = null;
        ContentType contentType = null;
        ContentType webContentType = null;
        ContentType listContentType = null;

        if (string.IsNullOrEmpty(ContentType.Id) && !string.IsNullOrEmpty(ContentType.ParentId))
        {
          parentContentType = web.AvailableContentTypes.GetById(ContentType.ParentId);
          //context.Load(parentContentType);
          //context.ExecuteQuery();
        }
        if (List != null)
        {
          if (List.Id != default)
          {
            list = context.Web.Lists.GetById(List.Id);
          }
          else if (List.Url != null)
          {
            list = context.Web.GetList/*ByUrl*/($"{ new Uri(Model.Context.SiteUrl).LocalPath.TrimEnd('/')}/{List.Url.TrimStart('/')}");
          }
          else if (!string.IsNullOrEmpty(List.Title))
          {
            list = context.Web.Lists.GetByTitle(List.Title);
          }
        }
        //if (list != null)
        //{
        //  context.Load(list);
        //  try
        //  {
        //    context.ExecuteQuery();
        //  }
        //  catch (Exception ex)
        //  {
        //    list = null;
        //  }
        //}

        var newContentType = !string.IsNullOrEmpty(ContentType.Name)
            ? new ContentTypeCreationInformation()
            {
              Id = ContentType.Id,
              Name = ContentType.Name,
              Group = ContentType.Group,
              ParentContentType = parentContentType
            } : null;

        string ctName = ContentType.Name;
        string ctId = ContentType.Id;

        //var contentTypes = list != null ? list.ContentTypes : web.ContentTypes;

        if (!string.IsNullOrEmpty(ctId))
        {
          if (ContentType.Level == ProvisionLevel.List && list != null)
          {
            var listContentTypes = context.LoadQuery(list.ContentTypes.Where(ct => ct.Id.StringValue == ctId || ct.Parent.Id.StringValue == ctId));
            try
            {
              context.ExecuteQuery();
              listContentType = listContentTypes.FirstOrDefault();
              if (listContentType != null)
                ctName = listContentType.Name;
            }
            catch
            {
              listContentType = null;
            }

            if ((overwrite || ContentType.Behavior == ProvisionBehavior.Overwrite) && listContentType != null)
            {
              if (!listContentType.Sealed)
              {
                OnProvisioned?.Invoke(this, listContentType);
              }
              return;
              //listContentType.DeleteObject();
              //context.ExecuteQuery();
              //listContentType = null;
            }
          }

          if (listContentType == null)
          {
            webContentType = web.AvailableContentTypes.GetById(ctId);
            context.Load(webContentType);
            try
            {
              context.ExecuteQuery();
              ctName = webContentType.Name;
            }
            catch
            {
              webContentType = null;
            }
          }
        }
        else if (!string.IsNullOrEmpty(ctName))
        {
          if (list != null)
          {
            var listContentTypes = context.LoadQuery(list.ContentTypes.Where(ct => ct.Name == ctName));
            try
            {
              context.ExecuteQuery();
              listContentType = listContentTypes.FirstOrDefault();
              if (listContentType != null)
                ctName = listContentType.Name;
            }
            catch
            {
              listContentType = null;
            }

            if ((overwrite || ContentType.Behavior == ProvisionBehavior.Overwrite) && listContentType != null)
            {
              if (!listContentType.Sealed)
              {
                OnProvisioned?.Invoke(this, listContentType);
              }
              return;

              //listContentType.DeleteObject();
              //context.ExecuteQuery();
              //listContentType = null;
            }
          }
          if (listContentType == null)
          {
            var webContentTypes = context.LoadQuery(web.AvailableContentTypes.Where(ct => ct.Name == ctName));
            try
            {
              context.ExecuteQuery();
              webContentType = webContentTypes.FirstOrDefault();
            }
            catch
            {
              webContentType = null;
            }
          }
        }

        if (ContentType.Level == ProvisionLevel.Web)
        {
          if ((overwrite || ContentType.Behavior == ProvisionBehavior.Overwrite) && webContentType != null /*&& webContentType.Group == ContentType.Group*/)
          {
            OnProvisioned?.Invoke(this, webContentType);
            return;

            //webContentType.DeleteObject();
            //context.ExecuteQuery();
            //webContentType = null;
          }
          else if (webContentType == null && newContentType != null)
          {
            contentType = web.ContentTypes.Add(newContentType);
            OnProvisioning?.Invoke(this, contentType);
            contentType.Update(false);
            webContentType = contentType;
          }
        }
        else if (ContentType.Level == ProvisionLevel.List)
        {
          if (list != null && List.Behavior != ProvisionBehavior.None)
          {
            if (webContentType != null)
            {
              contentType = list.ContentTypes.AddExistingContentType(webContentType);
            }
            else if (listContentType == null && newContentType != null)
            {
              contentType = list.ContentTypes.Add(newContentType);
              OnProvisioning?.Invoke(this, contentType);
              contentType.Update(false);
            }
          }
        }

        if (contentType != null)
        {
          context.Load(contentType);
          context.ExecuteQuery();
          //if (newContentType != null)
          //{
          OnProvisioned?.Invoke(this, contentType);
          //}
        }
      }
    }
  }
}

