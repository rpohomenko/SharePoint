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
      where TEntity : class, IListItemEntity
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
            return _manager.Update(EntityId, CurrentValues.ToDictionary(pair => pair.Key, pair => pair.Value), Version);
          case EntityState.Deleted:
            return _manager.DeleteItems(new[] { EntityId }).FirstOrDefault();
        }
        return null;
      }
    }

    private static IEnumerable<KeyValuePair<string, object>> GetValues(TEntity entity)
    {
      return AttributeHelper.GetFieldValues<TEntity, FieldAttribute>(entity)
        .Concat(AttributeHelper.GetPropertyValues<TEntity, FieldAttribute>(entity)).Select(val => new KeyValuePair<string, object>(val.Key.Name, val.Value));
    }

    public bool DetectChanges()
    {
      lock (_lock)
      {
        if (State == EntityState.Deleted) return false;
        if (State == EntityState.Detached) return false;

        CurrentValues = new ConcurrentDictionary<string, object>();
        foreach (var value in GetValues(Entity))
        {
          if (!SpQueryArgs.FieldMappings.ContainsKey(value.Key)) continue;
          var fieldMapping = SpQueryArgs.FieldMappings[value.Key];
          if (fieldMapping.IsReadOnly) continue;

          if(Entity.Id <= 0)
          {
            if (Equals(default, value.Value))
            {
              continue;
            }
          }

          if (value.Value is ISpEntityLookup)
          {
            if (EntityId <= 0 || (!OriginalValues.ContainsKey(value.Key) || !Equals(OriginalValues[value.Key], (value.Value as ISpEntityLookup).EntityId)))
            {
              if (EntityId > 0)
              {
                if (!OriginalValues.ContainsKey(value.Key) && Equals(default, value.Value)) continue;

                if (OriginalValues[value.Key] == null || !Equals((OriginalValues[value.Key] as ISpEntityLookup).EntityId, (value.Value as ISpEntityLookup).EntityId))
                {
                  CurrentValues[value.Key] = (value.Value as ISpEntityLookup).EntityId;
                }
              }
              else
              {
                if ((value.Value as ISpEntityLookup).EntityId > 0)
                {
                  CurrentValues[value.Key] = (value.Value as ISpEntityLookup).EntityId;
                }
              }
            }
          }
          else if (value.Value is ISpEntityLookupCollection)
          {
            if (EntityId <= 0 || (!OriginalValues.ContainsKey(value.Key) || !Equals(OriginalValues[value.Key], (value.Value as ISpEntityLookupCollection).EntityIds)))
            {
              if (EntityId > 0)
              {
                if (!OriginalValues.ContainsKey(value.Key) && Equals(default, value.Value)) continue;
                if (OriginalValues[value.Key] == null || !Equals((OriginalValues[value.Key] as ISpEntityLookupCollection).EntityIds, (value.Value as ISpEntityLookupCollection).EntityIds))
                {
                  CurrentValues[value.Key] = (value.Value as ISpEntityLookupCollection).EntityIds;
                }
              }
              else
              {
                CurrentValues[value.Key] = (value.Value as ISpEntityLookupCollection).EntityIds;
              }
            }
          }
          else if (EntityId <= 0 || (!OriginalValues.ContainsKey(value.Key) || !Equals(OriginalValues[value.Key], value.Value)))
          {
            if (EntityId > 0)
            {
              if (!OriginalValues.ContainsKey(value.Key) && Equals(default, value.Value)) continue;
              CurrentValues[value.Key] = value.Value;
            }
            else if (!Equals(default, value.Value))
            {
              CurrentValues[value.Key] = value.Value;
            }
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
        if (DetectChanges())
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
