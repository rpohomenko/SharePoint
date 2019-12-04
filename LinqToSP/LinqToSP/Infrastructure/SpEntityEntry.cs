using JetBrains.Annotations;
using Microsoft.SharePoint.Client;
using SP.Client.Linq.Attributes;
using SP.Client.Linq.Query;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.Linq;
using System.Reflection;

namespace SP.Client.Linq.Infrastructure
{
    public sealed class SpEntityEntry<TEntity, TContext>
        where TEntity : class, IListItemEntity, new()
        where TContext : class, ISpEntryDataContext
    {
        #region Fields
        private readonly SpQueryManager<TEntity, TContext> _manager;
        private ListItem _item;
        private readonly object _lock = new object();
        public event Action<SpEntityEntry<TEntity, TContext>, ListItem> OnBeforeSaveChanges;
        public event Action<SpEntityEntry<TEntity, TContext>, ListItem> OnAfterSaveChanges;

        #endregion

        #region Constructors
        public SpEntityEntry([NotNull] TEntity entity, [NotNull] SpQueryArgs<TContext> args)
        {
            EntityId = entity != null ? entity.Id : 0;
            Entity = entity;
            SpQueryArgs = args;
            _manager = new SpQueryManager<TEntity, TContext>(args);
            FetchOriginalValues();
            State = EntityState.Detached;
            Attach();
        }

        #endregion

        #region Properties
        public TContext Context { get { return SpQueryArgs.Context; } internal set { SpQueryArgs.Context = value; } }
        public SpQueryArgs<TContext> SpQueryArgs { get; }
        public TEntity Entity { get; private set; }
        public int EntityId { get; internal set; }

        private ConcurrentDictionary<string, object> CurrentValues { get; set; }

        private ConcurrentDictionary<string, object> OriginalValues { get; set; }

        public int Version { get; private set; }

        public EntityState State { get; private set; }

        public bool HasChanges => State == EntityState.Added || State == EntityState.Modified || State == EntityState.Deleted || State == EntityState.Recycled;

        public bool SystemUpdate { get; set; }
        public bool AutoUpdateLookups { get; set; }

        #endregion

        #region Methods

        private void FetchOriginalValues()
        {
            OriginalValues = new ConcurrentDictionary<string, object>();
            if (Entity != null)
                foreach (var value in GetValues(Entity))
                {
                    if (!SpQueryArgs.FieldMappings.ContainsKey(value.Key.Name)) continue;
                    var fieldMapping = SpQueryArgs.FieldMappings[value.Key.Name];
                    if (fieldMapping.IsReadOnly) continue;

                    if (value.Value != null && fieldMapping.Name.ToLower() == "owshiddenversion")
                    {
                        Version = (int)value.Value;
                    }
                    else
                    {
                        if ((typeof(ISpEntityLookup).IsAssignableFrom(value.Key.GetMemberType()) || typeof(ISpEntityLookupCollection).IsAssignableFrom(value.Key.GetMemberType())
                            || (value.Key is PropertyInfo && (value.Key as PropertyInfo).CanWrite))
                            && !Equals(default, value.Value))
                        {
                            OriginalValues[value.Key.Name] = value.Value;
                        }
                    }
                }
            State = EntityState.Unchanged;
        }

        private void Entity_PropertyChanging(object sender, PropertyChangingEventArgs e)
        {

        }

        private void Entity_PropertyChanged(object sender, PropertyChangedEventArgs e)
        {
            //var property = sender.GetType().GetProperty(e.PropertyName);
            //if (property != null)
            //{
            //    var value = property.GetValue(sender);
            //    //TODO:
            //    bool isChanged = DetectChanges(e.PropertyName, value);
            //}
        }

        public void Attach()
        {
            lock (_lock)
            {
                var currentState = State;
                if (currentState != EntityState.Detached)
                {
                    Detach();
                }
                if (Context != null)
                {
                    Context.OnBeforeSaveChanges += Context_OnOnBeforeSaveChanges;
                    Context.OnAfterSaveChanges += Context_OnAfterSaveChanges;
                    State = currentState == EntityState.Detached ? EntityState.Unchanged : currentState;
                }
                if (Entity != null)
                {
                    if (Entity is ISpChangeTracker)
                    {
                        (Entity as ISpChangeTracker).PropertyChanging += Entity_PropertyChanging;
                        (Entity as ISpChangeTracker).PropertyChanged += Entity_PropertyChanged;
                    }
                }
            }
        }

        public void Detach()
        {
            lock (_lock)
            {
                State = EntityState.Detached;
                CurrentValues = null;
                if (Context != null)
                {
                    Context.OnBeforeSaveChanges -= Context_OnOnBeforeSaveChanges;
                    Context.OnAfterSaveChanges -= Context_OnAfterSaveChanges;
                }
                if (Entity != null)
                {
                    if (Entity is ISpChangeTracker)
                    {
                        (Entity as ISpChangeTracker).PropertyChanging -= Entity_PropertyChanging;
                        (Entity as ISpChangeTracker).PropertyChanged -= Entity_PropertyChanged;
                    }
                }
            }
        }

        private void Context_OnOnBeforeSaveChanges(ISpEntryDataContext context, SpSaveArgs args)
        {
            _item = null;
            if (HasChanges)
            {
                if (State == EntityState.Deleted)
                {
                    Debug.WriteLine($"Deleting list item: {Entity}.");
                }
                else if (State == EntityState.Recycled)
                {
                    Debug.WriteLine($"Recycling list item: {Entity}.");
                }
                else
                {
                    Debug.WriteLine($"Saving list item: {Entity}.");
                }
                _item = Save();
                if (_item != null)
                {
                    args.Items[_item] = true;
                    args.HasChanges = true;
                    OnBeforeSaveChanges?.Invoke(this, _item);
                }
            }
        }
        private void Context_OnAfterSaveChanges(ISpEntryDataContext context, SpSaveArgs args)
        {
            if (_item != null)
            {
                if (args.Items.ContainsKey(_item) && args.Items[_item])
                {
                    var state = State;
                    if (state == EntityState.Deleted)
                    {
                        Debug.WriteLine($"List item deleted: {Entity}.");
                    }
                    else if (state == EntityState.Recycled)
                    {
                        Debug.WriteLine($"List item recycled: {Entity}.");
                    }
                    else
                    {
                        Debug.WriteLine($"List item saved: {Entity}.");
                    }

                    if (state != EntityState.Deleted && state != EntityState.Recycled)
                    {
                        Detach();

                        if (_item.IsPropertyAvailable("Id") || _item.FieldValues.ContainsKey("ID"))
                        {
                            EntityId = _item.FieldValues.ContainsKey("ID") ? (int)_item["ID"] : _item.Id;
                            Entity = _manager.ToEntity(_item);
                            Version = Entity.Version.HasValue ? Entity.Version.Value : Version;
                            FetchOriginalValues();
                            Attach();
                        }
                    }
                    OnAfterSaveChanges?.Invoke(this, _item);
                }
            }
        }

        private ListItem Save()
        {
            lock (_lock)
            {
                switch (State)
                {
                    case EntityState.Added:
                    case EntityState.Modified:
                        return _manager.Update(EntityId, CurrentValues.ToDictionary(pair => pair.Key, pair => pair.Value), Version, SystemUpdate,
                            (listItem) =>
                            {
                                if (typeof(ICustomMapping).IsAssignableFrom(Entity.GetType()))
                                {
                                    return (Entity as ICustomMapping).MapTo(listItem);
                                }
                                return false;
                            }, true);
                    case EntityState.Deleted:
                    case EntityState.Recycled:
                        return _manager.DeleteItems(new[] { EntityId }, State == EntityState.Recycled).FirstOrDefault();
                }
                return null;
            }
        }

        private static Dictionary<MemberInfo, object> GetValues(TEntity entity)
        {
            return AttributeHelper.GetFieldValues<TEntity, FieldAttribute>(entity)
              .Concat(AttributeHelper.GetPropertyValues<TEntity, FieldAttribute>(entity)).ToDictionary(val => val.Key, val => val.Value);
        }

        private bool DetectChanges(string propKey, FieldAttribute field, object originalValue, ref object currentValue)
        {
            bool isChanged = false;

            if (currentValue is ISpEntityLookup)
            {
                if (originalValue == null)
                {
                    currentValue = (currentValue as ISpEntityLookup).EntityId;
                    isChanged = !Equals(default(int), currentValue);
                }
                else if (originalValue is ISpEntityLookup && !Equals((originalValue as ISpEntityLookup).EntityId, (currentValue as ISpEntityLookup).EntityId))
                {
                    currentValue = (currentValue as ISpEntityLookup).EntityId;
                    isChanged = EntityId > 0 || !Equals(default(int), currentValue);
                }
                else
                {
                    if (EntityId <= 0)
                    {
                        currentValue = (currentValue as ISpEntityLookup).EntityId;
                        isChanged = !Equals(default(int), currentValue);
                    }
                }
            }
            else if (currentValue is ISpEntityLookupCollection)
            {
                if (originalValue == null)
                {
                    if ((currentValue as ISpEntityLookupCollection).EntityIds == null)
                    {
                        currentValue = default(int[]);
                    }
                    else
                    {
                        currentValue = (currentValue as ISpEntityLookupCollection).EntityIds.Where(entityId => entityId > 0).OrderBy(entityId => entityId > 0).ToArray();
                    }
                    isChanged = !Equals(default(int[]), currentValue);
                }
                else if (originalValue is ISpEntityLookupCollection && !Equals((originalValue as ISpEntityLookupCollection).EntityIds, (currentValue as ISpEntityLookupCollection).EntityIds))
                {
                    if ((currentValue as ISpEntityLookupCollection).EntityIds == null)
                    {
                        currentValue = default(int[]);
                        isChanged = EntityId > 0 && (originalValue as ISpEntityLookupCollection).EntityIds.Where(entityId => entityId > 0).OrderBy(entityId => entityId > 0).Any();
                    }
                    else
                    {
                        if ((originalValue as ISpEntityLookupCollection).EntityIds == null || !(originalValue as ISpEntityLookupCollection).EntityIds.Where(entityId => entityId > 0).OrderBy(entityId => entityId > 0)
                            .SequenceEqual((currentValue as ISpEntityLookupCollection).EntityIds.Where(entityId => entityId > 0).OrderBy(entityId => entityId > 0)))
                        {
                            currentValue = (currentValue as ISpEntityLookupCollection).EntityIds.Where(entityId => entityId > 0).OrderBy(entityId => entityId > 0).ToArray();
                            isChanged = EntityId > 0 || !Equals(default(int[]), currentValue);
                        }
                    }
                }
                else
                {
                    if (EntityId <= 0)
                    {
                        if ((currentValue as ISpEntityLookupCollection).EntityIds == null)
                        {
                            currentValue = default(int[]);
                        }
                        else
                        {
                            currentValue = (currentValue as ISpEntityLookupCollection).EntityIds.Where(entityId => entityId > 0).ToArray();
                        }
                        isChanged = !Equals(default(int[]), currentValue);
                    }
                }
            }
            else if (currentValue is IListItemEntity)
            {
                isChanged = originalValue == null ? true : (originalValue as IListItemEntity).Id != (currentValue as IListItemEntity).Id;
                currentValue = (currentValue as IListItemEntity).Id;
            }
            else if (currentValue is ICollection<IListItemEntity>)
            {
                isChanged = originalValue == null ? true
                    : (originalValue as ICollection<IListItemEntity>).Where(v => v.Id > 0).OrderBy(v => v.Id).Select(v => v.Id)
                      .SequenceEqual((currentValue as ICollection<IListItemEntity>).Where(v => v.Id > 0).OrderBy(v => v.Id).Select(v => v.Id));
                currentValue = (currentValue as ICollection<IListItemEntity>).Where(v => v.Id > 0).OrderBy(v => v.Id).Select(v => v.Id).ToArray();
            }
            else
            {
                if (field.Name.ToLower() == "owshiddenversion")
                {
                    //if (currentValue != null)
                    //{
                    //  int newVersion = Convert.ToInt32(currentValue);
                    //  if (Version > 0 && newVersion > 0 && Version > newVersion)
                    //  {
                    //    throw new Exception($"Versions conflict: {Version}.");
                    //  }
                    //  if (!Equals(Version, newVersion))
                    //  {
                    //    Version = newVersion;
                    //  }
                    //}
                    return false;
                }
                if (typeof(ISpChangeTracker).IsAssignableFrom(Entity.GetType()))
                {
                    isChanged = (Entity as ISpChangeTracker).DetectChanges(propKey, field, originalValue, ref currentValue);
                }
                else
                {
                    isChanged = !Equals(originalValue, currentValue);
                }

                if (EntityId > 0)
                {
                    if (Entity.Id == 0 && !isChanged && !(originalValue == null || Equals(originalValue.GetType().GetDefaultValue(), originalValue)))
                    {
                        isChanged = true;
                    }
                }
                else
                {
                    isChanged = currentValue != null && !Equals(currentValue.GetType().GetDefaultValue(), currentValue);
                }
            }
            return isChanged;
        }

        private bool DetectChanges(string propKey, object value)
        {
            if (!SpQueryArgs.FieldMappings.ContainsKey(propKey)) return false;
            var fieldMapping = SpQueryArgs.FieldMappings[propKey];
            if (fieldMapping == null) return false;
            if (fieldMapping.IsReadOnly || typeof(DependentLookupFieldAttribute).IsAssignableFrom(fieldMapping.GetType())
            || typeof(CalculatedFieldAttribute).IsAssignableFrom(fieldMapping.GetType())
            || fieldMapping.DataType == FieldType.Calculated) return false;

            var originalValue = OriginalValues.ContainsKey(propKey) ? OriginalValues[propKey] : null;
            bool isChanged = DetectChanges(propKey, fieldMapping, originalValue, ref value);
            if (isChanged)
            {
                if (value is IListItemEntity)
                {
                    value = (value as IListItemEntity).Id;
                }
                if (Equals(default, value))
                {
                    if (fieldMapping.Required)
                    {
                        throw new Exception($"Field '{fieldMapping.Name}' is required.");
                    }
                    if (!isChanged && EntityId <= 0)
                    {
                        return false;
                    }
                }

                CurrentValues[propKey] = value;
            }
            return isChanged;
        }

        public void Merge(TEntity entity)
        {
            if (entity != null)
            {
                SpEntityEntry<TEntity, TContext> spEntityEntry = new SpEntityEntry<TEntity, TContext>(entity, this.SpQueryArgs);
                this.Merge(entity, spEntityEntry.OriginalValues.Keys.ToArray<string>());
                this.Version = spEntityEntry.Version;
            }
        }

        private void Merge(TEntity entity, params string[] propKeys)
        {
            if (propKeys != null)
            {
                for (int i = 0; i < propKeys.Length; i++)
                {
                    string propKey = propKeys[i];
                    this.Merge(propKey, entity);
                }
            }
        }

        private void Merge(string propKey, TEntity fromEntity)
        {

            TEntity toEntity = Entity;
            if (!string.IsNullOrEmpty(propKey) && fromEntity != null && toEntity != null)
            {
                var prop = typeof(TEntity).GetProperty(propKey);
                if (prop == null)
                {
                    var field = typeof(TEntity).GetField(propKey);
                    if (field == null) return;
                    object value = field.GetValue(fromEntity);
                    field.SetValue(toEntity, value);
                }
                else
                {
                    object value = prop.GetValue(fromEntity);
                    if (prop.CanWrite)
                    {
                        prop.SetValue(toEntity, value);
                    }
                }
            }
        }
        private bool UpdateLookups()
        {
            bool hasChanges = false;
            if (Entity != null)
                foreach (var currentValue in GetValues(Entity))
                {
                    if (currentValue.Value is ISpEntityLookup)
                    {
                        if ((currentValue.Value as ISpEntityLookup).SpQueryArgs.Context == null)
                        {
                            (currentValue.Value as ISpEntityLookup).SpQueryArgs.Context = Context;
                        }
                        hasChanges = (currentValue.Value as ISpEntityLookup).Update() || hasChanges;
                    }
                    else if (currentValue.Value is ISpEntityLookupCollection)
                    {
                        if ((currentValue.Value as ISpEntityLookupCollection).SpQueryArgs.Context == null)
                        {
                            (currentValue.Value as ISpEntityLookupCollection).SpQueryArgs.Context = Context;
                        }
                        hasChanges = (currentValue.Value as ISpEntityLookupCollection).Update() || hasChanges;
                    }
                }
            return hasChanges;
        }

        public bool DetectChanges()
        {
            lock (_lock)
            {
                if (State == EntityState.Deleted) return false;
                if (State == EntityState.Recycled) return false;
                if (State == EntityState.Detached) return false;

                CurrentValues = new ConcurrentDictionary<string, object>();
                if (Entity != null)
                    foreach (var currentValue in GetValues(Entity))
                    {
                        if (currentValue.Value is ISpEntityLookup)
                        {
                            if ((currentValue.Value as ISpEntityLookup).SpQueryArgs != null && (currentValue.Value as ISpEntityLookup).SpQueryArgs.Context == null)
                            {
                                (currentValue.Value as ISpEntityLookup).SpQueryArgs.Context = this.Context;
                            }
                        }
                        else if (currentValue.Value is ISpEntityLookupCollection)
                        {
                            if ((currentValue.Value as ISpEntityLookupCollection).SpQueryArgs != null && (currentValue.Value as ISpEntityLookupCollection).SpQueryArgs.Context == null)
                            {
                                (currentValue.Value as ISpEntityLookupCollection).SpQueryArgs.Context = this.Context;
                            }
                        }

                        bool isChanged = DetectChanges(currentValue.Key.Name, currentValue.Value);
                    }
                return CurrentValues.Count > 0;
            }
        }

        public bool IsValueChanged(string propKey)
        {
            if (CurrentValues != null)
            {
                return CurrentValues.ContainsKey(propKey);
            }
            return false;
        }

        public TEntity Reload()
        {
            lock (_lock)
            {
                if (EntityId > 0 && Context != null)
                {
                    var entity = Context.List<TEntity>().FirstOrDefault(item => item.Id == EntityId);
                    if (entity != null)
                    {
                        Detach();
                        Entity = entity;
                        FetchOriginalValues();
                        Attach();
                    }
                    else
                    {
                        EntityId = 0;
                        //Entity = null;
                    }
                    return entity;
                }

                return Entity;
            }
        }

        public bool Update()
        {
            lock (_lock)
            {
                if (State != EntityState.Detached)
                {
                    Attach();
                }
                bool hasChanges = DetectChanges();
                if (hasChanges)
                {
                    State = EntityId > 0 ? EntityState.Modified : EntityState.Added;
                }

                if (AutoUpdateLookups)
                {
                    hasChanges = UpdateLookups() || hasChanges;
                }

                return hasChanges;
            }
        }

        public bool Update(TEntity entity)
        {
            lock (_lock)
            {
                if (entity != null && Context != null && SpQueryArgs != null)
                {
                    if (Entity != null)
                    {
                        var originalEntity = Entity;
                        Entity = entity;
                        bool result = false;
                        try
                        {
                            result = Update();
                        }
                        finally
                        {
                            Entity = originalEntity;
                        }

                        var currentValues = this.CurrentValues;
                        Merge(entity, currentValues.Keys.ToArray());
                        Attach();
                        CurrentValues = currentValues;
                        return result;
                    }
                }
                else
                {
                    return Update();
                }
            }
            return false;
        }

        public void Delete()
        {
            State = EntityId > 0 ? EntityState.Deleted : EntityState.Detached;
        }

        public void Recycle()
        {
            State = EntityId > 0 ? EntityState.Recycled : EntityState.Detached;
        }

        #endregion
    }
}
