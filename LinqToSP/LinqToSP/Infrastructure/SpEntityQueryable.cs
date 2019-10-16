using System.Linq;
using Remotion.Linq;
using System.Linq.Expressions;
using Remotion.Linq.Parsing.Structure;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using JetBrains.Annotations;
using SP.Client.Linq.Query;
using Microsoft.SharePoint.Client;

namespace SP.Client.Linq.Infrastructure
{
    public class SpEntityQueryable<TEntity> : SpEntityQueryable<TEntity, ISpEntryDataContext>
      where TEntity : class, IListItemEntity, new()
    {
        public SpEntityQueryable(SpQueryArgs<ISpEntryDataContext> args)
            : base(args)
        {

        }

        internal SpEntityQueryable(IQueryParser queryParser,
#if SP2013 || SP2016
          IQueryExecutor executor
#else
         IAsyncQueryExecutor executor
#endif
          )
            : base(
#if SP2013 || SP2016
                new QueryProvider<TEntity, ISpEntryDataContext>(typeof(SpEntityQueryable<>),
#else
                new AsyncQueryProvider<TEntity, ISpEntryDataContext>(typeof(SpEntityQueryable<>),
#endif
                  queryParser, executor))
        {

        }

        internal SpEntityQueryable(IQueryProvider provider, Expression expression)
            : base(provider, expression)
        {

        }

        internal SpEntityQueryable(IQueryProvider provider)
          : base(provider)
        {

        }
    }

    public class SpEntityQueryable<TEntity, TContext> : QueryableBase<TEntity>,
#if SP2013 || SP2016
    IEnumerable<TEntity>,
#else
    IAsyncEnumerable<TEntity>,
#endif
    ISpRepository<TEntity>, ISpChangeTrackable<TEntity, TContext>
      where TEntity : class, IListItemEntity, new()
      where TContext : class, ISpEntryDataContext
    {
        public SpEntityQueryable(SpQueryArgs<TContext> args)
            : this(QueryParser.CreateDefault(),
#if SP2013 || SP2016
                 new SpQueryExecutor<TEntity, TContext>(args)
#else
                new SpAsyncQueryExecutor<TEntity, TContext>(args)
#endif
                )
        {

        }

        internal SpEntityQueryable(IQueryParser queryParser,
#if SP2013 || SP2016
           IQueryExecutor executor
#else
          IAsyncQueryExecutor executor
#endif
          )
            : this(new /*DefaultQueryProvider*/
#if SP2013 || SP2016
               QueryProvider<TEntity, ISpEntryDataContext>(typeof(SpEntityQueryable<,>),
#else
                AsyncQueryProvider<TEntity, ISpEntryDataContext>(typeof(SpEntityQueryable<,>),
#endif
              queryParser, executor))
        {

        }

        public SpEntityQueryable(IQueryProvider provider, Expression expression)
            : base(provider, expression)
        {

        }

        internal SpEntityQueryable(IQueryProvider provider)
          : base(provider)
        {

        }

        internal SpQueryExecutor<TEntity, TContext> GetExecutor()
        {
            var provider = (this.Provider as QueryProviderBase);
            if (provider != null)
            {
                return (SpQueryExecutor<TEntity, TContext>)provider.Executor;
            }
            return null;
        }

        public override string ToString()
        {
            return this.Caml();
        }

#if !SP2013 && !SP2016
        public async Task<IEnumerator<TEntity>> GetAsyncEnumerator(CancellationToken cancellationToken = default)
        {
            var result = await (Provider as AsyncQueryProvider<TEntity, TContext>).ExecuteAsync(Expression, cancellationToken);
            return result.GetEnumerator();
        }
#endif

        public virtual TEntity Add([NotNull] TEntity entity)
        {
            if (entity != null)
            {
                var entry = this.AddOrUpdate(entity);
                if (entry != null && entry.Context != null)
                {
                    entry.Context.Context.ExecuteQuery();
                    return entry.Entity;
                }
            }
            return null;
        }

        public virtual int Delete([NotNull] params int[] itemIds)
        {
            if (itemIds != null)
            {
                var executor = GetExecutor();
                if (executor != null && executor.SpQueryArgs != null && executor.SpQueryArgs.FieldMappings != null)
                {
                    var items = executor.DeleteItems(itemIds, false);
                    if (executor.SpQueryArgs.Context != null)
                    {
                        executor.SpQueryArgs.Context.Context.ExecuteQuery();
                    }
                    return items.Count();
                }
            }
            return 0;
        }

        public virtual TEntity Find(int itemId)
        {
            return this.FirstOrDefault(i => i.Id == itemId);
        }

        public virtual IQueryable<TEntity> FindAll([NotNull] params int[] itemIds)
        {
            return this.Where(i => i.Includes(x => x.Id, itemIds));
        }

        public virtual IEnumerable<TEntity> AddRange(IEnumerable<TEntity> entities)
        {
            if (entities != null)
            {
                var executor = GetExecutor();
                if (executor != null && executor.SpQueryArgs != null && executor.SpQueryArgs.FieldMappings != null)
                {
                    var entries = new List<SpEntityEntry<TEntity, ISpEntryDataContext>>();
                    foreach (var entity in entities)
                    {
                        var entry = this.AddOrUpdate(entity);
                        if (entry != null) entries.Add(entry);
                    }
                    if (executor.SpQueryArgs.Context != null)
                    {
                        executor.SpQueryArgs.Context.Context.ExecuteQuery();
                    }
                    return entries.Where(entry => entry.Entity != null).Select(entry => entry.Entity);
                }
            }
            return null;
        }

        public virtual bool Remove(TEntity entity)
        {
            if (entity != null && entity.Id > 0)
            {
                return Delete(entity.Id) > 0;
            }
            return false;
        }

        public virtual int RemoveRange(IEnumerable<TEntity> entities)
        {
            return Delete(entities.Where(entity => entity != null && entity.Id > 0).Select(entity => entity.Id).ToArray());
        }

        internal IEnumerable<SpEntityEntry<TEntity, TContext>> Entries()
        {
            var executor = GetExecutor();
            if (executor != null && executor.SpQueryArgs != null)
            {
                return this.ToList().Select(entity => Entry(entity));
            }
            return Enumerable.Empty<SpEntityEntry<TEntity, TContext>>();
        }

        internal SpEntityEntry<TEntity, TContext> Entry(TEntity entity)
        {
            if (entity != null)
            {
                var executor = GetExecutor();
                if (executor != null && executor.SpQueryArgs != null)
                {
                    var entry = entity.GetEntry(executor.SpQueryArgs);
                    return entry;
                }
            }
            return null;
        }

        internal IEnumerable<ListItem> ListItems()
        {
            var executor = GetExecutor();
            if (executor != null && executor.SpQueryArgs != null)
            {
                return this.ToList().Select(entity => ListItem(entity));
            }
            return Enumerable.Empty<ListItem>();
        }

        internal ListItem ListItem(TEntity entity)
        {
            if (entity != null)
            {
                var executor = GetExecutor();
                if (executor != null && executor.SpQueryArgs != null)
                {
                    var item = entity.GetListItem(executor.SpQueryArgs);
                    return item;
                }
            }
            return null;
        }
    }
}
