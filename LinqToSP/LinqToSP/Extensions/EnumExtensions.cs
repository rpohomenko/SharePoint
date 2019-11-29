using SP.Client.Linq.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;

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

        public static TEnum ParseChoiceValues<TEnum>(string[] values)
         where TEnum : Enum
        {
            var enumType = typeof(TEnum);
            if (enumType.IsDefined(typeof(FlagsAttribute), false))
            {
                return (TEnum)ParseChoiceValues(typeof(TEnum), values);
            }
            return (TEnum)ParseChoiceValue(typeof(TEnum), values.FirstOrDefault());
        }

        public static Enum ParseChoiceValues(Type enumType, string[] values)
        {
            if (values != null && enumType != null && enumType.IsEnum && enumType.IsDefined(typeof(FlagsAttribute), false))
            {
                var choices = AttributeHelper.GetFieldAttributes<ChoiceAttribute>(enumType);
                var enums = new List<Enum>();
                foreach (var value in values)
                {
                    var choice = choices.FirstOrDefault(ch => string.Equals(ch.Value.Value, value, StringComparison.OrdinalIgnoreCase));
                    if (choice.Key != null)
                    {
                        enums.Add((Enum)Enum.Parse(enumType, choice.Key.Name));
                    }
                }
                if (enums.Count > 0)
                {
                    Enum result = enums[0];

                    for (var i = 1; i < enums.Count; i++)
                    {
                        if (Enum.GetUnderlyingType(enumType) != typeof(ulong))
                            result = (Enum)Enum.ToObject(enumType, Convert.ToInt64(result) | Convert.ToInt64(enums[i]));
                        else
                            result = (Enum)Enum.ToObject(enumType, Convert.ToUInt64(result) | Convert.ToUInt64(enums[i]));
                    }
                    return result;
                }
            }
            return null;
        }

        public static string GetChoiceValueString(this Enum enumValue)
        {
            var type = enumValue.GetType();
            if (type.IsDefined(typeof(FlagsAttribute), false))
            {
                return GetChoiceValuesString(type, enumValue).FirstOrDefault();
            }
            return GetChoiceValueString(type, enumValue);
        }

        public static string[] GetChoiceValuesString(this Enum enumValue)
        {
            var type = enumValue.GetType();
            if (type.IsDefined(typeof(FlagsAttribute), false))
            {
                return GetChoiceValuesString(type, enumValue).ToArray();
            }
            var result = GetChoiceValueString(type, enumValue);
            if (!string.IsNullOrEmpty(result))
            {
                return new[] { result };
            }
            return null;
        }

        public static string GetChoiceValueString(Type enumType, object value)
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

        public static IEnumerable<string> GetChoiceValuesString(Type enumType, object value)
        {
            if (value != null && enumType != null && enumType.IsEnum && enumType.IsDefined(typeof(FlagsAttribute), false))
            {
                var enumValues = Enum.GetValues(enumType).Cast<Enum>();
                var choices = AttributeHelper.GetFieldAttributes<ChoiceAttribute>(enumType).OrderBy(choice => choice.Value.Index);

                foreach (var enumValue in enumValues)
                {
                    if ((value as Enum).HasFlag(enumValue))
                    {
                        var enumName = enumType.GetEnumName(enumValue);
                        var choice = choices.FirstOrDefault(ch => string.Equals(ch.Key.Name, enumName));
                        if (choice.Key != null)
                        {
                            yield return choice.Value.Value;
                        }
                    }
                }
            }
        }

    }
}
