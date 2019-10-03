using JetBrains.Annotations;
using SP.Client.Linq.Attributes;
using SP.Client.Linq.Infrastructure;
using SP.Client.Linq.Query;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;

namespace SP.Client.Linq
{
    public sealed class SpEntitySet<TEntity> : SpEntityQueryable<TEntity>, ISpEntitySet<TEntity>
       where TEntity : class, IListItemEntity, new()
    {
        public SpQueryArgs<ISpEntryDataContext> SpQueryArgs
        {
            get
            {
                var executor = this.GetExecutor();
                if (executor != null)
                {
                    return executor.SpQueryArgs;
                }
                return null;
            }
        }

        public ISpEntryDataContext Context => SpQueryArgs != null ? SpQueryArgs.Context : null;

        public SpEntitySet() : this(GetQueryArgs(null, null))
        {
        }

        public SpEntitySet(string query)
           : this(GetQueryArgs(null, query))
        {
        }

        public SpEntitySet(ISpEntryDataContext context, string query)
          : this(GetQueryArgs(context, query))
        {
        }

        public SpEntitySet(string listTitle, string query)
            : this(null, listTitle, query)
        {
        }

        public SpEntitySet(Uri listUrl, string query)
         : this(null, listUrl, query)
        {
        }

        public SpEntitySet(Guid listId, string query)
          : this(null, listId, query)
        {
        }

        public SpEntitySet(ISpEntryDataContext context, string listTitle, string query)
           : this(new SpQueryArgs<ISpEntryDataContext>(context, listTitle, null, default, query))
        {
        }

        public SpEntitySet(ISpEntryDataContext context, Uri listUrl, string query)
         : this(new SpQueryArgs<ISpEntryDataContext>(context, null, Convert.ToString(listUrl), default, query))
        {
        }

        public SpEntitySet(ISpEntryDataContext context, Guid listId, string query)
          : this(new SpQueryArgs<ISpEntryDataContext>(context, null, null, listId, query))
        {
        }

        public SpEntitySet(SpEntitySet<TEntity> entitySet)
                : this(entitySet == null || !(entitySet.SpQueryArgs is SpQueryArgs<ISpEntryDataContext>)
                    ? GetQueryArgs(null, null)
                    : (SpQueryArgs<ISpEntryDataContext>)entitySet.SpQueryArgs.Clone())
        {
        }

        internal SpEntitySet(SpQueryArgs<ISpEntryDataContext> args)
                 : base(args)
        {
        }

        internal SpEntitySet(IQueryProvider provider, Expression expression)
            : base(provider, expression)
        {
        }

        private static SpQueryArgs<ISpEntryDataContext> GetQueryArgs(ISpEntryDataContext context, string query)
        {
            var listAtt = AttributeHelper.GetCustomAttributes<TEntity, ListAttribute>(false).FirstOrDefault();
            if (listAtt != null)
            {
                return new SpQueryArgs<ISpEntryDataContext>(context, listAtt.Title, listAtt.Url, default, query);
            }
            return null;
        }

        public override TEntity Add([NotNull] TEntity entity)
        {
            var entry = Entry(entity, false);
            if (entry != null)
            {
                if (entity.Id > 0)
                {
                    entry.Reload(true);
                }
                entry.Update();
                return entry.Entity;
            }
            return entity;
        }

        public TEntity Add([NotNull] TEntity entity, out SpEntityEntry<TEntity, ISpEntryDataContext> entry)
        {
            entry = Entry(entity, false);
            if (entry != null)
            {
                if (entity.Id > 0)
                {
                    entry.Reload(true);
                }
                entry.Update();
                return entry.Entity;
            }
            return entity;
        }

        public TEntity Add([NotNull] TEntity entity, Action<SpEntityEntry<TEntity, ISpEntryDataContext>> action)
        {
            if (action == null)
            {
                return Add(entity);
            }
            var entry = Entry(entity, false);
            if (entry != null)
            {
                action(entry);
                entry.Update();
                return entry.Entity;
            }
            return entity;
        }
        public override IEnumerable<TEntity> AddRange([NotNull] IEnumerable<TEntity> entities)
        {
            return entities.Select(entity => Add(entity));
        }

        public IEnumerable<TEntity> AddRange([NotNull] IEnumerable<TEntity> entities, out IEnumerable<SpEntityEntry<TEntity, ISpEntryDataContext>> entries)
        {
            IEnumerable<TEntity> outEntities = Enumerable.Empty<TEntity>();
            entries = Enumerable.Empty<SpEntityEntry<TEntity, ISpEntryDataContext>>();
            foreach (var entity in entities)
            {
                SpEntityEntry<TEntity, ISpEntryDataContext> entry;
                var outEntity = Add(entity, out entry);
                if (outEntity != null)
                {
                    outEntities = outEntities.Concat(new[] { outEntity });
                }
                if (entry != null)
                {
                    entries = entries.Concat(new[] { entry });
                }
            }
            return outEntities;
        }

        public IEnumerable<TEntity> AddRange([NotNull] IEnumerable<TEntity> entities, Action<SpEntityEntry<TEntity, ISpEntryDataContext>> action)
        {
            return entities.Select(entity => Add(entity, action));
        }

        public override bool Remove(TEntity entity)
        {
            var entry = Entry(entity, false);
            if (entry != null)
            {
                entry.Delete();
                return entry.Entity != null;
            }
            return false;
        }

        public override int RemoveRange(IEnumerable<TEntity> entities)
        {
            return entities.Select(entity => Remove(entity)).Count(removed => removed == true);
        }
    }
}
