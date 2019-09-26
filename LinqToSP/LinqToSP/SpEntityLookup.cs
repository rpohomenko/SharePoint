using SP.Client.Linq.Attributes;
using SP.Client.Linq.Infrastructure;
using SP.Client.Linq.Query;
using System;
using System.Linq;

namespace SP.Client.Linq
{
    public sealed class SpEntityLookup<TEntity> : ISpEntityLookup<TEntity>
         where TEntity : class, IListItemEntity
    {
        public SpQueryArgs<ISpEntryDataContext> SpQueryArgs { get; }

        public int EntityId { get; set; }

        public Type EntityType => typeof(TEntity);

        public SpEntityLookup()
               : this(0, (ISpEntryDataContext)null)
        {
        }

        public SpEntityLookup(ISpEntryDataContext context)
                : this(0, context)
        {
        }

        public SpEntityLookup(int entityId, ISpEntryDataContext context)
        {
            EntityId = entityId;
            var listAtt = AttributeHelper.GetCustomAttributes<TEntity, ListAttribute>(false).FirstOrDefault();
            if (listAtt != null)
            {
                SpQueryArgs = new SpQueryArgs<ISpEntryDataContext>(context, listAtt.Title, listAtt.Url, default, null);
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

        public TEntity GetEntity()
        {
            if (EntityId > 0 && SpQueryArgs != null)
            {
                if (SpQueryArgs.Context == null)
                {
                    throw new ArgumentNullException(nameof(SpQueryArgs.Context));
                }
                return (SpQueryArgs.Context.List<TEntity>(SpQueryArgs) as ISpRepository<TEntity>).Find(EntityId);
            }

            return null;
        }

        public void SetEntity(TEntity entity)
        {
            if (entity != null)
            {
                EntityId = entity.Id;
            }
        }

        public SpEntityEntry<TEntity, ISpEntryDataContext> GetEntry()
        {
            if (EntityId > 0 && SpQueryArgs != null)
            {
                if (SpQueryArgs.Context == null)
                {
                    throw new ArgumentNullException(nameof(SpQueryArgs.Context));
                }
                return SpQueryArgs.Context.List<TEntity>(SpQueryArgs).GetEntry(GetEntity());
            }
            return null;
        }
    }
}
