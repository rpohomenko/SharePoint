using Microsoft.SharePoint.Client;
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

        public static IQueryable<TEntity> Scope<TEntity>(
            this IQueryable<TEntity> source, ViewScope scope)
             where TEntity : class, IListItemEntity, new()
        {
            Check.NotNull(source, nameof(source));
            if (source is SpEntityQueryable<TEntity, ISpEntryDataContext>)
            {
                var executor = (source as SpEntityQueryable<TEntity, ISpEntryDataContext>).GetExecutor();
                if (executor != null)
                {
                    var args = (SpQueryArgs<ISpEntryDataContext>)executor.SpQueryArgs.Clone();
                    args.ViewScope = scope;
                    source = new SpEntityQueryable<TEntity>(new SpEntityQueryable<TEntity>(args).Provider, source.Expression);
                }
            }
            return source;
        }

        public static IQueryable<TEntity> Batch<TEntity>(
          this IQueryable<TEntity> source, int size)
          where TEntity : class, IListItemEntity, new()
        {
            Check.NotNull(source, nameof(source));
            if (source is SpEntityQueryable<TEntity, ISpEntryDataContext>)
            {
                var executor = (source as SpEntityQueryable<TEntity, ISpEntryDataContext>).GetExecutor();
                if (executor != null)
                {
                    var args = (SpQueryArgs<ISpEntryDataContext>)executor.SpQueryArgs.Clone();
                    args.BatchSize = size;
                    source = new SpEntityQueryable<TEntity>(new SpEntityQueryable<TEntity>(args).Provider, source.Expression);
                }
            }
            return source;
        }

        public static IQueryable<TEntity> WithPermissions<TEntity>(this IQueryable<TEntity> source)
          where TEntity : class, IListItemEntity, new()
        {
            Check.NotNull(source, nameof(source));
            if (source is SpEntityQueryable<TEntity, ISpEntryDataContext>)
            {
                var executor = (source as SpEntityQueryable<TEntity, ISpEntryDataContext>).GetExecutor();
                if (executor != null)
                {
                    var args = (SpQueryArgs<ISpEntryDataContext>)executor.SpQueryArgs.Clone();
                    args.IncludeItemPermissions = true;
                    source = new SpEntityQueryable<TEntity>(new SpEntityQueryable<TEntity>(args).Provider, source.Expression);
                }
            }
            return source;
        }

        public static bool HasPermission<TEntity>(this IQueryable<TEntity> source, PermissionKind permission)
            where TEntity : class, IListItemEntity, new()
        {
            Check.NotNull(source, nameof(source));
            if (source is SpEntityQueryable<TEntity, ISpEntryDataContext>)
            {
                var executor = (source as SpEntityQueryable<TEntity, ISpEntryDataContext>).GetExecutor();
                if (executor != null)
                {
                    var list = executor.GetList(true);
                    if (list != null)
                    {
                        return list.EffectiveBasePermissions.Has(permission);
                    }
                }
            }
            return false;
        }

        public static List GetSpList<TEntity>(this IQueryable<TEntity> source)
           where TEntity : class, IListItemEntity, new()
        {
            Check.NotNull(source, nameof(source));
            if (source is SpEntityQueryable<TEntity, ISpEntryDataContext>)
            {
                var executor = (source as SpEntityQueryable<TEntity, ISpEntryDataContext>).GetExecutor();
                if (executor != null)
                {
                    return executor.GetListNoExecute();
                }
            }
            return null;
        }

        public static IQueryable<TEntity> WithQuery<TEntity>(this IQueryable<TEntity> source, string queryXml)
            where TEntity : class, IListItemEntity, new()
        {
            Check.NotNull(source, nameof(source));
            if (source is SpEntityQueryable<TEntity, ISpEntryDataContext>)
            {
                var executor = (source as SpEntityQueryable<TEntity, ISpEntryDataContext>).GetExecutor();
                if (executor != null)
                {
                    var args = (SpQueryArgs<ISpEntryDataContext>)executor.SpQueryArgs.Clone();
                    args.Query = queryXml;
                    source = new SpEntityQueryable<TEntity>(new SpEntityQueryable<TEntity>(args).Provider, source.Expression);
                }
            }
            return source;
        }

        public static IQueryable<TEntity> WithEvent<TEntity>(this IQueryable<TEntity> source, Action<Caml.View> onBefore, Action<string> onAfter)
        where TEntity : class, IListItemEntity, new()
        {
            Check.NotNull(source, nameof(source));
            if (source is SpEntityQueryable<TEntity, ISpEntryDataContext>)
            {
                var executor = (source as SpEntityQueryable<TEntity, ISpEntryDataContext>).GetExecutor();
                if (executor != null)
                {
                    var args = (SpQueryArgs<ISpEntryDataContext>)executor.SpQueryArgs.Clone();
                    args.OnBeforeEvent = onBefore;
                    args.OnAfterEvent = onAfter;
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

        public static IEnumerable<ListItem> ToListItems<TEntity>(this IQueryable<TEntity> source/*, bool fieldValuesAsText = false*/)
            where TEntity : class, IListItemEntity, new()
        {
            string nextPagingInfo;
            return source.ToListItems(/*fieldValuesAsText,*/ out nextPagingInfo);
        }

        public static IEnumerable<ListItem> ToListItems<TEntity>(this IQueryable<TEntity> source/*, bool fieldValuesAsText*/, out string nextPagingInfo)
            where TEntity : class, IListItemEntity, new()
        {
            Check.NotNull(source, nameof(source));
            if (source is SpEntityQueryable<TEntity, ISpEntryDataContext>)
            {
                var executor = (source as SpEntityQueryable<TEntity, ISpEntryDataContext>).GetExecutor();
                if (executor != null)
                {
                    return executor.GetItems((source.Provider as QueryProvider<TEntity, ISpEntryDataContext>).GenerateQueryModel(source.Expression), false, /*fieldValuesAsText*/ false, out nextPagingInfo);
                }
            }
            nextPagingInfo = null;
            return Enumerable.Empty<ListItem>();
        }

        public static ListItem FirstListItem<TEntity>(this IQueryable<TEntity> source/*, bool fieldValuesAsText = false*/)
          where TEntity : class, IListItemEntity, new()
        {
            string nextPagingInfo;
            return source.FirstListItem(/*fieldValuesAsText,*/ out nextPagingInfo);
        }

        public static ListItem FirstListItem<TEntity>(this IQueryable<TEntity> source/*, bool fieldValuesAsText*/, out string nextPagingInfo)
            where TEntity : class, IListItemEntity, new()
        {
            Check.NotNull(source, nameof(source));
            return source.Take(1).ToListItems(/*fieldValuesAsText,*/ out nextPagingInfo).FirstOrDefault();
        }

        public static ListItem LastListItem<TEntity>(this IQueryable<TEntity> source/*, bool fieldValuesAsText = false*/)
            where TEntity : class, IListItemEntity, new()
        {
            string nextPagingInfo;
            return source.LastListItem(/*fieldValuesAsText,*/ out nextPagingInfo);
        }

        public static ListItem LastListItem<TEntity>(this IQueryable<TEntity> source/*, bool fieldValuesAsText*/, out string nextPagingInfo)
            where TEntity : class, IListItemEntity, new()
        {
            Check.NotNull(source, nameof(source));
            if (source is SpEntityQueryable<TEntity, ISpEntryDataContext>)
            {
                var executor = (source as SpEntityQueryable<TEntity, ISpEntryDataContext>).GetExecutor();
                if (executor != null)
                {
                    var items = executor.GetItems((source.Provider as QueryProvider<TEntity, ISpEntryDataContext>).GenerateQueryModel(source.Expression), true, /*fieldValuesAsText*/ false, out nextPagingInfo);
                    return items.LastOrDefault();
                }
            }
            nextPagingInfo = null;
            return null;
        }

        public static string Caml<TEntity>(this IQueryable<TEntity> source, bool disableFormatting = false, bool queryOnly = false)
            where TEntity : class, IListItemEntity, new()
        {
            Check.NotNull(source, nameof(source));
            if (source is SpEntityQueryable<TEntity, ISpEntryDataContext>)
            {
                var executor = (source as SpEntityQueryable<TEntity, ISpEntryDataContext>).GetExecutor();
                if (executor != null)
                {
                    var view = executor.GetView((source.Provider as QueryProvider<TEntity, ISpEntryDataContext>).GenerateQueryModel(source.Expression));
                    if (view != null)
                    {
                        if (queryOnly)
                        {
                            if (view.Query != null)
                            {
                                return view.Query.ToString(disableFormatting);
                            }
                        }
                        return view.ToString(disableFormatting);
                    }
                }
            }
            return null;
        }

        public static SpEntityEntry<TEntity, ISpEntryDataContext> AddOrUpdate<TEntity>(this IQueryable<TEntity> source, TEntity entity, bool checkExisting = false, bool autoUpdateLookups = false)
          where TEntity : class, IListItemEntity, new()
        {
            return AddOrUpdate(source, entity, entity.Id, checkExisting, autoUpdateLookups);
        }

        public static SpEntityEntry<TEntity, ISpEntryDataContext> AddOrUpdate<TEntity>(this IQueryable<TEntity> source, TEntity entity, int entityId, bool checkExisting = false, bool autoUpdateLookups = false)
         where TEntity : class, IListItemEntity, new()
        {
            if (entity != null)
            {
                var existEntity = entityId > 0 && checkExisting ? GetEntity(source, entityId) : null;
                if (existEntity == null && entityId <= 0)
                {
                    var entry = GetEntry(source, entity);
                    entry.EntityId = 0;
                    entry.AutoUpdateLookups = autoUpdateLookups;
                    entry.Update();
                    return entry;
                }
                else
                {
                    var entry = existEntity != null ? GetEntry(source, existEntity) : source.NewEntry();
                    if (!checkExisting && entityId > 0)
                    {
                        entry.EntityId = entityId;
                    }
                    entry.Merge(entity);
                    entry.AutoUpdateLookups = autoUpdateLookups;
                    entry.Update();
                    return entry;
                }
            }
            return null;
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

        //public static IQueryable<TEntity> Next<TEntity>(this IQueryable<TEntity> source, int count = 0)
        //     where TEntity : class, IListItemEntity, new()
        //{
        //    Check.NotNull(source, nameof(source));
        //    if (source is SpEntityQueryable<TEntity, ISpEntryDataContext>)
        //    {
        //        var executor = (source as SpEntityQueryable<TEntity, ISpEntryDataContext>).GetExecutor();
        //        if (executor != null)
        //        {
        //            var args = (SpQueryArgs<ISpEntryDataContext>)executor.SpQueryArgs.Clone();
        //            var lastEntity = args.IsPaged && !args.IsPagedPrev ? source.ToArray().LastOrDefault() : source.LastOrDefault();
        //            if (lastEntity != null)
        //            {
        //                args.IsPaged = true;
        //                args.IsPagedPrev = false;
        //                var expression = new PagedExpression<ISpEntryDataContext, TEntity>(source.Expression, args, lastEntity, false);
        //                var provider = new SpEntityQueryable<TEntity>(args).Provider;
        //                source = new SpEntityQueryable<TEntity>(provider, source.Expression).Concat(new SpEntityQueryable<TEntity>(provider, expression));
        //                if (count > 0)
        //                {
        //                    source = source.Take(count);
        //                }
        //            }
        //        }
        //    }
        //    return source;
        //}

        public static IQueryable<TEntity> Next<TEntity>(this IQueryable<TEntity> source, int count = 0)
            where TEntity : class, IListItemEntity, new()
        {
            Check.NotNull(source, nameof(source));
            if (source is SpEntityQueryable<TEntity, ISpEntryDataContext>)
            {
                var executor = (source as SpEntityQueryable<TEntity, ISpEntryDataContext>).GetExecutor();
                if (executor != null)
                {
                    var args = (SpQueryArgs<ISpEntryDataContext>)executor.SpQueryArgs.Clone();
                    var lastItem = args.IsPaged && !args.IsPagedPrev ? source.ToListItems().LastOrDefault() : source.LastListItem();
                    if (lastItem != null)
                    {
                        args.IsPaged = true;
                        args.IsPagedPrev = false;
                        var expression = new PagedExpression<ISpEntryDataContext>(source.Expression, args, lastItem, false);
                        var provider = new SpEntityQueryable<TEntity>(args).Provider;
                        source = new SpEntityQueryable<TEntity>(provider, source.Expression).Concat(new SpEntityQueryable<TEntity>(provider, expression));
                        if (count > 0)
                        {
                            source = source.Take(count);
                        }
                    }
                }
            }
            return source;
        }

        //public static IQueryable<TEntity> Previous<TEntity>(this IQueryable<TEntity> source, int count = 0)
        //   where TEntity : class, IListItemEntity, new()
        //{
        //    Check.NotNull(source, nameof(source));
        //    if (source is SpEntityQueryable<TEntity, ISpEntryDataContext>)
        //    {
        //        var executor = (source as SpEntityQueryable<TEntity, ISpEntryDataContext>).GetExecutor();
        //        if (executor != null)
        //        {
        //            var args = (SpQueryArgs<ISpEntryDataContext>)executor.SpQueryArgs.Clone();
        //            var firstEntity = args.IsPaged && args.IsPagedPrev ? source.ToArray().FirstOrDefault() : source.FirstOrDefault();
        //            if (firstEntity != null)
        //            {
        //                args.IsPaged = true;
        //                args.IsPagedPrev = true;
        //                var expression = new PagedExpression<ISpEntryDataContext, TEntity>(source.Expression, args, firstEntity, true);
        //                var provider = new SpEntityQueryable<TEntity>(args).Provider;
        //                source = new SpEntityQueryable<TEntity>(provider, source.Expression).Concat(new SpEntityQueryable<TEntity>(provider, expression));
        //                if (count > 0)
        //                {
        //                    source = source.Take(count);
        //                }
        //            }
        //        }
        //    }
        //    return source;
        //}

        public static IQueryable<TEntity> Next<TEntity>(this IQueryable<TEntity> source, int lastItemId, int count = 0)
            where TEntity : class, IListItemEntity, new()
        {
            return Paged(source, lastItemId, false, count);
        }

        public static IQueryable<TEntity> Previous<TEntity>(this IQueryable<TEntity> source, int count = 0)
            where TEntity : class, IListItemEntity, new()
        {
            Check.NotNull(source, nameof(source));
            if (source is SpEntityQueryable<TEntity, ISpEntryDataContext>)
            {
                var executor = (source as SpEntityQueryable<TEntity, ISpEntryDataContext>).GetExecutor();
                if (executor != null)
                {
                    var args = (SpQueryArgs<ISpEntryDataContext>)executor.SpQueryArgs.Clone();
                    var firstItem = args.IsPaged && args.IsPagedPrev ? source.ToListItems().FirstOrDefault() : source.FirstListItem();
                    if (firstItem != null)
                    {
                        args.IsPaged = true;
                        args.IsPagedPrev = true;
                        var expression = new PagedExpression<ISpEntryDataContext>(source.Expression, args, firstItem, true);
                        var provider = new SpEntityQueryable<TEntity>(args).Provider;
                        source = new SpEntityQueryable<TEntity>(provider, source.Expression).Concat(new SpEntityQueryable<TEntity>(provider, expression));
                        if (count > 0)
                        {
                            source = source.Take(count);
                        }
                    }
                }
            }
            return source;
        }
        public static IQueryable<TEntity> Previous<TEntity>(this IQueryable<TEntity> source, int firstItemId, int count = 0)
          where TEntity : class, IListItemEntity, new()
        {
            return Paged(source, firstItemId, true, count);
        }

        internal static IQueryable<TEntity> Paged<TEntity>(this IQueryable<TEntity> source, int itemId, bool isPrev, int count = 0)
        where TEntity : class, IListItemEntity, new()
        {
            Check.NotNull(source, nameof(source));
            if (source is SpEntityQueryable<TEntity, ISpEntryDataContext>)
            {
                var executor = (source as SpEntityQueryable<TEntity, ISpEntryDataContext>).GetExecutor();
                if (executor != null)
                {
                    var args = (SpQueryArgs<ISpEntryDataContext>)executor.SpQueryArgs.Clone();
                    var lastItem = itemId > 0 ? source.Where(item => item.Id == itemId).FirstListItem() : null;
                    if (lastItem != null)
                    {
                        args.IsPaged = true;
                        args.IsPagedPrev = isPrev;
                        var expression = new PagedExpression<ISpEntryDataContext>(source.Expression, args, lastItem, false);
                        var provider = new SpEntityQueryable<TEntity>(args).Provider;
                        source = new SpEntityQueryable<TEntity>(provider, source.Expression).Concat(new SpEntityQueryable<TEntity>(provider, expression));
                        if (count > 0)
                        {
                            source = source.Take(count);
                        }
                    }
                    else
                    {
                        source = Enumerable.Empty<TEntity>().AsQueryable();
                    }
                }
            }
            return source;
        }

        public static IQueryable<TEntity> Paged<TEntity>(this IQueryable<TEntity> source, string pagingInfo, int count = 0)
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
                        if (count > 0)
                        {
                            source = source.Take(count);
                        }
                    }
                }
            }
            return source;
        }
    }
}
