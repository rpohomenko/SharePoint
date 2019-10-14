using Microsoft.SharePoint.Client;
using SP.Client.Linq.Attributes;
using System;

namespace SP.Client.Linq.Provisioning
{
    public sealed class ListProvisionHandler<TContext, TEntity> : SpProvisionHandler<TContext, TEntity>
        where TContext : class, ISpEntryDataContext
        where TEntity : class, IListItemEntity, new()
    {
        public ListAttribute List { get; }

        public event Action<ListProvisionHandler<TContext, TEntity>, List> OnProvisioning;

        public event Action<ListProvisionHandler<TContext, TEntity>, List> OnProvisioned;

        public event Action<ListProvisionHandler<TContext, TEntity>, List> OnUnProvisioning;

        public event Action<ListProvisionHandler<TContext, TEntity>, List> OnUnProvisioned;

        internal ListProvisionHandler(ListAttribute list, SpProvisionModel<TContext, TEntity> model) : base(model)
        {
            List = list;
        }

        public override void Provision(bool forceOverwrite)
        {
            if (List != null && Model != null && Model.Context != null && Model.Context.Context != null)
            {
                if (List.Behavior == ProvisionBehavior.None) return;
                var context = Model.Context.Context;
                Web web = context.Web;
                List list = null;
                if (List.Id != default)
                {
                    list = web.Lists.GetById(List.Id);
                }
                else if (List.Url != null)
                {
                    list = web.GetList($"{ new Uri(Model.Context.SiteUrl).LocalPath.TrimEnd('/')}/{List.Url.TrimStart('/')}");
                }
                else if (!string.IsNullOrEmpty(List.Title))
                {
                    list = web.Lists.GetByTitle(List.Title);
                }
                if (list != null)
                {
                    context.Load(list);
                    try
                    {
                        context.ExecuteQuery();
                    }
                    catch (Exception)
                    {
                        list = null;
                    }
                }
                if (list != null)
                {
                    if (forceOverwrite || List.Behavior == ProvisionBehavior.Overwrite)
                    {
                        if (list.Title != List.Title)
                        {
                            list.Title = List.Title;
                            OnProvisioning?.Invoke(this, list);
                            list.Update();
                        }
                        //context.Load(list);
                        context.ExecuteQuery();
                        OnProvisioned?.Invoke(this, list);
                        return;
                    }
                }
                else
                {
                    var newList = new ListCreationInformation()
                    {
                        Title = List.Title,
                        Url = List.Url,
                        TemplateType = (int)List.Type,
                        TemplateFeatureId = List.TemplateFeatureId
                    };

                    list = web.Lists.Add(newList);
                    OnProvisioning?.Invoke(this, list);
                    list.Update();
                    context.Load(list);
                    context.ExecuteQuery();
                }
                List.Id = list.Id;
                OnProvisioned?.Invoke(this, list);
            }
        }

        public override void UnProvision()
        {
            if (List != null && Model != null && Model.Context != null && Model.Context.Context != null)
            {
                if (List.Behavior == ProvisionBehavior.None) return;
                var context = Model.Context.Context;
                Web web = context.Web;
                List list = null;
                if (List.Id != default)
                {
                    list = web.Lists.GetById(List.Id);
                }
                else if (List.Url != null)
                {
                    list = web.GetList($"{ new Uri(Model.Context.SiteUrl).LocalPath.TrimEnd('/')}/{List.Url.TrimStart('/')}");
                }
                else if (!string.IsNullOrEmpty(List.Title))
                {
                    list = web.Lists.GetByTitle(List.Title);
                }
                if (list != null)
                {
                    context.Load(list);
#if !SP2013
                    context.Load(list, l => l.AllowDeletion);
#endif
                    try
                    {
                        context.ExecuteQuery();
                    }
                    catch (Exception)
                    {
                        list = null;
                    }
                }
                if (list != null)
                {
#if !SP2013
                    if (list.AllowDeletion)
#endif
                    {
                        if (OnUnProvisioning != null)
                        {
                            OnUnProvisioning.Invoke(this, list);
                        }
                        list.DeleteObject();
                        context.ExecuteQuery();
                        if (OnUnProvisioned != null)
                        {
                            OnUnProvisioned.Invoke(this, list);
                        }
                    }
                }
            }
        }
    }
}

