using SP.Client.Linq.Query;
using System;

namespace SP.Client.Linq
{
    public interface ISpEntityLookup: ICloneable
    {
        SpQueryArgs<ISpEntryDataContext> SpQueryArgs { get; }

        ISpEntryDataContext Context { get; }

        int EntityId { get; set; }

        Type EntityType { get; }

        bool Update();
    }

    public interface ISpEntityLookup<TEntity> : ISpEntityLookup
     where TEntity : class, IListItemEntity, new()
    {
        TEntity GetEntity();
        void SetEntity(TEntity entity);
        bool NotEquals(int entityId);

        bool Equals(int entityId);
    }
}
