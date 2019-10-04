using JetBrains.Annotations;
using Microsoft.SharePoint.Client;
using SP.Client.Linq.Attributes;
using SP.Client.Linq.Query;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;

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

        public bool HasChanges => State == EntityState.Added || State == EntityState.Modified || State == EntityState.Deleted;

        #endregion

        #region Methods

        private void FetchOriginalValues()
        {
            OriginalValues = new ConcurrentDictionary<string, object>();
            foreach (var value in GetValues(Entity))
            {
                if (!SpQueryArgs.FieldMappings.ContainsKey(value.Key)) continue;
                var fieldMapping = SpQueryArgs.FieldMappings[value.Key];
                if (fieldMapping.IsReadOnly) continue;

                if (value.Value != null && fieldMapping.Name.ToLower() == "owshiddenversion")
                {
                    Version = (int)value.Value;
                }
                if (value.Value is ISpEntityLookup)
                {
                    OriginalValues[value.Key] = (value.Value as ISpEntityLookup).EntityId;
                }
                if (value.Value is ISpEntityLookupCollection)
                {
                    OriginalValues[value.Key] = (value.Value as ISpEntityLookupCollection).EntityIds;
                }
                else if (!Equals(default, value.Value))
                {
                    OriginalValues[value.Key] = value.Value;
                }
            }
            State = EntityState.Unchanged;
        }

        public void Attach()
        {
            lock (_lock)
            {
                Detach();
                if (Context != null)
                {
                    Context.OnBeforeSaveChanges += Context_OnOnBeforeSaveChanges;
                    Context.OnAfterSaveChanges += Context_OnAfterSaveChanges;
                    State = EntityState.Unchanged;
                }
            }
        }

        public void Detach()
        {
            lock (_lock)
            {
                State = EntityState.Detached;
                CurrentValues = new ConcurrentDictionary<string, object>();
                if (Context != null)
                {
                    Context.OnBeforeSaveChanges -= Context_OnOnBeforeSaveChanges;
                    Context.OnAfterSaveChanges -= Context_OnAfterSaveChanges;
                }
            }
        }

        private void Context_OnOnBeforeSaveChanges(ISpEntryDataContext context, SpSaveArgs args)
        {
            _item = null;
            if (HasChanges)
            {
                Debug.WriteLine($"Saving list item: {Entity}.");
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
                    Debug.WriteLine($"List item saved: {Entity}.");

                    Detach();
                    EntityId = _item.Id;
                    Entity = _manager.MapEntity(_item);
                    Attach();
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
                        return _manager.Update(EntityId, CurrentValues.ToDictionary(pair => pair.Key, pair => pair.Value), Version,
                            (listItem) =>
                            {
                                if (typeof(ICustomMapping).IsAssignableFrom(Entity.GetType()))
                                {
                                    return (Entity as ICustomMapping).MapTo(listItem);
                                }
                                return false;
                            });
                    case EntityState.Deleted:
                        return _manager.DeleteItems(new[] { EntityId }).FirstOrDefault();
                }
                return null;
            }
        }

        private static Dictionary<string, object> GetValues(TEntity entity)
        {
            return AttributeHelper.GetFieldValues<TEntity, FieldAttribute>(entity)
              .Concat(AttributeHelper.GetPropertyValues<TEntity, FieldAttribute>(entity)).ToDictionary(val => val.Key.Name, val => val.Value);
        }

        private bool DetectChanges(FieldAttribute field, object originalValue, ref object currentValue)
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
                    currentValue = (currentValue as ISpEntityLookupCollection).EntityIds.Where(entityId => entityId > 0).ToArray();
                    isChanged = !Equals(default(int[]), currentValue);
                }
                else if (originalValue is ISpEntityLookupCollection && !Equals((originalValue as ISpEntityLookupCollection).EntityIds, (currentValue as ISpEntityLookupCollection).EntityIds))
                {
                    currentValue = (currentValue as ISpEntityLookupCollection).EntityIds.Where(entityId => entityId > 0).ToArray();
                    isChanged = EntityId > 0 || !Equals(default(int[]), currentValue);
                }
                else
                {
                    if (EntityId <= 0)
                    {
                        currentValue = (currentValue as ISpEntityLookupCollection).EntityIds.Where(entityId => entityId > 0).ToArray();
                        isChanged = !Equals(default(int[]), currentValue);
                    }
                }
            }
            else
            {
                if (typeof(ISpChangeTracker).IsAssignableFrom(Entity.GetType()))
                {
                    isChanged = (Entity as ISpChangeTracker).DetectChanges(field, originalValue, ref currentValue);
                }
                else
                {
                    isChanged = !Equals(originalValue, currentValue);
                }

                if (EntityId > 0)
                {
                    //nothing
                }
                else
                {
                    isChanged = currentValue != null && !Equals(currentValue.GetType().GetDefaultValue(), currentValue);
                }
            }
            return isChanged;
        }

        public bool DetectChanges()
        {
            lock (_lock)
            {
                if (State == EntityState.Deleted) return false;
                if (State == EntityState.Detached) return false;

                CurrentValues = new ConcurrentDictionary<string, object>();

                foreach (var currentValue in GetValues(Entity))
                {
                    if (!SpQueryArgs.FieldMappings.ContainsKey(currentValue.Key)) continue;
                    var fieldMapping = SpQueryArgs.FieldMappings[currentValue.Key];
                    if (fieldMapping == null) continue;
                    if (fieldMapping.IsReadOnly || typeof(DependentLookupFieldAttribute).IsAssignableFrom(fieldMapping.GetType())
                    || typeof(CalculatedFieldAttribute).IsAssignableFrom(fieldMapping.GetType())
                    || fieldMapping.DataType == FieldType.Calculated) continue;

                    var value = currentValue.Value;
                    var originalValue = OriginalValues.ContainsKey(currentValue.Key) ? OriginalValues[currentValue.Key] : null;
                    bool isChanged = DetectChanges(fieldMapping, originalValue, ref value);
                    if (isChanged)
                    {
                        if (Equals(default, value))
                        {
                            if (fieldMapping.Required)
                            {
                                throw new Exception($"Field '{fieldMapping.Name}' is required.");
                            }
                            if (Entity.Id <= 0)
                            {
                                continue;
                            }
                        }

                        CurrentValues[currentValue.Key] = value;
                    }
                }
                return CurrentValues.Count > 0;
            }
        }

        public bool IsValueChanged(string propertyName)
        {
            if (CurrentValues != null)
            {
                return CurrentValues.ContainsKey(propertyName);
            }
            return false;
        }

        public TEntity Reload(bool update = false)
        {
            if (EntityId > 0 && Context != null && SpQueryArgs != null)
            {
                lock (_lock)
                {
                    var entity = Context.List<TEntity>().FirstOrDefault(item => item.Id == EntityId);
                    if (entity != null)
                    {
                        Detach();
                        if (update)
                        {
                            var entry = entity.GetEntry(SpQueryArgs);
                            entry.Entity = Entity;
                            entry.Update();

                            Entity = entity;
                            Attach();
                            this.State = entry.State;
                            CurrentValues = entry.CurrentValues;
                            entry.Detach();
                        }
                        else
                        {
                            Entity = entity;
                            Attach();
                        }
                    }
                    else
                    {
                        EntityId = 0;
                        if (update)
                        {
                            Update();
                        }
                    }
                    return entity;
                }
            }
            return Entity;
        }

        public bool Update()
        {
            lock (_lock)
            {
                bool hasChanges = DetectChanges();
                if (hasChanges)
                {
                    State = EntityId > 0 ? EntityState.Modified : EntityState.Added;
                }

                foreach (var currentValue in GetValues(Entity))
                {
                    if (currentValue.Value is ISpEntityLookup)
                    {
                        if ((currentValue.Value as ISpEntityLookup).SpQueryArgs != null && (currentValue.Value as ISpEntityLookup).SpQueryArgs.Context == null)
                        {
                            (currentValue.Value as ISpEntityLookup).SpQueryArgs.Context = this.Context;
                        }
                        hasChanges = (currentValue.Value as ISpEntityLookup).Update() || hasChanges;
                    }
                    else if (currentValue.Value is ISpEntityLookupCollection)
                    {
                        if ((currentValue.Value as ISpEntityLookupCollection).SpQueryArgs != null && (currentValue.Value as ISpEntityLookupCollection).SpQueryArgs.Context == null)
                        {
                            (currentValue.Value as ISpEntityLookupCollection).SpQueryArgs.Context = this.Context;
                        }
                        hasChanges = (currentValue.Value as ISpEntityLookupCollection).Update() || hasChanges;
                    }
                }
                return hasChanges;
            }
        }

        public void Delete()
        {
            State = EntityId > 0 ? EntityState.Deleted : EntityState.Detached;
        }

        #endregion
    }
}
