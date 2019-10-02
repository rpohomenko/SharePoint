using Microsoft.SharePoint.Client;
using SP.Client.Extensions;
using SP.Client.Linq.Attributes;
using System;

namespace SP.Client.Linq.Provisioning
{
  public sealed class ListProvisionHandler<TContext, TEntity> : SpProvisionHandler<TContext, TEntity>
      where TContext : class, ISpEntryDataContext
      where TEntity : class, IListItemEntity
  {
    public ListAttribute List { get; }

    public event Action<ListProvisionHandler<TContext, TEntity>, List> OnProvisioning;

    public event Action<ListProvisionHandler<TContext, TEntity>, List> OnProvisioned;

    public ListProvisionHandler(ListAttribute list, SpProvisionModel<TContext, TEntity> model) : base(model)
    {
      List = list;
    }

    public override void Provision(bool overwrite)
    {
      if (List != null && Model != null && Model.Context != null && Model.Context.Context != null)
      {
        var context = Model.Context.Context;
        Web web = context.Web;
        List list = null;
        if(List.Id != default)
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
          if (overwrite)
          {
            list.DeleteObject();
            //try
            //{
            context.ExecuteQuery();
            list = null;
            //}
            //catch (Exception)
            //{
            //}
          }
        }
        if (list != null)
        {
          OnProvisioned?.Invoke(this, list);
          return;
        }

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
        List.Id = list.Id;
        OnProvisioned?.Invoke(this, list);
      }
    }
  }
}

