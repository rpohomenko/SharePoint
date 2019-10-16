using Microsoft.SharePoint.Client;
using SP.Client.Caml.Operators;
using SP.Client.Linq.Infrastructure;
using SP.Client.Linq.Query;
using System;
using System.Collections;

namespace SP.Client.Linq
{
    public static class ListItemEntityExtensions
    {
        public static bool DateRangesOverlap<TEntity>(this TEntity entity, Func<TEntity, DateTime> startDate, Func<TEntity, DateTime?> endDate, Func<TEntity, string> recurrenceId, DateTime value)
           where TEntity : class, IEventEntity
        {
            //fake method.
            return false;
        }

        public static bool DateRangesOverlap<TEntity>(this TEntity entity, Func<TEntity, DateTime> startDate, Func<TEntity, DateTime?> endDate, Func<TEntity, string> recurrenceId, Caml.CamlValue.DateCamlValue value)
          where TEntity : class, IEventEntity
        {
            //fake method.
            return false;
        }

        public static bool Includes<TEntity>(this TEntity entity, Func<TEntity, object> prop, params string[] fieldValues)
         where TEntity : class, IListItemEntity
        {
            //fake method.
            return false;
        }

        public static bool Includes<TEntity>(this TEntity entity, Func<TEntity, object> prop, params int[] fieldIds)
        where TEntity : class, IListItemEntity
        {
            //fake method.
            return false;
        }

        public static bool LookupIncludes<TEntity, TCollection>(this TEntity entity, Func<TEntity, TCollection> prop, string lookupFieldValue)
         where TEntity : class, IListItemEntity
         where TCollection : ICollection
        {
            //fake method.
            return false;
        }

        public static bool LookupIdIncludes<TEntity, TCollection>(this TEntity entity, Func<TEntity, TCollection> prop, int lookupFieldId)
        where TEntity : class, IListItemEntity
        where TCollection : ICollection
        {
            //fake method.
            return false;
        }

        public static bool LookupNotIncludes<TEntity, TCollection>(this TEntity entity, Func<TEntity, TCollection> prop, string lookupFieldValue)
        where TEntity : class, IListItemEntity
        where TCollection : ICollection
        {
            //fake method.
            return false;
        }

        public static bool LookupIdNotIncludes<TEntity, TCollection>(this TEntity entity, Func<TEntity, TCollection> prop, int lookupFieldId)
        where TEntity : class, IListItemEntity
        where TCollection : ICollection
        {
            //fake method.
            return false;
        }

        public static bool IsMembership<TEntity>(this TEntity entity, Func<TEntity, object> prop, MembershipType membershipType)
           where TEntity : class, IListItemEntity
        {
            //fake method.
            return false;
        }

        public static SpEntityEntry<TEntity, TContext> GetEntry<TEntity, TContext>(this TEntity entity, SpQueryArgs<TContext> args)
                where TEntity : class, IListItemEntity, new()
           where TContext : class, ISpEntryDataContext
        {
            return new SpEntityEntry<TEntity, TContext>(entity, args);
        }

        public static ListItem GetListItem<TEntity, TContext>(this TEntity entity, SpQueryArgs<TContext> args)
          where TEntity : class, IListItemEntity, new()
          where TContext : class, ISpEntryDataContext
        {
            if (entity != null && entity.Id > 0 && args != null)
            {
                var manager = new SpQueryManager<TEntity, TContext>(args);
                List list = manager.GetList();
                if (list != null)
                {
                    return list.GetItemById(entity.Id);
                }
            }
            return null;
        }
    }
}
