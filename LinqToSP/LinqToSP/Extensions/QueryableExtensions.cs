using SP.Client.Extensions;
using SP.Client.Linq.Infrastructure;
using SP.Client.Linq.Query;
using SP.Client.Linq.Query.Expressions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;

namespace SP.Client.Linq
{
    public static class QueryableExtensions
    {
        public static IQueryable<TEntity> Include<TEntity>(
              this IQueryable<TEntity> source, params Expression<Func<TEntity, object>>[] predicates)
               where TEntity : class, IListItemEntity, new()
        {
            Check.NotNull(source, nameof(source));
            Check.NotNull(predicates, nameof(predicates));
            if (source.Provider is IQueryProvider)
            {
                var expression = new IncludeExpression<ISpEntryDataContext>(source.Expression, predicates);
                return new SpEntityQueryable<TEntity>(source.Provider, expression).Concat(new SpEntityQueryable<TEntity>(source.Provider, source.Expression));
            }
            return source;
        }

        public static IQueryable<TEntity> GroupBy<TEntity>(
             this IQueryable<TEntity> source, params Expression<Func<TEntity, object>>[] predicates)
              where TEntity : class, IListItemEntity, new()
        {
            return GroupBy(source, 0, predicates);
        }

        public static IQueryable<TEntity> GroupBy<TEntity>(
            this IQueryable<TEntity> source, int limit, params Expression<Func<TEntity, object>>[] predicates)
             where TEntity : class, IListItemEntity, new()
        {
            Check.NotNull(source, nameof(source));
            Check.NotNull(predicates, nameof(predicates));
            if (source.Provider is IQueryProvider)
            {
                var expression = new GroupByExpression<ISpEntryDataContext>(source.Expression, predicates, limit);
                return new SpEntityQueryable<TEntity>(source.Provider, source.Expression).Concat(new SpEntityQueryable<TEntity>(source.Provider, expression));
            }
            return source;
        }

        public static IQueryable<TEntity> Folder<TEntity>(
            this IQueryable<TEntity> source, string folderUrl)
             where TEntity : class, IListItemEntity, new()
        {
            Check.NotNull(source, nameof(source));
            Check.NotNull(folderUrl, nameof(folderUrl));
            if (source is SpEntityQueryable<TEntity, ISpEntryDataContext>)
            {
                var executor = (source as SpEntityQueryable<TEntity, ISpEntryDataContext>).GetExecutor();
                if (executor != null)
                {
                    var args = (SpQueryArgs<ISpEntryDataContext>)executor.SpQueryArgs.Clone();
                    args.FolderUrl = folderUrl;
                    source = new SpEntityQueryable<TEntity>(new SpEntityQueryable<TEntity>(args).Provider, source.Expression);
                }
            }
            return source;
        }

        public static IEnumerable<SpEntityEntry<TEntity, ISpEntryDataContext>> GetEntries<TEntity>(this IQueryable<TEntity> source)
          where TEntity : class, IListItemEntity, new()
        {
            Check.NotNull(source, nameof(source));
            if (source is SpEntityQueryable<TEntity, ISpEntryDataContext>)
            {
                return (source as SpEntityQueryable<TEntity, ISpEntryDataContext>).Entries();
            }
            return Enumerable.Empty<SpEntityEntry<TEntity, ISpEntryDataContext>>();
        }

        public static SpEntityEntry<TEntity, ISpEntryDataContext> GetEntry<TEntity>(this IQueryable<TEntity> source, TEntity entity)
         where TEntity : class, IListItemEntity, new()
        {
            Check.NotNull(source, nameof(source));
            if (source is SpEntityQueryable<TEntity, ISpEntryDataContext>)
            {
                return (source as SpEntityQueryable<TEntity, ISpEntryDataContext>).Entry(entity);
            }
            return null;
        }
        public static SpEntityEntry<TEntity, ISpEntryDataContext> GetEntry<TEntity>(this IQueryable<TEntity> source, int entityId)
            where TEntity : class, IListItemEntity, new()
        {
            Check.NotNull(source, nameof(source));
            if (source is SpEntityQueryable<TEntity, ISpEntryDataContext>)
            {
                var entity = source.GetEntity(entityId);
                return (source as SpEntityQueryable<TEntity, ISpEntryDataContext>).Entry(entity);
            }
            return null;
        }

        public static TEntity GetEntity<TEntity>(this IQueryable<TEntity> source, int entityId)
           where TEntity : class, IListItemEntity, new()
        {
            Check.NotNull(source, nameof(source));
            if (source is SpEntityQueryable<TEntity, ISpEntryDataContext>)
            {
                return (source as SpEntityQueryable<TEntity, ISpEntryDataContext>).Find(entityId);
            }
            return null;
        }

        public static SpEntityEntry<TEntity, ISpEntryDataContext> NewEntry<TEntity>(this IQueryable<TEntity> source)
             where TEntity : class, IListItemEntity, new()
        {
            Check.NotNull(source, nameof(source));
            if (source is SpEntityQueryable<TEntity, ISpEntryDataContext>)
            {
                return (source as SpEntityQueryable<TEntity, ISpEntryDataContext>).Entry(new TEntity());
            }
            return null;
        }

        public static string Caml<TEntity>(this IQueryable<TEntity> source, bool disableFormatting = false, bool queryOnly = false)
              where TEntity : class, IListItemEntity, new()
        {
            Check.NotNull(source, nameof(source));
            if (source is SpEntityQueryable<TEntity, ISpEntryDataContext>)
            {
                return (source as SpEntityQueryable<TEntity, ISpEntryDataContext>).GenerateCaml(disableFormatting, queryOnly);
            }
            return null;
        }

        public static SpEntityEntry<TEntity, ISpEntryDataContext> AddOrUpdate<TEntity>(this IQueryable<TEntity> source, TEntity entity, bool autoUpdateLookups = false)
          where TEntity : class, IListItemEntity, new()
        {
            return AddOrUpdate(source, entity, entity.Id, autoUpdateLookups);
        }

        public static SpEntityEntry<TEntity, ISpEntryDataContext> AddOrUpdate<TEntity>(this IQueryable<TEntity> source, TEntity entity, int entityId, bool autoUpdateLookups = false)
         where TEntity : class, IListItemEntity, new()
        {
            var existEntity = GetEntity(source, entityId);
            if (existEntity == null)
            {
                var entry = GetEntry(source, entity);
                entry.AutoUpdateLookups = autoUpdateLookups;
                entry.Update();
                return entry;
            }
            else
            {
                var entry = GetEntry(source, existEntity);
                entry.AutoUpdateLookups = autoUpdateLookups;
                entry.Update(entity);
                return entry;
            }
            //var entry = GetEntry(source, entity);
            //if (entry != null)
            //{
            //  entry.AutoUpdateLookups = autoUpdateLookups;
            //  entry.EntityId = entityId;
            //  entity = entry.Reload(true);

            //return null;
        }

        public static bool DeleteAll<TEntity>(this IQueryable<TEntity> source)
         where TEntity : class, IListItemEntity, new()
        {
            bool deleted = false;
            foreach (var entry in GetEntries(source))
            {
                entry.Delete();
                deleted = true;
            }
            return deleted;
        }

        public static bool Delete<TEntity>(this IQueryable<TEntity> source, int entityId)
            where TEntity : class, IListItemEntity, new()
        {
            return source.Where(entity => entity.Id == entityId).Take(1).DeleteAll();
            //return source.Delete(new[] { entityId });
        }

        public static bool Delete<TEntity>(this IQueryable<TEntity> source, params int[] entityIds)
          where TEntity : class, IListItemEntity, new()
        {
            return source.Where(entity => entity.Includes(e => e.Id, entityIds)).Take(entityIds.Length).DeleteAll();
        }

        public static SpEntitySet<TEntity> ToEntitySet<TEntity>(this IQueryable<TEntity> source)
          where TEntity : class, IListItemEntity, new()
        {
            Check.NotNull(source, nameof(source));
            if (source is SpEntityQueryable<TEntity, ISpEntryDataContext>)
            {
                var executor = (source as SpEntityQueryable<TEntity, ISpEntryDataContext>).GetExecutor();
                if (executor != null)
                {
                    return new SpEntitySet<TEntity>(source.Provider, source.Expression);
                }
            }
            return null;
        }

        public static IQueryable<TEntity> Next<TEntity>(this IQueryable<TEntity> source)
             where TEntity : class, IListItemEntity, new()
        {
            Check.NotNull(source, nameof(source));
            if (source is SpEntityQueryable<TEntity, ISpEntryDataContext>)
            {
                var executor = (source as SpEntityQueryable<TEntity, ISpEntryDataContext>).GetExecutor();
                if (executor != null)
                {
                    var args = (SpQueryArgs<ISpEntryDataContext>)executor.SpQueryArgs.Clone();
                    var lastEntity = args.IsPaged && !args.IsPagedPrev ? source.ToArray().LastOrDefault() : source.LastOrDefault();
                    if (lastEntity != null)
                    {
                        args.IsPaged = true;
                        args.IsPagedPrev = false;
                        var expression = new PagedExpression<ISpEntryDataContext, TEntity>(source.Expression, lastEntity, false);
                        var provider = new SpEntityQueryable<TEntity>(args).Provider;
                        source = new SpEntityQueryable<TEntity>(provider, source.Expression).Concat(new SpEntityQueryable<TEntity>(provider, expression));
                    }
                }
            }
            return source;
        }
        public static IQueryable<TEntity> Previous<TEntity>(this IQueryable<TEntity> source)
           where TEntity : class, IListItemEntity, new()
        {
            Check.NotNull(source, nameof(source));
            if (source is SpEntityQueryable<TEntity, ISpEntryDataContext>)
            {
                var executor = (source as SpEntityQueryable<TEntity, ISpEntryDataContext>).GetExecutor();
                if (executor != null)
                {
                    var args = (SpQueryArgs<ISpEntryDataContext>)executor.SpQueryArgs.Clone();
                    var firstEntity = args.IsPaged && args.IsPagedPrev ? source.ToArray().FirstOrDefault() : source.FirstOrDefault();
                    if (firstEntity != null)
                    {
                        args.IsPaged = true;
                        args.IsPagedPrev = true;
                        var expression = new PagedExpression<ISpEntryDataContext, TEntity>(source.Expression, firstEntity, true);
                        var provider = new SpEntityQueryable<TEntity>(args).Provider;
                        source = new SpEntityQueryable<TEntity>(provider, source.Expression).Concat(new SpEntityQueryable<TEntity>(provider, expression));
                    }
                }
            }
            return source;
        }
        public static IQueryable<TEntity> Paged<TEntity>(this IQueryable<TEntity> source, string pagingInfo)
            where TEntity : class, IListItemEntity, new()
        {
            Check.NotNull(source, nameof(source));
            if (!string.IsNullOrEmpty(pagingInfo))
            {
                if (source is SpEntityQueryable<TEntity, ISpEntryDataContext>)
                {
                    var executor = (source as SpEntityQueryable<TEntity, ISpEntryDataContext>).GetExecutor();
                    if (executor != null)
                    {
                        var args = (SpQueryArgs<ISpEntryDataContext>)executor.SpQueryArgs.Clone();
                        var qParams = pagingInfo.ToLower().Split(new[] { '&' }, StringSplitOptions.RemoveEmptyEntries)
                            .Select(qParam => qParam.Split(new[] { '=' }, StringSplitOptions.RemoveEmptyEntries))
                            .ToDictionary(qParam => qParam.FirstOrDefault().Trim(), qParam => qParam.Length > 1 ? qParam.LastOrDefault().Trim() : null);

                        args.IsPaged = qParams.ContainsKey("paged") /*&& qParams["paged"] == "true"*/;
                        args.IsPagedPrev = qParams.ContainsKey("pagedprev") /*&& qParams["pagedprev"] == "true"*/;
                        args.PagingInfo = pagingInfo;
                        var provider = new SpEntityQueryable<TEntity>(args).Provider;
                        source = new SpEntityQueryable<TEntity>(provider, source.Expression);
                    }
                }
            }
            return source;
        }
    }
}
