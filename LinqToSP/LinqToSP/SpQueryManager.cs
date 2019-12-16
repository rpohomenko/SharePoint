using Microsoft.SharePoint.Client;
using SP.Client.Extensions;
using SP.Client.Helpers;
using SP.Client.Linq.Attributes;
using SP.Client.Linq.Infrastructure;
using SP.Client.Linq.Query;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Threading.Tasks;

namespace SP.Client.Linq
{
    internal sealed class SpQueryManager<TEntity, TContext>
        where TEntity : class, IListItemEntity, new()
        where TContext : class, ISpEntryDataContext
    {
        #region Fields
        private readonly SpQueryArgs<TContext> _args;
        #endregion

        #region Constructors
        public SpQueryManager(SpQueryArgs<TContext> args)
        {
            _args = args;
        }

        #endregion

        #region Methods

        //private static void CheckEntityType(Type type)
        //{
        //    if (!typeof(TEntity).IsAssignableFrom(type) && !type.IsSubclassOf(typeof(TEntity)))
        //    {
        //        throw new Exception($"Entity must be assignable from {typeof(TEntity)}");
        //    }
        //}

        private static object GetFieldValue(FieldAttribute fieldAttr, Type valueType, object value)
        {
            if (value != null)
            {
                if (fieldAttr.DataType == FieldType.Choice || fieldAttr.DataType == FieldType.MultiChoice)
                {
                    if (value is string[])
                    {
                        if (valueType.IsEnum)
                        {
                            value = EnumExtensions.ParseChoiceValues(valueType, (string[])value);
                        }
                    }
                    else
                    {
                        if (valueType.IsEnum)
                        {
                            value = EnumExtensions.ParseChoiceValue(valueType, (string)value);
                        }
                    }
                }
                else if (fieldAttr.DataType == FieldType.Lookup && (typeof(LookupFieldAttribute).IsAssignableFrom(fieldAttr.GetType()) || fieldAttr.GetType().IsSubclassOf(typeof(LookupFieldAttribute))))
                {
                    var lookupFieldMap = fieldAttr as LookupFieldAttribute;

                    if (lookupFieldMap.Result == LookupItemResult.None) return value;

                    if (value is FieldLookupValue)
                    {
                        if (!typeof(FieldLookupValue).IsAssignableFrom(valueType) && !valueType.IsSubclassOf(typeof(FieldLookupValue)))
                        {
                            value = lookupFieldMap.Result == LookupItemResult.Id
                                ? (object)(value as FieldLookupValue).LookupId
                                : (value as FieldLookupValue).LookupValue;

                            if (valueType.IsArray)
                            {
                                var elType = (valueType.GetElementType()
                                 ?? valueType.GenericTypeArguments.FirstOrDefault())
                                 ?? typeof(object);
                                value = new[] { SpConverter.ConvertValue(value, elType) }.ToArray(elType);
                            }
                        }
                    }
                    else if (value is ICollection<FieldLookupValue>)
                    {
                        if (!lookupFieldMap.IsMultiple)
                        {
                            var lookupValue = (value as ICollection<FieldLookupValue>).FirstOrDefault();
                            if (lookupValue != null)
                            {
                                if (!typeof(FieldLookupValue).IsAssignableFrom(valueType) && !valueType.IsSubclassOf(typeof(FieldLookupValue)))
                                {
                                    value = lookupFieldMap.Result == LookupItemResult.Id ? (object)lookupValue.LookupId : lookupValue.LookupValue;
                                }
                                else
                                {
                                    value = lookupValue;
                                }
                            }
                            else
                            {
                                value = null;
                            }
                        }
                        else
                        {
                            var elType = (valueType.GetElementType()
                                ?? valueType.GenericTypeArguments.FirstOrDefault())
                                ?? typeof(object);
                            if (!typeof(FieldLookupValue).IsAssignableFrom(elType) && !elType.IsSubclassOf(typeof(FieldLookupValue)))
                            {
                                var result = lookupFieldMap.Result == LookupItemResult.Id
                                ? (value as ICollection<FieldLookupValue>).Select(v => SpConverter.ConvertValue(v.LookupId, elType))
                                : (value as ICollection<FieldLookupValue>).Select(v => SpConverter.ConvertValue(v.LookupValue, elType));
                                if (valueType.IsArray)
                                {
                                    value = result.ToArray(elType);
                                }
                                else
                                {
                                    value = result.ToList(elType);
                                }
                            }
                        }
                    }
                }
                else
                {
                    if (value is FieldCalculatedErrorValue)
                    {
                        value = (value as FieldCalculatedErrorValue).ErrorMessage;
                    }
                }
            }
            return value;
        }

        private bool SetEntityLookup(Type type, object value, object itemValue)
        {
            if (value is ISpEntityLookup || typeof(ISpEntityLookup).IsAssignableFrom(type))
            {
                var entitySet = (ISpEntityLookup)value;
                if (entitySet != null)
                {
                    if (itemValue is FieldLookupValue)
                    {
                        entitySet.EntityId = ((FieldLookupValue)itemValue).LookupId;
                    }
                    else if (itemValue is ICollection<FieldLookupValue> && (itemValue as ICollection<FieldLookupValue>).Any())
                    {
                        entitySet.EntityId = (itemValue as ICollection<FieldLookupValue>).First().LookupId;
                    }
                    if (entitySet.SpQueryArgs != null)
                    {
                        entitySet.SpQueryArgs.Context = _args.Context;
                    }
                }
                return true;
            }
            else if (value is ISpEntityLookupCollection || typeof(ISpEntityLookupCollection).IsAssignableFrom(type))
            {
                var entitySets = (ISpEntityLookupCollection)value;
                if (entitySets != null)
                {
                    if (itemValue is ICollection<FieldLookupValue>)
                    {
                        entitySets.EntityIds = ((ICollection<FieldLookupValue>)itemValue).Select(lv => lv.LookupId).ToArray();
                    }
                    else if (itemValue is FieldLookupValue)
                    {
                        entitySets.EntityIds = new[] { (itemValue as FieldLookupValue).LookupId };
                    }
                    if (entitySets.SpQueryArgs != null)
                    {
                        entitySets.SpQueryArgs.Context = _args.Context;
                    }
                }
                return true;
            }

            return false;
        }

        public List GetList()
        {
            //Check.NotNull(_args, nameof(SpQueryArgs<TContext>));
            //Check.NotNull(_args.Context, nameof(TContext));

            if (_args != null && _args.Context != null)
            {
                var clientContext = _args.Context.Context;
                if (clientContext != null)
                {
                    return !string.IsNullOrEmpty(_args.ListUrl) ? clientContext.Web.GetList($"{_args.Context.SiteUrl.TrimEnd('/')}/{_args.ListUrl.TrimStart('/')}") :
                           (_args.ListId != default ? clientContext.Web.Lists.GetById(_args.ListId) :
                           (!string.IsNullOrEmpty(_args.ListTitle) ? clientContext.Web.Lists.GetByTitle(_args.ListTitle) : null));
                }
            }
            return null;
        }

        public ListItemCollection GetItems(Caml.View spView, ListItemCollectionPosition position, bool countOnly, bool fieldValuesAsText)
        {
            if (_args == null || spView == null) return null;

            string folderUrl = string.IsNullOrWhiteSpace(this._args.FolderUrl)
                ? null
                : new Uri(string.Concat(this._args.Context.SiteUrl.TrimEnd('/'), "/", string.IsNullOrEmpty(_args.ListUrl) ? "" : $"{_args.ListUrl.Trim('/')}/", (!string.IsNullOrEmpty(_args.ListUrl) ? this._args.FolderUrl.Replace(_args.ListUrl, "") : this._args.FolderUrl).TrimStart('/'))).LocalPath;
            var list = GetList();
            //if (list == null)
            //{
            //    Check.NotNull(list, nameof(List));
            //}
            //if (spView == null)
            //{
            //    Check.NotNull(spView, nameof(Caml.View));
            //}
            if (list != null && spView != null)
            {
                var items = list.GetItems(new CamlQuery() { DatesInUtc = true, FolderServerRelativeUrl = folderUrl, ViewXml = spView.ToString(true), ListItemCollectionPosition = position });
                if (countOnly)
                {
                    items.Context.Load(items, item => item.ListItemCollectionPosition, item => item.Include(i => i.Id));
                    return items;
                }
                else
                {
                    if (_args.IncludeItemPermissions)
                    {
                        items.Context.Load(items, item => item.Include(i => i.EffectiveBasePermissions));
                    }
                    if (/*fieldValuesAsText*/ false)
                    {
                        //BUG: NOT working!
                        items.Context.Load(items, item => item.ListItemCollectionPosition, item => item.Include(i => i.FieldValuesAsText));
                    }
                    else
                    {
                        items.Context.Load(items, item => item.ListItemCollectionPosition);
                    }
                    return items;
                }
            }
            return null;
        }

        public void ProcessItems(Caml.View spView, bool countOnly, bool fieldValuesAsText, Action<ListItemCollection> action)
        {
            if (_args == null || spView == null) return;

            if (action != null)
            {
                var rowLimit = spView.Limit;
                int itemCount = 0;
                int batchSize = _args.BatchSize;
                if (countOnly)
                {
                    _args.BatchSize = Math.Max(1000, batchSize);
                }
                ListItemCollectionPosition position = _args.IsPaged && !string.IsNullOrEmpty(_args.PagingInfo)
                  ? new ListItemCollectionPosition() { PagingInfo = _args.PagingInfo } : null;
                try
                {
                    Debug.WriteLine($"# Entity: {typeof(TEntity)}");
                    Debug.WriteLine($"# List: {_args}");
                    Debug.WriteLine($"# Folder Url: {_args.FolderUrl}");
                    Debug.WriteLine($"# Paging Info: {_args.PagingInfo}");
                    //Debug.WriteLine($"# Previous Paging Info: {_args.PrevPagingInfo}");
                    Debug.WriteLine("# SP Query:");
                    Debug.Write(spView);
                    Debug.WriteLine("");

                    do
                    {
                        if (_args.BatchSize > 0)
                        {
                            if (rowLimit > 0)
                            {
                                spView.Limit = Math.Min(rowLimit - itemCount, _args.BatchSize);
                            }
                            else
                            {
                                spView.Limit = _args.BatchSize;
                            }
                            if (spView.Limit == 0)
                            {
                                break;
                            }
                        }
                        var items = GetItems(spView, position, countOnly, fieldValuesAsText);
                        if (items != null)
                        {
                            items.Context.ExecuteQuery();
                            if (_args.BatchSize > 0)
                            {
                                position = items.ListItemCollectionPosition;
                            }
                            itemCount += items.Count;
                            action(items);
                        }
                    }
                    while (position != null);
                }
                finally
                {
                    spView.Limit = rowLimit;
                    _args.BatchSize = batchSize;
                }
            }
        }

        public IEnumerable<TEntity> GetEntities(Caml.View spView)
        {
            var entities = Enumerable.Empty<TEntity>();
            if (_args == null || spView == null) return entities;

            string pagingInfo = null;
            ProcessItems(spView, false, false, (items) =>
            {
                entities = entities.Concat(ToEntities(items));

                if (items.ListItemCollectionPosition != null)
                {
                    pagingInfo = items.ListItemCollectionPosition.PagingInfo;
                }
                else
                {
                    pagingInfo = null;
                }
                //_args.PrevPagingInfo = _args.PagingInfo;
                //_args.PagingInfo = pagingInfo;
            });
            _args.OnAfterEvent?.Invoke(pagingInfo);
            return entities;
        }

        public IEnumerable<ListItem> GetItems(Caml.View spView, bool fieldValuesAsText, out string pagingInfo)
        {
            var listItems = Enumerable.Empty<ListItem>();
            pagingInfo = null;
            if (_args == null || spView == null) return listItems;

            ListItemCollectionPosition position = null;
            ProcessItems(spView, false, fieldValuesAsText, (items) =>
             {
                 listItems = listItems.Concat(items.Cast<ListItem>());
                 position = items.ListItemCollectionPosition;
             });
            if (position != null)
            {
                pagingInfo = position.PagingInfo;
            }
            _args.OnAfterEvent?.Invoke(pagingInfo);
            return listItems;
        }

#if !SP2013 && !SP2016

        public async Task ProcessItemsAsync(Caml.View spView, bool countOnly, bool fieldValuesAsText, Action<ListItemCollection> action)
        {
            if (_args == null || spView == null) return;

            if (action != null)
            {
                var rowLimit = spView.Limit;
                int itemCount = 0;
                ListItemCollectionPosition position = null;
                do
                {
                    if (_args.BatchSize > 0)
                    {
                        if (rowLimit > 0)
                        {
                            spView.Limit = Math.Min(rowLimit - itemCount, _args.BatchSize);
                        }
                        else
                        {
                            spView.Limit = _args.BatchSize;
                        }
                        if (spView.Limit == 0)
                        {
                            break;
                        }
                    }
                    var items = GetItems(spView, position, countOnly, fieldValuesAsText);
                    if (items != null)
                    {
                        await items.Context.ExecuteQueryAsync();
                        if (_args.BatchSize > 0)
                        {
                            position = items.ListItemCollectionPosition;
                        }
                        itemCount += items.Count;
                        action(items);
                    }
                }
                while (position != null);
                spView.Limit = rowLimit;
            }
        }

        public async Task<IEnumerable<TEntity>> GetEntitiesAsync(Caml.View spView)
        {
            var entities = Enumerable.Empty<TEntity>();
            if (_args == null || spView == null) return entities;
            await ProcessItemsAsync(spView, false, false, (items) => entities = entities.Concat(ToEntities(items)));
            return entities;
        }
#endif
        public IEnumerable<ISpEntitySet> GetEntitySets(TEntity entity)
        {
            return AttributeHelper.GetFieldValuesOfType<TEntity, ISpEntitySet>(entity).Select(val => val.Value)
                .Concat(AttributeHelper.GetPropertyValuesOfType<TEntity, ISpEntitySet>(entity).Select(val => val.Value))
                .Cast<ISpEntitySet>();
        }

        public IEnumerable<TEntity> ToEntities(ListItemCollection items)
        {
            return ToEntities(items.Cast<ListItem>());
        }

        public IEnumerable<TEntity> ToEntities(IEnumerable<ListItem> items)
        {
            return items.Select(item => ToEntity(item));
        }

        public TEntity ToEntity(ListItem item)
        {
            var entity = new TEntity();
            if (_args != null)
            {
                if (item != null)
                {
                    foreach (var fieldMap in _args.FieldMappings)
                    {
                        PropertyInfo prop = entity.GetType().GetProperty(fieldMap.Key, BindingFlags.Public | BindingFlags.Instance);
                        if (null != prop)
                        {
                            if (prop.CustomAttributes.Any(att => att.AttributeType == typeof(RemovedFieldAttribute))) continue;
                            if (fieldMap.Value.Name == "ID" && item.IsPropertyAvailable("Id"))
                            {
                                if (prop.CanWrite)
                                {
                                    prop.SetValue(entity, SpConverter.ConvertValue(item.Id, prop.PropertyType));
                                }
                                continue;
                            }
                            if (item.FieldValues.ContainsKey(fieldMap.Value.Name))
                            {
                                object value = item[fieldMap.Value.Name];
                                if (!SetEntityLookup(prop.PropertyType, prop.GetValue(entity), value))
                                {
                                    if (typeof(IListItemEntity).IsAssignableFrom(prop.PropertyType))
                                    {
                                        continue;
                                    }
                                    if (!prop.CanWrite) continue;
                                    value = GetFieldValue(fieldMap.Value, prop.PropertyType, value);
                                    value = SpConverter.ConvertValue(value, prop.PropertyType);
                                    prop.SetValue(entity, value);
                                }
                            }
                        }
                        FieldInfo field = entity.GetType().GetField(fieldMap.Key, BindingFlags.Public | BindingFlags.Instance);
                        if (null != field)
                        {
                            if (field.CustomAttributes.Any(att => att.AttributeType == typeof(RemovedFieldAttribute))) continue;
                            if (fieldMap.Value.Name == "ID" && item.IsPropertyAvailable("Id"))
                            {
                                field.SetValue(entity, SpConverter.ConvertValue(item.Id, field.FieldType));
                                continue;
                            }
                            if (item.FieldValues.ContainsKey(fieldMap.Value.Name))
                            {
                                object value = item[fieldMap.Value.Name];
                                value = GetFieldValue(fieldMap.Value, field.FieldType, value);
                                value = SpConverter.ConvertValue(value, field.FieldType);
                                field.SetValue(entity, value);
                            }
                        }
                    }
                    if (_args.IncludeItemPermissions)
                    {
                        if (item.IsPropertyAvailable("EffectiveBasePermissions"))
                        {
                            if (entity is ListItemEntity)
                            {
                                (entity as ListItemEntity).EffectiveBasePermissions = item.EffectiveBasePermissions;
                            }
                        }
                    }

                    if (typeof(ICustomMapping).IsAssignableFrom(entity.GetType()))
                    {
                        (entity as ICustomMapping).MapFrom(item);
                    }
                }

                foreach (var entitySet in GetEntitySets(entity))
                {
                    if (entitySet != null && entitySet.SpQueryArgs != null)
                    {
                        entitySet.SpQueryArgs.Context = _args.Context;
                    }
                }
            }
            return entity;
        }

        public ListItem Update(int itemId, Dictionary<string, object> properties, int version, bool systemUpdate = false, Func<ListItem, bool> onUpdating = null, bool reloadAllValues = false)
        {
            if (properties == null || _args == null) return null;

            List list = GetList();
            if (list == null)
            {
                Check.NotNull(list, nameof(List));
            }
            ListItem listItem = itemId > 0
                ? list.GetItemById(itemId)
                : list.AddItem(new ListItemCreationInformation());

            var fieldMappings = _args.FieldMappings;

            bool fUpdate = false;

            foreach (var property in properties)
            {
                if (!fieldMappings.ContainsKey(property.Key)) continue;

                var fieldMapping = fieldMappings[property.Key];

                if (fieldMapping.IsReadOnly
                    || typeof(DependentLookupFieldAttribute).IsAssignableFrom(fieldMapping.GetType())
                    || typeof(CalculatedFieldAttribute).IsAssignableFrom(fieldMapping.GetType())
                    || fieldMapping.DataType == FieldType.Calculated)
                {
                    continue;
                }

                var value = property.Value;
                if (itemId > 0 || (itemId <= 0 && !Equals(value, default)))
                {
                    if (value != null)
                    {
                        if (fieldMapping.DataType == FieldType.Choice)
                        {
                            Type valueType = value.GetType();
                            if (valueType.IsEnum)
                            {
                                value = EnumExtensions.GetChoiceValueString(valueType, value);
                            }
                        }
                        if (fieldMapping.DataType == FieldType.MultiChoice)
                        {
                            Type valueType = value.GetType();
                            if (valueType.IsEnum)
                            {
                                value = EnumExtensions.GetChoiceValuesString(valueType, value).ToArray();
                            }
                        }
                        else if (fieldMapping.DataType == FieldType.Lookup)
                        {
                            if (typeof(LookupFieldAttribute).IsAssignableFrom(fieldMapping.GetType()))
                            {
                                if ((fieldMapping as LookupFieldAttribute).Result == LookupItemResult.Value)
                                {
                                    continue;
                                }
                                else if ((fieldMapping as LookupFieldAttribute).IsMultiple)
                                {
                                    if (!(value is ICollection<FieldLookupValue>))
                                    {
                                        value = value is ICollection<int> ? (value as ICollection<int>).Select(id => new FieldLookupValue() { LookupId = id }).ToArray() : null;
                                    }
                                }
                                else
                                {
                                    if (value is IListItemEntity)
                                    {
                                    }
                                }
                            }
                        }
                    }
                    listItem[fieldMapping.Name] = value;
                    fUpdate = true;
                }
            }

            if (onUpdating != null)
            {
                fUpdate = onUpdating(listItem) || fUpdate;
            }

            if (fUpdate)
            {
                if (version > 0)
                {
                    listItem["owshiddenversion"] = version;
                }
                reloadAllValues = true;
                var fieldNamesToLoad = (reloadAllValues
                ? fieldMappings.Values.Where(
                    field => !typeof(DependentLookupFieldAttribute).IsAssignableFrom(field.GetType()))
                    .Select(field => field.Name)
                : listItem.FieldValues.Keys).Concat(new[] { "ID", "ContentTypeId", "owshiddenversion" }).Distinct();

                var retrievals = fieldNamesToLoad.Select(fieldName =>
                     { return (Expression<Func<ListItem, object>>)(item => item[fieldName]); }).ToArray();

                if (systemUpdate)
                {
#if !SP2013 && !SP2016
                    listItem.SystemUpdate();
#else
                    throw new NotSupportedException("ListItem.SystemUpdate()");
#endif
                }
                else
                {
                    listItem.Update();
                }

                listItem.Context.Load(listItem, retrievals);
                if (_args.IncludeItemPermissions)
                {
                    listItem.Context.Load(listItem, item => item.EffectiveBasePermissions);
                }
                return listItem;
            }
            return null;
        }

        public IEnumerable<ListItem> DeleteItems(IEnumerable<int> itemIds, bool recycle)
        {
            if (itemIds != null && itemIds.Any())
            {
                List list = GetList();
                if (list == null)
                {
                    Check.NotNull(list, nameof(List));
                }
                foreach (int itemId in itemIds)
                {
                    ListItem listItem = list.GetItemById(itemId);
                    //list.Context.Load(listItem);
                    if (recycle)
                    {
                        listItem.Recycle();
                    }
                    else
                    {
                        listItem.DeleteObject();
                    }
                    yield return listItem;
                }
            }
        }

        #endregion
    }
}
