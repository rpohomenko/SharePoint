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

                if (!string.IsNullOrEmpty(_contentType.ParentId))
                {
                    parentContentType = web.AvailableContentTypes.GetById(_contentType.ParentId);
                }

                if (_list != null)
                {
                    list = _list.Url != null
                                         ? context.Web.GetList($"{ Model.Context.SiteUrl.TrimEnd('/')}/{_list.Url.TrimStart('/')}")
                                         : (_list.Title != null ? context.Web.Lists.GetByTitle(_list.Title) : null);
                }

                var newContentType = new ContentTypeCreationInformation()
                {
                    Id = _contentType.Id,
                    Name = _contentType.Name,
                    Group = _contentType.Group,
                    ParentContentType = parentContentType
                };

                ContentType webContentType = null;
                ContentType listContentType = null;
                string ctName = _contentType.Name;
                if (string.IsNullOrEmpty(ctName))
                {
                    string ctId = _contentType.Id;
                    if (!string.IsNullOrEmpty(ctId))
                    {
                        IEnumerable<ContentType> webContentTypes = context.LoadQuery(web.AvailableContentTypes.Where(ct => ct.Id.StringValue == ctId));
                        IEnumerable<ContentType> listContentTypes = null;
                        if (list != null)
                        {
                            listContentTypes = context.LoadQuery(list.ContentTypes.Where(ct => ct.Id.StringValue == ctId || ct.Parent.Id.StringValue == ctId));
                        }

                        context.ExecuteQuery();

                        webContentType = webContentTypes.FirstOrDefault();
                        if (listContentTypes != null)
                        {
                            listContentType = listContentTypes.FirstOrDefault();
                        }
                    }
                    else
                    {
                        return;
                    }
                }
                else
                {
                    IEnumerable<ContentType> webContentTypes = context.LoadQuery(web.AvailableContentTypes.Where(ct => ct.Name == ctName));
                    IEnumerable<ContentType> listContentTypes = null;
                    if (list != null)
                    {
                        listContentTypes = context.LoadQuery(list.ContentTypes.Where(ct => ct.Name == ctName));
                    }

                    context.ExecuteQuery();

                    webContentType = webContentTypes.FirstOrDefault();
                    if (listContentTypes != null)
                    {
                        listContentType = listContentTypes.FirstOrDefault();
                    }
                }

                if (listContentType != null)
                {
                    OnProvisioned?.Invoke(this, listContentType);
                    return;
                }

                if (list != null)
                {
                    if (webContentType != null)
                    {
                        contentType = list.ContentTypes.AddExistingContentType(webContentType);
                    }
                    else
                    {
                        contentType = list.ContentTypes.Add(newContentType);
                        OnProvisioning?.Invoke(this, contentType);
                        contentType.Update(false);
                    }
                }
                else
                {
                    if (webContentType != null)
                    {
                        OnProvisioned?.Invoke(this, webContentType);
                        return;
                    }
                    else
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

