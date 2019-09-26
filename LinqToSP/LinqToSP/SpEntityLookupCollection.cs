using SP.Client.Linq.Query;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;

namespace SP.Client.Linq
{
    public interface ISpEntityLookupCollection : IEnumerable<ISpEntityLookup>
    {
        SpQueryArgs<ISpEntryDataContext> SpQueryArgs { get; }

        int[] EntityIds { get; set; }

        Type EntityType { get; }
    }

    public interface ISpEntityLookupCollection<TEntityLookup, TEntity> : IEnumerable<ISpEntityLookup<TEntity>>, ISpEntityLookupCollection
      where TEntity : class, IListItemEntity
      where TEntityLookup : class, ISpEntityLookup
    {

    }

    public sealed class SpEntityLookupCollection<TEntity> : ISpEntityLookupCollection<ISpEntityLookup<TEntity>, TEntity>
        where TEntity : class, IListItemEntity
    {
        public SpQueryArgs<ISpEntryDataContext> SpQueryArgs { get; }

        public int[] EntityIds { get; set; }

        public Type EntityType => typeof(TEntity);

        internal SpEntityLookupCollection(SpQueryArgs<ISpEntryDataContext> args)
        {
            SpQueryArgs = args;
        }

        public SpEntityLookupCollection(string listTitle)
           : this(new SpQueryArgs<ISpEntryDataContext>(null, listTitle, null, default, null))
        {
        }

        public SpEntityLookupCollection(Uri listUrl)
         : this(new SpQueryArgs<ISpEntryDataContext>(null, null, Convert.ToString(listUrl), default, null))
        {
        }

        public SpEntityLookupCollection(Guid listId)
          : this(new SpQueryArgs<ISpEntryDataContext>(null, null, null, listId, null))
        {
        }

        public SpEntityLookupCollection(ISpEntryDataContext context, string listTitle)
            : this(new SpQueryArgs<ISpEntryDataContext>(context, listTitle, null, default, null))
        {
        }

        public SpEntityLookupCollection(ISpEntryDataContext context, Uri listUrl)
         : this(new SpQueryArgs<ISpEntryDataContext>(context, null, Convert.ToString(listUrl), default, null))
        {
        }

        public SpEntityLookupCollection(ISpEntryDataContext context, Guid listId)
          : this(new SpQueryArgs<ISpEntryDataContext>(context, null, null, listId, null))
        {
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return GetEnumerator();
        }

        IEnumerator<ISpEntityLookup> IEnumerable<ISpEntityLookup>.GetEnumerator()
        {
            return GetEnumerator();
        }

        IEnumerator<ISpEntityLookup<TEntity>> IEnumerable<ISpEntityLookup<TEntity>>.GetEnumerator()
        {
            return GetEnumerator();
        }

        public IEnumerator<ISpEntityLookup<TEntity>> GetEnumerator()
        {
            var result = EntityIds == null
                 ? Enumerable.Empty<SpEntityLookup<TEntity>>()
                 : EntityIds.Select(entityId => new SpEntityLookup<TEntity>(entityId, SpQueryArgs));
            return result.GetEnumerator();
        }
    }
}
