using SP.Client.Linq.Attributes;
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

        bool Update();
    }

    public interface ISpEntityLookupCollection<TEntity> : IEnumerable<ISpEntityLookup<TEntity>>, ISpEntityLookupCollection
      where TEntity : class, IListItemEntity, new()
    {
        ICollection<TEntity> GetEntities();
        void SetEntities(ICollection<TEntity> entities);
    }

    public sealed class SpEntityLookupCollection<TEntity> : ISpEntityLookupCollection<TEntity>
        where TEntity : class, IListItemEntity, new()
    {
        private int[] _entityIds;

        public SpQueryArgs<ISpEntryDataContext> SpQueryArgs { get; }

        public ISpEntryDataContext Context
        {
            get
            {
                return SpQueryArgs == null ? null : SpQueryArgs.Context;
            }
            internal set
            {
                if (SpQueryArgs != null)
                {
                    SpQueryArgs.Context = value;
                }
            }
        }

        public int[] EntityIds
        {
            get
            {
                return _entityIds;
            }
            set
            {
                if (_entityIds != value)
                {
                    _entityIds = value;
                    Entities = null;
                }
            }
        }

        public ICollection<TEntity> Entities { get; private set; }

        public Type EntityType => typeof(TEntity);

        internal SpEntityLookupCollection(SpQueryArgs<ISpEntryDataContext> args)
        {
            SpQueryArgs = args;
        }

        public SpEntityLookupCollection()
        : this((ISpEntryDataContext)null)
        {
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

        public SpEntityLookupCollection(ISpEntryDataContext context)
        {
            var listAtt = AttributeHelper.GetCustomAttributes<TEntity, ListAttribute>(false).FirstOrDefault();
            if (listAtt != null)
            {
                SpQueryArgs = new SpQueryArgs<ISpEntryDataContext>(context, listAtt.Title, listAtt.Url, default, null);
                foreach (var att in GetFieldAttributes())
                {
                    if (!SpQueryArgs.FieldMappings.ContainsKey(att.Key))
                    {
                        SpQueryArgs.FieldMappings.Add(att.Key, att.Value);
                    }
                }
            }
        }

        private static IEnumerable<KeyValuePair<string, FieldAttribute>> GetFieldAttributes()
        {
            return AttributeHelper.GetFieldAttributes<TEntity, FieldAttribute>()
              .Concat(AttributeHelper.GetPropertyAttributes<TEntity, FieldAttribute>())
              .Select(f => new KeyValuePair<string, FieldAttribute>(f.Key.Name, f.Value));
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
            IEnumerable<SpEntityLookup<TEntity>> result;
            if (Entities == null)
            {
                result = (EntityIds == null
                        ? Enumerable.Empty<SpEntityLookup<TEntity>>()
                        : EntityIds.Select(entityId => new SpEntityLookup<TEntity>(entityId, SpQueryArgs)));
            }
            else
            {
                result = new List<SpEntityLookup<TEntity>>();
                foreach (var entity in Entities)
                {
                    var lookup = new SpEntityLookup<TEntity>(entity.Id, SpQueryArgs);
                    lookup.SetEntity(entity);
                    (result as List<SpEntityLookup<TEntity>>).Add(lookup);
                }
            }
            return result.GetEnumerator();
        }
        public ICollection<TEntity> GetEntities()
        {
            if (Entities != null)
            {
                return Entities;
            }
            if (EntityIds != null && EntityIds.Length > 0)
            {
                if (Context == null)
                {
                    throw new ArgumentNullException(nameof(Context));
                }
                Entities = Context.List<TEntity>(SpQueryArgs).Where(entity => entity.Includes(item => item.Id, EntityIds)).ToArray();
                return Entities;
            }

            return null;
        }

        public void SetEntities(ICollection<TEntity> entities)
        {
            EntityIds = entities == null ? null : entities.Where(entity => entity.Id > 0).Select(entity => entity.Id).ToArray();
            Entities = entities == null ? null : entities;
        }

        public void Clear()
        {
            EntityIds = null;
            Entities = null;
        }

        public bool Update()
        {
            bool updated = false;
            foreach (var lookupItem in this)
            {
                updated = lookupItem.Update() || updated;
            }
            return updated;
        }
    }
}
