using SP.Client.Linq.Infrastructure;
using SP.Client.Linq.Provisioning;
using SP.Client.Linq.Query;
using System;
using System.Linq;

namespace SP.Client.Linq
{
    public interface ISpEntryDataContext : ISpDataContext
    {
        event Action<ISpEntryDataContext, SpSaveArgs> OnBeforeSaveChanges;

        event Action<ISpEntryDataContext, SpSaveArgs> OnAfterSaveChanges;

        bool SaveChanges();
        IQueryable<TListItem> List<TListItem>(SpQueryArgs<ISpEntryDataContext> args) where TListItem : class, IListItemEntity, new();

        TProvisionModel CreateModel<TProvisionModel, TDataContext, TEntity>()
        where TProvisionModel : SpProvisionModel<TDataContext, TEntity>
        where TDataContext : class, ISpEntryDataContext
        where TEntity : class, IListItemEntity, new();
    }
}
