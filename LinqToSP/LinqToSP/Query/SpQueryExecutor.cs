using System.Collections.Generic;
using System.Linq;
using Remotion.Linq;
using System.Data;
using SP.Client.Linq.Query.ExpressionVisitors;
using Microsoft.SharePoint.Client;
using SpView = SP.Client.Caml.View;
using System.Diagnostics;
using System.Threading.Tasks;
using System.Threading;
using Remotion.Linq.Clauses.ResultOperators;
using SP.Client.Linq.Attributes;
using SP.Client.Caml;
using System;

namespace SP.Client.Linq.Query
{
    /// <summary>
    /// 
    /// </summary>
    internal class SpQueryExecutor<TEntity, TContext> : IQueryExecutor
      where TEntity : class, IListItemEntity, new()
      where TContext : class, ISpEntryDataContext

    {
        #region Fields
        private readonly object _lock = new object();
        protected readonly SpQueryManager<TEntity, TContext> _manager;
        #endregion

        #region Properties
        public SpView SpView
        {
            get; protected set;
        }

        internal SpQueryArgs<TContext> SpQueryArgs { get; }

        #endregion

        #region Constructors

        internal SpQueryExecutor(SpQueryArgs<TContext> args)
        {
            ValidateArgs(args);
            SpQueryArgs = args;
            _manager = new SpQueryManager<TEntity, TContext>(args);
        }

        #endregion

        #region Methods
        private void ValidateArgs(SpQueryArgs<TContext> args)
        {

        }

        public TResult ExecuteScalar<TResult>(QueryModel queryModel)
        {
            VisitQueryModel(queryModel);
            foreach (var resultOperator in queryModel.ResultOperators)
            {
                if (resultOperator is CountResultOperator || resultOperator is LongCountResultOperator)
                {
                    int itemCount = 0;
                    _manager.ProcessItems(SpView, true, (items) =>
                    {
                        itemCount += items.Count;
                    });

                    return (TResult)Convert.ChangeType(itemCount, typeof(TResult));
                }
            }
            return ExecuteSingle<TResult>(queryModel, false);
        }

        public TResult ExecuteSingle<TResult>(QueryModel queryModel, bool defaultIfEmpty)
        {
            var results = ExecuteCollection<TResult>(queryModel);
            foreach (var resultOperator in queryModel.ResultOperators)
            {
                if (resultOperator is LastResultOperator)
                    return results.LastOrDefault();
            }
            return (defaultIfEmpty) ? results.FirstOrDefault() : results.First();
        }

        protected void VisitQueryModel(QueryModel queryModel)
        {
            if (SpQueryArgs == null) return;

            SpQueryArgs.OnExecute?.Invoke();

            var spView = new SpView() { Scope = SpQueryArgs.ViewScope };
            if (!string.IsNullOrEmpty(SpQueryArgs.Query))
            {
                var q = new Caml.Query(SpQueryArgs.Query);
                spView.Query.Where = q.Where;
                spView.Query.OrderBy = q.OrderBy;
                spView.Query.GroupBy = q.GroupBy;
            }

            SpView = spView;

            var queryVisitor = new SpGeneratorQueryModelVisitor<TContext, TEntity>(SpQueryArgs, spView);
            queryVisitor.VisitQueryModel(queryModel);

            var contentType = AttributeHelper.GetCustomAttributes<TEntity, ContentTypeAttribute>(true).LastOrDefault();
            if (contentType != null && !string.IsNullOrWhiteSpace(contentType.Id) && contentType.Id != "0x01")
            {
                var additionalWhere = new Caml.Clauses.CamlWhere(new Caml.Operators.BeginsWith("ContentTypeId", contentType.Id));
                if (spView.Query.Where == null)
                {
                    spView.Query.Where = additionalWhere;
                }
                else
                {
                    spView.Query.Where = spView.Query.Where.And(additionalWhere);
                }
            }

            if (spView.ViewFields == null)
            {
                spView.ViewFields =
                new ViewFieldsCamlElement(SpQueryArgs.FieldMappings.Select(fieldMapping => fieldMapping.Value.Name));
            }
            else if (!spView.ViewFields.Any())
            {
                spView.ViewFields.AddRange(SpQueryArgs.FieldMappings.Select(fieldMapping => fieldMapping.Value.Name));
            }

            spView.Joins = new JoinsCamlElement();
            spView.ProjectedFields = new ProjectedFieldsCamlElement();

            foreach (var dependentLookupField in SpQueryArgs.FieldMappings.Values.OfType<DependentLookupFieldAttribute>())
            {
                if (spView.ViewFields.Any(f => f.Name == dependentLookupField.Name))
                {
                    if (spView.ProjectedFields == null || !spView.ProjectedFields.Any(f => f.Name == dependentLookupField.Name))
                    {
                        spView.Joins.Join(new LeftJoin(dependentLookupField.LookupFieldName, dependentLookupField.List));
                        spView.ProjectedFields.ShowField(new CamlProjectedField(dependentLookupField.Name, dependentLookupField.List, dependentLookupField.ShowField));
                    }
                }
            }

            Debug.WriteLine($"# Entity: {typeof(TEntity)}");
            Debug.WriteLine($"# List: {this.SpQueryArgs}");
            Debug.WriteLine($"# Folder Url: {this.SpQueryArgs.FolderUrl}");
            Debug.WriteLine($"# Paging Info: {this.SpQueryArgs.PagingInfo}");
            Debug.WriteLine($"# Previous Paging Info: {this.SpQueryArgs.PrevPagingInfo}");
            Debug.WriteLine("# SP Query:");
            Debug.Write(SpView);
            Debug.WriteLine("");
        }

        public IEnumerable<TResult> ExecuteCollection<TResult>(QueryModel queryModel)
        {
            lock (_lock)
            {
                if (SpQueryArgs == null) return Enumerable.Empty<TResult>();

                VisitQueryModel(queryModel);

                if (SpQueryArgs.SkipResult)
                {
                    return Enumerable.Empty<TResult>();
                }

                var results = _manager.GetEntities(SpView);

                foreach (var resultOperator in queryModel.ResultOperators)
                {
                    if (resultOperator is ReverseResultOperator)
                        results = results.Reverse();
                }

                return results.Cast<TResult>();
            }
        }

        public IEnumerable<ListItem> DeleteItems(IEnumerable<int> itemIds, bool recycle)
        {
            return _manager.DeleteItems(itemIds, recycle);
        }

        #endregion
    }

#if !SP2013 && !SP2016
    internal class SpAsyncQueryExecutor<TEntity, TContext> : SpQueryExecutor<TEntity, TContext>, IAsyncQueryExecutor
          where TEntity : class, IListItemEntity, new()
          where TContext : class, ISpEntryDataContext
    {
        private readonly SemaphoreSlim _semaphoreSlim = new SemaphoreSlim(1, 1);

        internal SpAsyncQueryExecutor(SpQueryArgs<TContext> args) : base(args)
        {
            if (args != null)
                args.IsAsync = true;
        }

        public async Task<IEnumerable<TResult>> ExecuteCollectionAsync<TResult>(QueryModel queryModel)
        {
            await _semaphoreSlim.WaitAsync();
            try
            {
                if (SpQueryArgs == null) return Enumerable.Empty<TResult>();

                VisitQueryModel(queryModel);

                if (SpQueryArgs.SkipResult)
                {
                    return Enumerable.Empty<TResult>();
                }

                var results = await _manager.GetEntitiesAsync(SpView);

                foreach (var resultOperator in queryModel.ResultOperators)
                {
                    if (resultOperator is ReverseResultOperator)
                        results = results.Reverse();
                }

                return results.Cast<TResult>();
            }
            finally
            {
                _semaphoreSlim.Release();
            }
        }

        public async Task<TResult> ExecuteScalarAsync<TResult>(QueryModel queryModel)
        {
            VisitQueryModel(queryModel);
            foreach (var resultOperator in queryModel.ResultOperators)
            {
                if (resultOperator is CountResultOperator || resultOperator is LongCountResultOperator)
                {
                    int itemCount = 0;
                    await _manager.ProcessItemsAsync(SpView, true, (items) =>
                     {
                         itemCount += items.Count;
                     });
                    return (TResult)Convert.ChangeType(itemCount, typeof(TResult));
                }
            }
            return await ExecuteSingleAsync<TResult>(queryModel, false);
        }

        public async Task<TResult> ExecuteSingleAsync<TResult>(QueryModel queryModel, bool defaultIfEmpty)
        {
            var results = await ExecuteCollectionAsync<TResult>(queryModel);
            foreach (var resultOperator in queryModel.ResultOperators)
            {
                if (resultOperator is LastResultOperator)
                    return results.LastOrDefault();
            }
            return (defaultIfEmpty) ? results.FirstOrDefault() : results.First();
        }

        protected virtual async Task<IEnumerable<TResult>> GetEntitiesAsync<TResult>() where TResult : ListItemEntity
        {
            var entities = await _manager.GetEntitiesAsync(SpView);
            return entities.Cast<TResult>();
        }
    }
#endif
}
