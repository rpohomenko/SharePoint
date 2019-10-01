using Microsoft.SharePoint.Client;
using SP.Client.Linq.Attributes;
using System;

namespace SP.Client.Linq.Provisioning
{
    public sealed class ListProvisionHandler<TContext, TEntity> : SpProvisionHandler<TContext, TEntity>
        where TContext : class, ISpEntryDataContext
        where TEntity : class, IListItemEntity
    {
        private readonly ListAttribute List;

        public event Action<ListProvisionHandler<TContext, TEntity>, List> OnProvisioning;

        public event Action<ListProvisionHandler<TContext, TEntity>, List> OnProvisioned;

        public ListProvisionHandler(ListAttribute list, SpProvisionModel<TContext, TEntity> model) : base(model)
        {
            List = list;
        }

        public override void Provision()
        {
            if (List != null && Model != null && Model.Context != null && Model.Context.Context != null)
            {
                var context = Model.Context.Context;
                Web web = context.Web;
                List list = List.Url != null
                        ? context.Web.GetList($"{ Model.Context.SiteUrl.TrimEnd('/')}/{List.Url.TrimStart('/')}")
                        : (List.Title != null ? context.Web.Lists.GetByTitle(List.Title) : null);

                context.Load(list);
                try
                {
                    context.ExecuteQuery();
                    OnProvisioned?.Invoke(this, list);
                    return;
                }
                catch (Exception)
                {
                    list = null;
                }

                var newList = new ListCreationInformation()
                {
                    Title = List.Title,
                    Url = List.Url,
                    TemplateType = (int)List.Type
                };

                list = web.Lists.Add(newList);
                OnProvisioning?.Invoke(this, list);
                list.Update();
                context.Load(list);
                context.ExecuteQuery();
                OnProvisioned?.Invoke(this, list);
            }
        }
    }
}

