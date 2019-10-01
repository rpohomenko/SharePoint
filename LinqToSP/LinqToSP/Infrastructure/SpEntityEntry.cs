using JetBrains.Annotations;
using Microsoft.SharePoint.Client;
using SP.Client.Linq.Attributes;
using SP.Client.Linq.Query;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
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
        public event Action<ListItem> OnBeforeSaveChanges;
        public event Action<ListItem> OnAfterSaveChanges;

        #endregion

        #region Constructors
        public SpEntityEntry([NotNull] TEntity entity, [NotNull] SpQueryArgs<TContext> args)
        {
            EntityId = entity != null ? entity.Id : 0;
            Entity = entity;
            SpQueryArgs = args;
            _manager = new SpQueryManager<TEntity, TContext>(args);
            Context.OnBeforeSaveChanges += Context_OnOnBeforeSaveChanges;
            Context.OnAfterSaveChanges += Context_OnAfterSaveChanges;
            Attach();
        }

        #endregion

        #region Properties
        public TContext Context { get { return SpQueryArgs.Context; } }
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
        public void Attach()
        {
            lock (_lock)
            {
                CurrentValues = new ConcurrentDictionary<string, object>();
                OriginalValues = new ConcurrentDictionary<string, object>();
                State = EntityState.Unchanged;

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
            }
        }

        public void Detach()
        {
            lock (_lock)
            {
                CurrentValues = new ConcurrentDictionary<string, object>();
                //requires to reload it after saving item.
                State = EntityState.Detached;
            }
        }

        private void Context_OnOnBeforeSaveChanges(SpSaveArgs args)
        {
            if (HasChanges)
            {
                _item = Save();
                if (_item != null)
                {
                    args.Items.Add(_item);
                    //requires to reload it after saving item.
                    Detach();
                    args.HasChanges = true;
                    OnBeforeSaveChanges?.Invoke(_item);
                }
            }
        }
        private void Context_OnAfterSaveChanges(SpSaveArgs args)
        {
            if (_item != null)
            {
                EntityId = _item.Id;
                Entity = _manager.MapEntity(Entity, _item);
                Attach();
                OnAfterSaveChanges?.Invoke(_item);
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
            if (currentValue is ISpEntityLookup)
            {
                if (originalValue == null || Equals(originalValue, default))
                {
                    if (EntityId > 0)
                    {
                        currentValue = (currentValue as ISpEntityLookup).EntityId;
                        return true;
                    }
                }
                else if (originalValue is ISpEntityLookup && !Equals((originalValue as ISpEntityLookup).EntityId, (currentValue as ISpEntityLookup).EntityId))
                {
                    currentValue = (currentValue as ISpEntityLookup).EntityId;
                    return EntityId > 0 || !Equals(default(int), currentValue);
                }
            }
            else if (currentValue is ISpEntityLookupCollection)
            {
                if (originalValue == null || Equals(originalValue, default))
                {
                    if (EntityId > 0)
                    {
                        currentValue = (currentValue as ISpEntityLookupCollection).EntityIds.Where(entityId => entityId > 0).ToArray();
                        return true;
                    }
                    else if ((currentValue as ISpEntityLookupCollection).EntityIds != null && (currentValue as ISpEntityLookupCollection).EntityIds.Any(entityId => entityId > 0))
                    {
                        currentValue = (currentValue as ISpEntityLookupCollection).EntityIds.Where(entityId => entityId > 0).ToArray();
                        return EntityId > 0 || !Equals(default(int[]), currentValue);
                    }
                    else
                    {
                        currentValue = (currentValue as ISpEntityLookupCollection).EntityIds.Where(entityId => entityId > 0).ToArray();
                    }
                }
            }
            else
            {
                bool isChanged = false;
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

                }
                else
                {
                    isChanged = currentValue != null && !Equals(currentValue.GetType().GetDefaultValue(), currentValue);
                }
                return isChanged;
            }
            return false;
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

        public TEntity Reload(bool setOriginalValuesOnly = false)
        {
            if (EntityId > 0 && Context != null && SpQueryArgs != null)
            {
                lock (_lock)
                {
                    var originalEntity = Entity;
                    if (originalEntity != null && originalEntity.Id > 0 && EntityId != originalEntity.Id)
                    {
                        EntityId = originalEntity.Id;
                    }
                    var entity = (Context.List<TEntity>(SpQueryArgs as SpQueryArgs<ISpEntryDataContext>) as ISpRepository<TEntity>).Find(EntityId);
                    if (entity != null)
                    {
                        Detach();
                        Entity = entity;
                        Attach();

                        if (setOriginalValuesOnly)
                        {
                            Entity = originalEntity;
                        }
                    }
                    else
                    {
                        EntityId = originalEntity.Id;
                    }
                    return entity;
                }
            }
            return Entity;
        }

        public void Update()
        {
            lock (_lock)
            {
                bool hasChanges = DetectChanges();
                if (hasChanges)
                {
                    State = EntityId > 0 ? EntityState.Modified : EntityState.Added;
                }
            }
        }

        public void Delete()
        {
            State = EntityId > 0 ? EntityState.Deleted : EntityState.Detached;
        }

        #endregion
    }
}
