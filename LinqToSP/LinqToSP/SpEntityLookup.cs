﻿using Microsoft.SharePoint.Client;
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
            get; set;
        }

        public Type EntityType => typeof(TEntity);

        public SpEntityLookup()
               : this(0, (ISpEntryDataContext)null)
        {
        }

        public SpEntityLookup(ISpEntryDataContext context)
                : this(0, context)
        {
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
            if (Entity == null)
            {
                Entity = GetEntity();
            }
            if (Entity != null)
            {
                var entry = new SpEntityEntry<TEntity, ISpEntryDataContext>(Entity, SpQueryArgs);
                if (EntityId > 0 && EntityId != Entity.Id)
                {
                    entry.EntityId = EntityId;
                    entry.Reload(true);
                }
                entry.OnAfterSaveChanges += Entry_OnAfterSaveChanges;
                return entry;
            }
            return null;
        }

        public TEntity GetEntity()
        {
            if (EntityId > 0)
            {
                if (Context == null)
                {
                    throw new ArgumentNullException(nameof(SpQueryArgs.Context));
                }
                return Context.List<TEntity>(SpQueryArgs).FirstOrDefault(entity => entity.Id == EntityId);
            }

            return null;
        }

        public void SetEntity(TEntity entity)
        {
            if (entity != null && !Equals(entity, Entity))
            {
                Entity = entity;
            }
            EntityId = entity != null ? entity.Id : 0;
        }

        public bool Update()
        {
            var entry = GetEntry();
            if (entry != null)
            {
                return entry.Update();
            }
            return false;
        }
    }
}
