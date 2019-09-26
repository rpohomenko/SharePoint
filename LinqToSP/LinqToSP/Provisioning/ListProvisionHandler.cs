using Microsoft.SharePoint.Client;
using SP.Client.Linq.Attributes;
using System;

namespace SP.Client.Linq.Provisioning
{
    public sealed class ListProvisionHandler<TContext, TEntity> : SpProvisionHandler<TContext, TEntity>
        where TContext : class, ISpEntryDataContext
        where TEntity : class, IListItemEntity
    {
        private readonly ListAttribute _list;

        public event Action<ListProvisionHandler<TContext, TEntity>, List> OnProvisioning;

        public event Action<ListProvisionHandler<TContext, TEntity>, List> OnProvisioned;

        public ListProvisionHandler(ListAttribute list, SpProvisionModel<TContext, TEntity> model) : base(model)
        {
            _list = list;
        }

        public override void Provision()
        {
            if (_list != null && Model != null && Model.Context != null && Model.Context.Context != null)
            {
                var context = Model.Context.Context;
                Web web = context.Web;
                List list = _list.Url != null
                        ? context.Web.GetList($"{ Model.Context.SiteUrl.TrimEnd('/')}/{_list.Url.TrimStart('/')}")
                        : (_list.Title != null ? context.Web.Lists.GetByTitle(_list.Title) : null);

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
                    Title = _list.Title,
                    Url = _list.Url,
                    TemplateType = (int)_list.Type
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

