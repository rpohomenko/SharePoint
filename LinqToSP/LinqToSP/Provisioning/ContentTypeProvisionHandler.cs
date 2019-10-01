using Microsoft.SharePoint.Client;
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
        private readonly ContentTypeAttribute _contentType;
        private readonly ListAttribute _list;

        public event Action<ContentTypeProvisionHandler<TContext, TEntity>, ContentType> OnProvisioning;

        public event Action<ContentTypeProvisionHandler<TContext, TEntity>, ContentType> OnProvisioned;

        public ContentTypeProvisionHandler(ContentTypeAttribute contentType, SpProvisionModel<TContext, TEntity> model) : this(contentType, null, model)
        {
        }

        public ContentTypeProvisionHandler(ContentTypeAttribute contentType, ListAttribute list, SpProvisionModel<TContext, TEntity> model) : base(model)
        {
            _contentType = contentType;
            _list = list;
        }

        public override void Provision()
        {
            if (_contentType != null && Model != null && Model.Context != null && Model.Context.Context != null)
            {
                var context = Model.Context.Context;
                Web web = context.Web;
                List list = null;
                ContentType parentContentType = null;
                ContentType contentType = null;
                ContentType webContentType = null;
                ContentType listContentType = null;

                if (string.IsNullOrEmpty(_contentType.Id) && !string.IsNullOrEmpty(_contentType.ParentId))
                {
                    parentContentType = web.AvailableContentTypes.GetById(_contentType.ParentId);
                    context.Load(parentContentType);
                    context.ExecuteQuery();
                }

                if (_list != null)
                {
                    list = _list.Url != null
                                         ? context.Web.GetList($"{ Model.Context.SiteUrl.TrimEnd('/')}/{_list.Url.TrimStart('/')}")
                                         : (_list.Title != null ? context.Web.Lists.GetByTitle(_list.Title) : null);
                }

                var newContentType = !string.IsNullOrEmpty(_contentType.Name)
                    ? new ContentTypeCreationInformation()
                    {
                        Id = _contentType.Id,
                        Name = _contentType.Name,
                        Group = _contentType.Group,
                        ParentContentType = parentContentType
                    } : null;

                string ctName = _contentType.Name;
                string ctId = _contentType.Id;
                if (!string.IsNullOrEmpty(ctId))
                {
                    if (list != null)
                    {
                        var listContentTypes = context.LoadQuery(list.ContentTypes.Where(ct => ct.Id.StringValue == ctId || ct.Parent.Id.StringValue == ctId));
                        try
                        {
                            context.ExecuteQuery();
                            listContentType = listContentTypes.FirstOrDefault();
                        }
                        catch { }
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
                        catch {
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
                        }
                        catch { }
                    }
                    if (listContentType == null)
                    {
                        var webContentTypes = context.LoadQuery(web.AvailableContentTypes.Where(ct => ct.Name == ctName));
                        try
                        {
                            context.ExecuteQuery();
                            webContentType = webContentTypes.FirstOrDefault();
                        }
                        catch {
                            webContentType = null;
                        }
                    }
                }

                if (list != null)
                {
                    if (webContentType != null)
                    {
                        contentType = list.ContentTypes.AddExistingContentType(webContentType);
                    }
                    else if (listContentType == null)
                    {
                        if (newContentType != null)
                        {
                            contentType = list.ContentTypes.Add(newContentType);
                            OnProvisioning?.Invoke(this, contentType);
                            contentType.Update(false);
                        }
                    }
                }
                else
                {
                    if (webContentType != null)
                    {
                        //OnProvisioned?.Invoke(this, webContentType);
                        return;
                    }
                    else if (newContentType != null)
                    {
                        contentType = web.ContentTypes.Add(newContentType);
                        OnProvisioning?.Invoke(this, contentType);
                        contentType.Update(false);
                    }
                }
                if (contentType != null)
                {
                    context.Load(contentType);
                    context.ExecuteQuery();
                    OnProvisioned?.Invoke(this, contentType);
                }
            }
        }
    }
}

