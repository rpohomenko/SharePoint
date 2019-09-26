using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

namespace SP.Client.Linq.Attributes
{
  internal static class AttributeHelper
  {
    public static IEnumerable<TAttribute> GetCustomAttributes<TEntity, TAttribute>(bool inherit)
      where TAttribute : Attribute
      where TEntity : class, IListItemEntity
    {
      return GetCustomAttributes<TAttribute>(typeof(TEntity), inherit);
    }

    public static IEnumerable<TAttribute> GetCustomAttributes<TAttribute>(Type entityType, bool inherit)
      where TAttribute : Attribute
    {
      if (typeof(IListItemEntity).IsAssignableFrom(entityType))
      {
        var attributes = (IEnumerable<TAttribute>)entityType.GetCustomAttributes(typeof(TAttribute), inherit);
        if (attributes == null)
        {
          attributes = Enumerable.Empty<TAttribute>();
        }
        foreach (var vInterface in entityType.GetInterfaces())
        {
          attributes = attributes.Concat((IEnumerable<TAttribute>)vInterface.GetCustomAttributes(typeof(TAttribute), inherit));
        }

        return attributes;
      }
      return null;
    }

    public static IEnumerable<KeyValuePair<MemberInfo, TAttribute>> GetFieldAttributes<TEntity, TAttribute>()
      where TAttribute : Attribute
      where TEntity : class, IListItemEntity

    {
      return GetFieldAttributes<TAttribute>(typeof(TEntity));
    }

    public static IEnumerable<KeyValuePair<MemberInfo, TAttribute>> GetFieldAttributes<TAttribute>(Type entityType)
       where TAttribute : Attribute
    {
      foreach (var field in entityType.GetFields())
      {
        var att = (TAttribute)Attribute.GetCustomAttribute(field, typeof(TAttribute), true);
        if (att != null)
        {
          yield return new KeyValuePair<MemberInfo, TAttribute>(field, att);
        }
        else
        {
          foreach (var f in entityType.GetInterfaces().SelectMany(i => i.GetFields()))
          {
            if (f.Name == field.Name)
            {
              att = (TAttribute)Attribute.GetCustomAttribute(f, typeof(TAttribute), true);
              if (att != null)
              {
                yield return new KeyValuePair<MemberInfo, TAttribute>(f, att);
              }
            }
          }
        }
      }
    }

    public static IEnumerable<KeyValuePair<MemberInfo, TAttribute>> GetPropertyAttributes<TEntity, TAttribute>()
          where TAttribute : Attribute
          where TEntity : class, IListItemEntity
    {

      return GetPropertyAttributes<TAttribute>(typeof(TEntity));
    }

    public static IEnumerable<KeyValuePair<MemberInfo, TAttribute>> GetPropertyAttributes<TAttribute>(Type entityType)
      where TAttribute : Attribute
    {
      foreach (var property in entityType.GetProperties())
      {
        var att = (TAttribute)Attribute.GetCustomAttribute(property, typeof(TAttribute), true);
        if (att != null)
        {
          yield return new KeyValuePair<MemberInfo, TAttribute>(property, att);
        }
        else
        {
          foreach (var p in entityType.GetInterfaces().SelectMany(i => i.GetProperties()))
          {
            if (p.Name == property.Name)
            {
              att = (TAttribute)Attribute.GetCustomAttribute(p, typeof(TAttribute), true);
              if (att != null)
              {
                yield return new KeyValuePair<MemberInfo, TAttribute>(p, att);
              }
            }
          }
        }
      }
    }

    public static IEnumerable<KeyValuePair<MemberInfo, object>> GetPropertyValues<TEntity, TAttribute>(TEntity entity)
        where TAttribute : Attribute
        where TEntity : class, IListItemEntity
    {
      if (entity != null)
        foreach (var property in typeof(TEntity).GetProperties())
        {
          var att = (TAttribute)Attribute.GetCustomAttribute(property, typeof(TAttribute), true);
          if (att != null)
          {
            yield return new KeyValuePair<MemberInfo, object>(property, property.GetValue(entity));
          }
          else
          {
            foreach (var p in typeof(TEntity).GetInterfaces().SelectMany(i => i.GetProperties()))
            {
              if (p.Name == property.Name)
              {
                att = (TAttribute)Attribute.GetCustomAttribute(p, typeof(TAttribute), true);
                if (att != null)
                {
                  yield return new KeyValuePair<MemberInfo, object>(p, property.GetValue(entity));
                }
              }
            }
          }
        }
    }

    public static IEnumerable<KeyValuePair<MemberInfo, object>> GetFieldValues<TEntity, TAttribute>(TEntity entity)
        where TAttribute : Attribute
        where TEntity : class, IListItemEntity
    {
      if (entity != null)
        foreach (var field in typeof(TEntity).GetFields())
        {
          var att = (TAttribute)Attribute.GetCustomAttribute(field, typeof(TAttribute), true);
          if (att != null)
          {
            yield return new KeyValuePair<MemberInfo, object>(field, field.GetValue(entity));
          }
          else
          {
            foreach (var f in typeof(TEntity).GetInterfaces().SelectMany(i => i.GetFields()))
            {
              if (f.Name == field.Name)
              {
                att = (TAttribute)Attribute.GetCustomAttribute(f, typeof(TAttribute), true);
                if (att != null)
                {
                  yield return new KeyValuePair<MemberInfo, object>(f, field.GetValue(entity));
                }
              }
            }
          }
        }
    }

    public static IEnumerable<KeyValuePair<MemberInfo, object>> GetPropertyValuesOfType<TEntity, TValueType>(TEntity entity)
     where TEntity : class, IListItemEntity
    {
      if (entity != null)
        foreach (var property in typeof(TEntity).GetProperties())
        {
          var value = property.GetValue(entity);
          if (value != null && value is TValueType)
          {
            yield return new KeyValuePair<MemberInfo, object>(property, value);
          }
        }
    }

    public static IEnumerable<KeyValuePair<MemberInfo, object>> GetFieldValuesOfType<TEntity, TValueType>(TEntity entity)
      where TEntity : class, IListItemEntity

    {
      if (entity != null)
        foreach (var field in typeof(TEntity).GetFields())
        {
          var value = field.GetValue(entity);
          if (value != null && value is TValueType)
          {
            yield return new KeyValuePair<MemberInfo, object>(field, value);
          }
        }
    }

    private static bool IsAssignableToGenericType(Type givenType, Type genericType)
    {
      var interfaceTypes = givenType.GetInterfaces();

      foreach (var it in interfaceTypes)
      {
        if (it.IsGenericType && it.GetGenericTypeDefinition() == genericType)
          return true;
      }

      if (givenType.IsGenericType && givenType.GetGenericTypeDefinition() == genericType)
        return true;

      Type baseType = givenType.BaseType;
      if (baseType == null) return false;

      return IsAssignableToGenericType(baseType, genericType);
    }
  }
}
