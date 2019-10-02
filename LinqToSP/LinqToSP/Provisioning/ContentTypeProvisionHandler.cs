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

        var contentTypes = list != null ? list.ContentTypes : web.ContentTypes;

        if (!string.IsNullOrEmpty(ctId))
        {
          if (list != null)
          {
            var listContentTypes = context.LoadQuery(contentTypes.Where(ct => ct.Id.StringValue == ctId || ct.Parent.Id.StringValue == ctId));
            try
            {
              context.ExecuteQuery();
              listContentType = listContentTypes.FirstOrDefault();
            }
            catch { }

            if (overwrite && listContentType != null)
            {
              listContentType.DeleteObject();
              //try
              //{
              context.ExecuteQuery();
              listContentType = null;
              //}
              //catch { }
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
            var listContentTypes = context.LoadQuery(contentTypes.Where(ct => ct.Name == ctName));
            try
            {
              context.ExecuteQuery();
              listContentType = listContentTypes.FirstOrDefault();
            }
            catch { }

            if (overwrite && listContentType != null)
            {
              listContentType.DeleteObject();
              //try
              //{
              context.ExecuteQuery();
              listContentType = null;
              //}
              //catch { }
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

        if (list == null)
        {
          if (overwrite && webContentType != null && webContentType.Group == ContentType.Group)
          {
            webContentType.DeleteObject();
            //try
            //{
            context.ExecuteQuery();
            webContentType = null;
            //}
            //catch { }
          }

          if (webContentType == null && newContentType != null)
          {
            contentType = contentTypes.Add(newContentType);
            OnProvisioning?.Invoke(this, contentType);
            contentType.Update(false);
          }
        }
        else
        {
          if (webContentType != null)
          {
            contentType = contentTypes.AddExistingContentType(webContentType);
          }
          else if (listContentType == null && newContentType != null)
          {
            contentType = contentTypes.Add(newContentType);
            OnProvisioning?.Invoke(this, contentType);
            contentType.Update(false);
          }
        }

        if (contentType != null)
        {
          context.Load(contentType);
          context.ExecuteQuery();
          if (newContentType != null)
          {
            OnProvisioned?.Invoke(this, contentType);
          }
        }
      }
    }
  }
}

