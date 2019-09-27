using SP.Client.Linq.Attributes;
using System;

namespace SP.Client.Linq
{
  internal static class EnumExtensions
  {
    public static TEnum ParseChoiceValue<TEnum>(string value)
      where TEnum : Enum
    {
      return (TEnum)ParseChoiceValue(typeof(TEnum), value);
    }

    public static Enum ParseChoiceValue(Type enumType, string value)
    {
      if (value != null && enumType != null && enumType.IsEnum)
      {
        var choices = AttributeHelper.GetFieldAttributes<ChoiceAttribute>(enumType);
        foreach (var choice in choices)
        {
          if (string.Equals(choice.Value.Value, value, StringComparison.OrdinalIgnoreCase))
          {
            return (Enum)Enum.Parse(enumType, choice.Key.Name);
          }
        }
      }
      return null;
    }

    public static string GetChoiceValue(this Enum enumValue)
    {
      return GetChoiceValue(enumValue.GetType(), enumValue);
    }

    public static string GetChoiceValue(Type enumType, object value)
    {
      if (value != null && enumType != null && enumType.IsEnum)
      {
        var enumName = enumType.GetEnumName(value);
        var choices = AttributeHelper.GetFieldAttributes<ChoiceAttribute>(enumType);
        foreach (var choice in choices)
        {
          if (string.Equals(choice.Key.Name, enumName))
          {
            return choice.Value.Value;
          }
        }
      }
      return null;
    }

  }
}
