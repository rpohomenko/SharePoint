using System.Collections.Generic;

namespace SP.Client.Linq.Infrastructure
{
    public interface ISpChangeTrackable<TEntity, TContext>
    where TEntity : class, IListItemEntity
     where TContext : class, ISpEntryDataContext
    {
        //IEnumerable<SpEntityEntry<TEntity, TContext>> Entries();
    }
}

