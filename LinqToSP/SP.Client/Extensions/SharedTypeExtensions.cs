using System.Collections.Generic;
using System.Reflection;
using System.Runtime.CompilerServices;

namespace System
{
  public static class SharedTypeExtensions
  {
    public static Type UnwrapNullableType(this Type type) => Nullable.GetUnderlyingType(type) ?? type;

    public static bool IsNullableType(this Type type)
    {
      var typeInfo = type.GetTypeInfo();

      return !typeInfo.IsValueType
             || typeInfo.IsGenericType
             && typeInfo.GetGenericTypeDefinition() == typeof(Nullable<>);
    }

    public static bool IsValidEntityType(this Type type)
        => type.GetTypeInfo().IsClass;

    public static Type MakeNullable(this Type type, bool nullable = true)
        => type.IsNullableType() == nullable
            ? type
            : nullable
                ? typeof(Nullable<>).MakeGenericType(type)
                : type.UnwrapNullableType();

    public static bool IsNumeric(this Type type)
    {
      type = type.UnwrapNullableType();

      return type.IsInteger()
          || type == typeof(decimal)
          || type == typeof(float)
          || type == typeof(double);
    }

    public static bool IsInteger(this Type type)
    {
      type = type.UnwrapNullableType();

      return type == typeof(int)
             || type == typeof(long)
             || type == typeof(short)
             || type == typeof(byte)
             || type == typeof(uint)
             || type == typeof(ulong)
             || type == typeof(ushort)
             || type == typeof(sbyte)
             || type == typeof(char);
    }

    public static bool IsSignedInteger(this Type type)
        => type == typeof(int)
               || type == typeof(long)
               || type == typeof(short)
               || type == typeof(sbyte);

    public static bool IsAnonymousType(this Type type)
        => type.Name.StartsWith("<>")
           && type.GetCustomAttributes(typeof(CompilerGeneratedAttribute), inherit: false).Length > 0
           && type.Name.Contains("AnonymousType");

    private static readonly Dictionary<Type, object> _commonTypeDictionary = new Dictionary<Type, object>
            {
                { typeof(int), default(int) },
                { typeof(Guid), default(Guid) },
                { typeof(DateTime), default(DateTime) },
                { typeof(DateTimeOffset), default(DateTimeOffset) },
                { typeof(long), default(long) },
                { typeof(bool), default(bool) },
                { typeof(double), default(double) },
                { typeof(short), default(short) },
                { typeof(float), default(float) },
                { typeof(byte), default(byte) },
                { typeof(char), default(char) },
                { typeof(uint), default(uint) },
                { typeof(ushort), default(ushort) },
                { typeof(ulong), default(ulong) },
                { typeof(sbyte), default(sbyte) }
            };

    public static object GetDefaultValue(this Type type)
    {
      if (!type.GetTypeInfo().IsValueType)
      {
        return null;
      }

      return _commonTypeDictionary.TryGetValue(type, out var value)
          ? value
          : Activator.CreateInstance(type);
    }
  }
}
