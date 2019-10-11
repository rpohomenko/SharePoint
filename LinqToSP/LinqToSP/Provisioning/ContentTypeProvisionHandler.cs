using Microsoft.SharePoint.Client;
using SP.Client.Linq.Attributes;
using System;
using System.Linq;

namespace SP.Client.Linq.Provisioning
{
    public sealed class ContentTypeProvisionHandler<TContext, TEntity> : SpProvisionHandler<TContext, TEntity>
        where TContext : class, ISpEntryDataContext
        where TEntity : class, IListItemEntity, new()
    {
        public ContentTypeAttribute ContentType { get; }
        public ListAttribute List { get; }

        public event Action<ContentTypeProvisionHandler<TContext, TEntity>, ContentType> OnProvisioning;

        public event Action<ContentTypeProvisionHandler<TContext, TEntity>, ContentType> OnProvisioned;

        public event Action<ContentTypeProvisionHandler<TContext, TEntity>, ContentType> OnUnProvisioning;

        public event Action<ContentTypeProvisionHandler<TContext, TEntity>, ContentType> OnUnProvisioned;


        internal ContentTypeProvisionHandler(ContentTypeAttribute contentType, SpProvisionModel<TContext, TEntity> model) : this(contentType, null, model)
        {
        }

        internal ContentTypeProvisionHandler(ContentTypeAttribute contentType, ListAttribute list, SpProvisionModel<TContext, TEntity> model) : base(model)
        {
            ContentType = contentType;
            List = list;
        }

        public override void Provision(bool forceOverwrite)
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

                        if ((forceOverwrite || ContentType.Behavior == ProvisionBehavior.Overwrite) && listContentType != null)
                        {
                            if (!listContentType.ReadOnly && !listContentType.Sealed)
                            {
                                if (listContentType.Name != ContentType.Name || (!string.IsNullOrEmpty(ContentType.Group) && listContentType.Group != ContentType.Group))
                                {
                                    listContentType.Name = ContentType.Name;
                                    listContentType.Group = ContentType.Group;
                                    OnProvisioning?.Invoke(this, listContentType);
                                    listContentType.Update(false);
                                }
                            }

                            if (!listContentType.Sealed)
                            {
                                OnProvisioned?.Invoke(this, listContentType);
                            }
                            return;
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
                    if (ContentType.Level == ProvisionLevel.List && list != null)
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

                        if ((forceOverwrite || ContentType.Behavior == ProvisionBehavior.Overwrite) && listContentType != null)
                        {
                            if (!listContentType.ReadOnly && !listContentType.Sealed)
                            {
                                if (listContentType.Name != ContentType.Name || (!string.IsNullOrEmpty(ContentType.Group) && listContentType.Group != ContentType.Group))
                                {
                                    listContentType.Name = ContentType.Name;
                                    listContentType.Group = ContentType.Group;
                                    OnProvisioning?.Invoke(this, listContentType);
                                    listContentType.Update(false);
                                }
                            }
                            if (!listContentType.Sealed)
                            {
                                OnProvisioned?.Invoke(this, listContentType);
                            }
                            return;
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
                    if ((forceOverwrite || ContentType.Behavior == ProvisionBehavior.Overwrite) && webContentType != null /*&& webContentType.Group == ContentType.Group*/)
                    {
                        if (!webContentType.ReadOnly && !webContentType.Sealed)
                        {
                            if (webContentType.Name != ContentType.Name || (!string.IsNullOrEmpty(ContentType.Group) && webContentType.Group != ContentType.Group))
                            {
                                webContentType.Name = ContentType.Name;
                                webContentType.Group = ContentType.Group;
                                OnProvisioning?.Invoke(this, webContentType);
                                webContentType.Update(false);
                            }
                        }
                        if (!webContentType.Sealed)
                        {
                            OnProvisioned?.Invoke(this, webContentType);
                        }
                        return;
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

        public override void UnProvision()
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
                ContentType webContentType = null;
                ContentType listContentType = null;

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

                string ctName = ContentType.Name;
                string ctId = ContentType.Id;

                if (!string.IsNullOrEmpty(ctId))
                {
                    if (list != null)
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
                    }
                    if (ContentType.Level == ProvisionLevel.Web)
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
                    }
                    if (ContentType.Level == ProvisionLevel.Web)
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

                if (listContentType != null)
                {
                    if (!listContentType.ReadOnly && !listContentType.Sealed)
                    {
                        OnUnProvisioning?.Invoke(this, listContentType);
                        listContentType.DeleteObject();
                        context.ExecuteQuery();
                        OnUnProvisioned?.Invoke(this, listContentType);
                    }
                }
                if (webContentType != null)
                {
                    if (!webContentType.ReadOnly && !webContentType.Sealed)
                    {
                        OnUnProvisioning?.Invoke(this, webContentType);
                        webContentType.DeleteObject();
                        context.ExecuteQuery();
                        OnUnProvisioned?.Invoke(this, webContentType);
                    }
                }
            }
        }
    }
}

