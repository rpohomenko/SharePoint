﻿using SP.Client.Linq.Infrastructure;
using SP.Client.Linq.Query;
using System;

namespace SP.Client.Linq
{
    public interface ISpEntityLookup
    {
        SpQueryArgs<ISpEntryDataContext> SpQueryArgs { get; }
        int EntityId { get; set; }

        Type EntityType { get; }

        bool Update();
    }

    public interface ISpEntityLookup<TEntity> : ISpEntityLookup
     where TEntity : class, IListItemEntity, new()
    {
        TEntity GetEntity();
        void SetEntity(TEntity entity);
    }
}
