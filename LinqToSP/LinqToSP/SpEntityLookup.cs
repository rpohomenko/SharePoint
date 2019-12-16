using Microsoft.SharePoint.Client;
using SP.Client.Extensions;
using SP.Client.Linq.Attributes;
using SP.Client.Linq.Infrastructure;
using SP.Client.Linq.Query;
using System;
using System.Collections.Generic;
using System.Linq;

namespace SP.Client.Linq
{
    public sealed class SpEntityLookup<TEntity> : ISpEntityLookup<TEntity>
         where TEntity : class, IListItemEntity, new()
    {
        private int _entityId;
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

        public TEntity Entity
        {
            get; private set;
        }

        public int EntityId
        {
            get
            {
                return _entityId;
            }
            set
            {
                if (value != _entityId)
                {
                    _entityId = value;
                    Entity = null;
                    Entry = null;
                }
            }
        }

        public SpEntityEntry<TEntity, ISpEntryDataContext> Entry { get; private set; }

        public Type EntityType => typeof(TEntity);

        public SpEntityLookup()
               : this(0, (ISpEntryDataContext)null)
        {
        }

        public SpEntityLookup(ISpEntryDataContext context)
                : this(0, context)
        {
        }

        private void Entry_OnBeforeSaveChanges(SpEntityEntry<TEntity, ISpEntryDataContext> entry, ListItem item)
        {
            entry.OnBeforeSaveChanges -= Entry_OnBeforeSaveChanges;
        }

        private void Entry_OnAfterSaveChanges(SpEntityEntry<TEntity, ISpEntryDataContext> entry, ListItem item)
        {
            EntityId = item.Id;
            entry.OnAfterSaveChanges -= Entry_OnAfterSaveChanges;
        }

        public SpEntityLookup(int entityId, ISpEntryDataContext context)
        {
            EntityId = entityId;
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

        public SpEntityLookup(string listTitle)
                  : this(0, null, listTitle)
        {
        }

        public SpEntityLookup(Uri listUrl)
         : this(0, null, listUrl)
        {
        }

        public SpEntityLookup(Guid listId)
          : this(0, null, listId)
        {
        }

        public SpEntityLookup(int entityId, string listTitle)
                   : this(entityId, null, listTitle)
        {
        }

        public SpEntityLookup(int entityId, Uri listUrl)
         : this(entityId, null, listUrl)
        {
        }

        public SpEntityLookup(int entityId, Guid listId)
          : this(entityId, null, listId)
        {
        }

        public SpEntityLookup(int entityId, ISpEntryDataContext context, string listTitle)
           : this(entityId, new SpQueryArgs<ISpEntryDataContext>(context, listTitle, null, default, null))
        {
        }

        public SpEntityLookup(int entityId, ISpEntryDataContext context, Uri listUrl)
         : this(entityId, new SpQueryArgs<ISpEntryDataContext>(context, null, Convert.ToString(listUrl), default, null))
        {
        }

        public SpEntityLookup(int entityId, ISpEntryDataContext context, Guid listId)
          : this(entityId, new SpQueryArgs<ISpEntryDataContext>(context, null, null, listId, null))
        {
        }

        internal SpEntityLookup(int entityId, SpQueryArgs<ISpEntryDataContext> args)
        {
            EntityId = entityId;
            SpQueryArgs = args;
        }

        private static IEnumerable<KeyValuePair<string, FieldAttribute>> GetFieldAttributes()
        {
            return AttributeHelper.GetFieldAttributes<TEntity, FieldAttribute>()
              .Concat(AttributeHelper.GetPropertyAttributes<TEntity, FieldAttribute>())
              .Select(f => new KeyValuePair<string, FieldAttribute>(f.Key.Name, f.Value));
        }

        private SpEntityEntry<TEntity, ISpEntryDataContext> GetEntry()
        {
            if (Entity != null)
            {
                var entry = new SpEntityEntry<TEntity, ISpEntryDataContext>(Entity, SpQueryArgs);
                entry.OnBeforeSaveChanges += Entry_OnBeforeSaveChanges;
                entry.OnAfterSaveChanges += Entry_OnAfterSaveChanges;
                return entry;
            }
            return null;
        }

        public TEntity GetEntity()
        {
            if (Entity != null)
            {
                if (Entry == null)
                {
                    Entry = GetEntry();
                }
                return Entity;
            }
            if (EntityId > 0)
            {
                if (Context == null)
                {
                    return null;
                    //throw new ArgumentNullException(nameof(Context));
                }
                Entity = Context.List<TEntity>(SpQueryArgs).FirstOrDefault(entity => entity.Id == EntityId);
                Entry = GetEntry();
                return Entity;
            }

            return null;
        }

        public void SetEntity(TEntity entity)
        {
            EntityId = entity != null ? entity.Id : 0;
            Entity = entity;
            Entry = GetEntry();
        }

        public bool Update()
        {
            if (this.Context == null)
            {
                Check.NotNull(this.Context, nameof(this.Context));
            }
            if (Entry != null)
            {
                if (Entry.Context == null)
                {
                    Entry.Context = this.Context;
                }
                if (Entry.State == EntityState.Detached)
                {
                    Entry.Attach();
                }
                return Entry.Update();
            }

            return false;
        }

        public static bool operator ==(int entityId, SpEntityLookup<TEntity> entityLookup) { return false; }
        public static bool operator !=(int entityId, SpEntityLookup<TEntity> entityLookup) { return false; }
        public static bool operator ==(SpEntityLookup<TEntity> entityLookup, int entityId) { return false; }
        public static bool operator !=(SpEntityLookup<TEntity> entityLookup, int entityId) { return false; }

        public static implicit operator int(SpEntityLookup<TEntity> entityLookup) { return entityLookup.EntityId; }
        public static explicit operator SpEntityLookup<TEntity>(int entityId) => new SpEntityLookup<TEntity>() { EntityId = entityId };

        public bool NotEquals(int entityId)
        {
            return this.EntityId != entityId;
        }

        public bool Equals(int entityId)
        {
            return this.EntityId == entityId;
        }

        public override bool Equals(object obj)
        {
            return this.EntityId.Equals(((SpEntityLookup<TEntity>)obj).EntityId);
        }

        public override int GetHashCode()
        {
            return this.EntityId.GetHashCode();
        }

        public object Clone()
        {
            return this.MemberwiseClone();
        }
    }
}
