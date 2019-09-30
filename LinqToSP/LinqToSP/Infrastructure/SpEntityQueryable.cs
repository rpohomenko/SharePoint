using System.Linq;
using Remotion.Linq;
using System.Linq.Expressions;
using Remotion.Linq.Parsing.Structure;
using SP.Client.Linq.Attributes;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using System;
using JetBrains.Annotations;
using SP.Client.Linq.Query;

namespace SP.Client.Linq.Infrastructure
{
  public class SpEntityQueryable<TEntity> : SpEntityQueryable<TEntity, ISpEntryDataContext>
  where TEntity : class, IListItemEntity, new()
    {
    public SpEntityQueryable(SpQueryArgs<ISpEntryDataContext> args)
        : base(args)
    {

    }

    internal SpEntityQueryable(IQueryParser queryParser, IAsyncQueryExecutor executor)
        : base(new AsyncQueryProvider<TEntity, ISpEntryDataContext>(typeof(SpEntityQueryable<>), queryParser, executor))
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


  public class SpEntityQueryable<TEntity, TContext> : QueryableBase<TEntity>, IAsyncEnumerable<TEntity>, ISpRepository<TEntity>, ISpChangeTrackable<TEntity, TContext>
    where TEntity : class, IListItemEntity, new()
    where TContext : class, ISpEntryDataContext
  {
    public SpEntityQueryable(SpQueryArgs<TContext> args)
        : this(QueryParser.CreateDefault(), new SpAsyncQueryExecutor<TEntity, TContext>(args))
    {
      foreach (var att in GetFieldAttributes())
      {
        if (!args.FieldMappings.ContainsKey(att.Key))
        {
          args.FieldMappings.Add(att.Key, att.Value);
        }
      }
    }

    internal SpEntityQueryable(IQueryParser queryParser, IAsyncQueryExecutor executor)
        : this(new /*DefaultQueryProvider*/AsyncQueryProvider<TEntity, ISpEntryDataContext>(typeof(SpEntityQueryable<,>), queryParser, executor))
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

    private static IEnumerable<KeyValuePair<string, FieldAttribute>> GetFieldAttributes()
    {
      return AttributeHelper.GetFieldAttributes<TEntity, FieldAttribute>()
        .Concat(AttributeHelper.GetPropertyAttributes<TEntity, FieldAttribute>())
        .Select(f => new KeyValuePair<string, FieldAttribute>(f.Key.Name, f.Value));
    }

    public string GetQuery(bool disableFormatting)
    {
      var executor = GetExecutor();
      if (executor != null)
      {
        var view = executor.SpView;
        if (view != null)
        {
          return view.ToString(disableFormatting);
        }
      }
      return null;
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

    internal string GenerateCaml(bool disableFormatting = false, bool queryOnly = false)
    {
      var executor = GetExecutor();
      if (executor != null)
      {
        bool skipResult = executor.SpQueryArgs.SkipResult;
        try
        {
          //fake
          executor.SpQueryArgs.SkipResult = true;
          this.ToList();
        }
        finally
        {
          executor.SpQueryArgs.SkipResult = skipResult;
        }
        var view = executor.SpView;
        if (view != null)
        {
          if (queryOnly)
          {
            if (view.Query != null)
            {
             return view.Query.ToString(disableFormatting);
            }
          }
          else
          {
            return view.ToString(disableFormatting);
          }
        }
      }
      return null;
    }

    public override string ToString()
    {
      string q = GetQuery(false);
      if (q != null)
      {
        return q;
      }
      return base.ToString();
    }

    public async Task<IEnumerator<TEntity>> GetAsyncEnumerator(CancellationToken cancellationToken = default)
    {
      var result = await (Provider as AsyncQueryProvider<TEntity, TContext>).ExecuteAsync(Expression, cancellationToken);
      return result.GetEnumerator();
    }

    public virtual TEntity Add([NotNull] TEntity entity)
    {
      if (entity != null)
      {
        var executor = GetExecutor();
        if (executor != null && executor.SpQueryArgs != null && executor.SpQueryArgs.FieldMappings != null)
        {
          if (entity is ListItemEntity)
          {
            return executor.InsertOrUpdateEntity(entity);
          }
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
          return executor.Delete(itemIds);
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
          return executor.InsertOrUpdateEntities(entities).Cast<TEntity>();
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
        return this.ToList().Select(entity => new SpEntityEntry<TEntity, TContext>(entity, executor.SpQueryArgs));
      }
      return Enumerable.Empty<SpEntityEntry<TEntity, TContext>>();
    }

    internal SpEntityEntry<TEntity, TContext> Entry(TEntity entity, bool reload)
    {
      if (entity != null)
      {
        var executor = GetExecutor();
        if (executor != null && executor.SpQueryArgs != null)
        {
          var entry = entity.GetEntry(executor.SpQueryArgs);
          if (reload) entry.Reload();
          return entry;
        }
      }
      return null;
    }
  }
}
