using System.Collections.Generic;
using System.Linq;
using Remotion.Linq;
using System.Data;
using SP.Client.Linq.Query.ExpressionVisitors;
using Microsoft.SharePoint.Client;
using SpView = SP.Client.Caml.View;
using System;
using System.Diagnostics;
using System.Threading.Tasks;
using System.Threading;
using Remotion.Linq.Clauses.ResultOperators;
using SP.Client.Linq.Attributes;
using SP.Client.Extensions;
using SP.Client.Caml;

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
            var spView = new SpView() { Scope = SpQueryArgs.ViewScope };
            if (!string.IsNullOrEmpty(SpQueryArgs.Query))
            {
                var q = new Caml.Query(SpQueryArgs.Query);
                spView.Query.Where = q.Where;
                spView.Query.OrderBy = q.OrderBy;
                spView.Query.GroupBy = q.GroupBy;
            }

            SpView = spView;

            var queryVisitor = new SpGeneratorQueryModelVisitor<TContext>(SpQueryArgs, spView);
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
                Debug.WriteLine($"# Entity: {typeof(TEntity)}");
                Debug.WriteLine($"# List: {this.SpQueryArgs}");
                Debug.WriteLine($"# Folder Url: {this.SpQueryArgs.FolderUrl}");
                Debug.WriteLine("# SP Query:");
                Debug.Write(SpView);
                Debug.WriteLine("");

                IEnumerable<TResult> results = _manager.GetEntities(typeof(TResult), SpView).Cast<TResult>();

                foreach (var resultOperator in queryModel.ResultOperators)
                {
                    if (resultOperator is ReverseResultOperator)
                        results = results.Reverse();
                }
                return results;
            }
        }

        public TEntity InsertOrUpdateEntity(TEntity entity)
        {
            if (entity == null) return null;

            ListItem listItem = InsertOrUpdateItem(entity);

            if (listItem != null)
            {
                listItem.Context.ExecuteQuery();
                entity = _manager.MapEntity(listItem, entity.GetType());
            }
            return entity;
        }

        public IEnumerable<TEntity> InsertOrUpdateEntities(IEnumerable<TEntity> entities)
        {
            if (entities == null || !entities.Any()) return null;

            var items = entities.ToDictionary(entity => entity, entity => InsertOrUpdateItem(entity));
            SpQueryArgs.Context.Context.ExecuteQuery();
            return items.Select(item => _manager.MapEntity(item.Value, item.Key.GetType()));
        }

        public ListItem InsertOrUpdateItem(TEntity entity)
        {
            if (entity == null) return null;

            List list = _manager.GetList();
            ListItem listItem = entity.Id > 0
                ? list.GetItemById(entity.Id)
                : list.AddItem(new ListItemCreationInformation());

            var fieldMappings = SpQueryArgs.FieldMappings;
            bool fUpdate = false;
            foreach (var fieldMapping in fieldMappings)
            {
                if (fieldMapping.Value.IsReadOnly || typeof(DependentLookupFieldAttribute).IsAssignableFrom(fieldMapping.Value.GetType())) { continue; }

                var prop = entity.GetType().GetProperty(fieldMapping.Key);
                if (prop != null)
                {
                    var value = prop.GetValue(entity);
                    if (entity.Id > 0 || (entity.Id <= 0 && !Equals(value, prop.PropertyType.GetDefaultValue())))
                    {
                        listItem[fieldMapping.Value.Name] = value;
                        fUpdate = true;
                    }
                }

                var field = entity.GetType().GetField(fieldMapping.Key);
                if (field != null)
                {
                    var value = field.GetValue(entity);
                    if (entity.Id > 0 || (entity.Id <= 0 && !Equals(value, prop.PropertyType.GetDefaultValue())))
                    {
                        listItem[fieldMapping.Value.Name] = value;
                        fUpdate = true;
                    }
                }
            }

            if (fUpdate)
            {
                listItem.Update();
                listItem.Context.Load(listItem);
                return listItem;
            }
            return null;
        }

        public ListItem DeleteItem(int itemId)
        {
            List list = _manager.GetList();
            ListItem listItem = list.GetItemById(itemId);
            listItem.DeleteObject();
            return listItem;
        }

        public int Delete(IEnumerable<int> itemIds)
        {
            var items = DeleteItems(itemIds).ToArray();
            if (items.Length > 0)
            {
                SpQueryArgs.Context.Context.ExecuteQuery();
            }
            return items.Count();
        }

        public IEnumerable<ListItem> DeleteItems(IEnumerable<int> itemIds)
        {
            if (itemIds != null && itemIds.Any())
            {
                List list = _manager.GetList();
                foreach (int itemId in itemIds)
                {
                    ListItem listItem = list.GetItemById(itemId);
                    list.Context.Load(listItem);
                    listItem.DeleteObject();
                    yield return listItem;
                }
            }
        }

        #endregion
    }

    internal class SpAsyncQueryExecutor<TEntity, TContext> : SpQueryExecutor<TEntity, TContext>, IAsyncQueryExecutor
        where TEntity : class, IListItemEntity, new()
        where TContext : class, ISpEntryDataContext
    {
        private readonly SemaphoreSlim _semaphoreSlim = new SemaphoreSlim(1, 1);

        internal SpAsyncQueryExecutor(SpQueryArgs<TContext> args) : base(args)
        {
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

                var results = await _manager.GetEntitiesAsync(typeof(TResult), SpView);

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
            var result = await ExecuteSingleAsync<TResult>(queryModel, false);
            return result;
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
            var entities = await _manager.GetEntitiesAsync(typeof(TResult), SpView);
            return entities.Cast<TResult>();
        }
    }
}
