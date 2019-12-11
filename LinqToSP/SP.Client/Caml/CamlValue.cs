using System;
using System.Globalization;
using System.Xml.Linq;
using SP.Client.Caml.Interfaces;
using Microsoft.SharePoint.Client;
using SP.Client.Extensions;

namespace SP.Client.Caml
{
  public sealed class CamlValue : CamlValue<object>
  {
    public CamlValue(object value, FieldType type)
        : base(value, type)
    {
    }

    public CamlValue(string existingValue)
        : base(existingValue)
    {
    }

    public CamlValue(XElement existingValue)
        : base(existingValue)
    {
    }
    public static NowDateCamlValue Now
    {
      get { return new NowDateCamlValue(); }
    }

    public static TodayDateCamlValue Today
    {
      get { return new TodayDateCamlValue(); }
    }

    public static DayDateCamlValue Day
    {
      get { return new DayDateCamlValue(); }
    }

    public static WeekDateCamlValue Week
    {
      get { return new WeekDateCamlValue(); }
    }

    public static MonthDateCamlValue Month
    {
      get { return new MonthDateCamlValue(); }
    }

    public static YearDateCamlValue Year
    {
      get { return new YearDateCamlValue(); }
    }

    public static UserIdCamlValue UserId
    {
      get { return new UserIdCamlValue(); }
    }

    public abstract class DateCamlValue : CamlElement, ICamlSpecialValue
    {
      protected DateCamlValue(string elementName)
          : base(elementName)
      {
      }

      protected DateCamlValue(string elementName, string existingElement)
          : base(elementName, existingElement)
      {
      }

      protected DateCamlValue(string elementName, XElement existingElement)
          : base(elementName, existingElement)
      {
      }

      public bool IsSupported(FieldType fieldType)
      {
        return fieldType == FieldType.DateTime;
      }

      protected override void OnParsing(XElement existingElement)
      {
      }

      internal static DateCamlValue GetValue(XElement existingDateCamlValue)
      {
        var tag = existingDateCamlValue.Name.LocalName;
        if (string.Equals(tag, NowDateCamlValue.NowTag, StringComparison.OrdinalIgnoreCase))
        {
          return new NowDateCamlValue(existingDateCamlValue);
        }
        if (string.Equals(tag, TodayDateCamlValue.TodayTag, StringComparison.OrdinalIgnoreCase))
        {
          return new TodayDateCamlValue(existingDateCamlValue);
        }
        if (string.Equals(tag, DayDateCamlValue.DayTag, StringComparison.OrdinalIgnoreCase))
        {
          return new DayDateCamlValue(existingDateCamlValue);
        }
        if (string.Equals(tag, WeekDateCamlValue.WeekTag, StringComparison.OrdinalIgnoreCase))
        {
          return new WeekDateCamlValue(existingDateCamlValue);
        }
        if (string.Equals(tag, MonthDateCamlValue.MonthTag, StringComparison.OrdinalIgnoreCase))
        {
          return new MonthDateCamlValue(existingDateCamlValue);
        }
        if (string.Equals(tag, YearDateCamlValue.YearTag, StringComparison.OrdinalIgnoreCase))
        {
          return new YearDateCamlValue(existingDateCamlValue);
        }
        throw new NotSupportedException("tag");
      }

      public static bool operator <(object c1, DateCamlValue c2) { return false; }
      public static bool operator >(object c1, DateCamlValue c2) { return false; }
      public static bool operator <=(object c1, DateCamlValue c2) { return false; }
      public static bool operator >=(object c1, DateCamlValue c2) { return false; }
      public static bool operator ==(object c1, DateCamlValue c2) { return false; }
      public static bool operator !=(object c1, DateCamlValue c2) { return false; }


      public static explicit operator DateCamlValue(string s) { return null; }

      public override int GetHashCode()
      {
        return base.GetHashCode();
      }

      public override bool Equals(object obj)
      {
        return base.Equals(obj);
      }
    }

    public sealed class NowDateCamlValue : DateCamlValue
    {
      internal const string NowTag = "Now";

      internal NowDateCamlValue()
          : base(NowTag)
      {
      }

      internal NowDateCamlValue(string existingElement)
          : base(NowTag, existingElement)
      {
      }

      internal NowDateCamlValue(XElement existingElement)
          : base(NowTag, existingElement)
      {
      }
    }

    public sealed class TodayDateCamlValue : DateCamlValue
    {
      internal const string TodayTag = "Today";
      internal const string OffsetAttr = "Offset";

      internal TodayDateCamlValue()
          : base(TodayTag)
      {
      }

      internal TodayDateCamlValue(string existingElement)
          : base(TodayTag, existingElement)
      {
      }

      internal TodayDateCamlValue(XElement existingElement)
          : base(TodayTag, existingElement)
      {
      }

      public int? Offset { get; set; }

      protected override void OnParsing(XElement existingElement)
      {
        var offset = existingElement.AttributeIgnoreCase(OffsetAttr);
        if (offset != null)
        {
          Offset = Convert.ToInt32(offset.Value);
        }
      }

      public override XElement ToXElement()
      {
        var el = base.ToXElement();
        if (Offset.HasValue)
        {
          el.Add(new XAttribute(OffsetAttr, Offset));
        }
        return el;
      }
    }

    public sealed class DayDateCamlValue : DateCamlValue
    {
      internal const string DayTag = "Day";

      internal DayDateCamlValue()
          : base(DayTag)
      {
      }

      internal DayDateCamlValue(string existingElement)
          : base(DayTag, existingElement)
      {
      }

      internal DayDateCamlValue(XElement existingElement)
          : base(DayTag, existingElement)
      {
      }
    }

    public sealed class WeekDateCamlValue : DateCamlValue
    {
      internal const string WeekTag = "Week";

      internal WeekDateCamlValue()
          : base(WeekTag)
      {
      }

      internal WeekDateCamlValue(string existingElement)
          : base(WeekTag, existingElement)
      {
      }

      internal WeekDateCamlValue(XElement existingElement)
          : base(WeekTag, existingElement)
      {
      }
    }

    public sealed class MonthDateCamlValue : DateCamlValue
    {
      internal const string MonthTag = "Month";

      internal MonthDateCamlValue()
          : base(MonthTag)
      {
      }

      internal MonthDateCamlValue(string existingElement)
          : base(MonthTag, existingElement)
      {
      }

      internal MonthDateCamlValue(XElement existingElement)
          : base(MonthTag, existingElement)
      {
      }
    }

    public sealed class YearDateCamlValue : DateCamlValue
    {
      internal const string YearTag = "Year";

      internal YearDateCamlValue()
          : base(YearTag)
      {
      }

      internal YearDateCamlValue(string existingElement)
          : base(YearTag, existingElement)
      {
      }

      internal YearDateCamlValue(XElement existingElement)
          : base(YearTag, existingElement)
      {
      }
    }

    public sealed class UserIdCamlValue : CamlElement, ICamlSpecialValue
    {
      internal const string UserIdTag = "UserID";

      internal UserIdCamlValue()
          : base(UserIdTag)
      {
      }

      internal UserIdCamlValue(string existingElement)
          : base(UserIdTag, existingElement)
      {
      }

      internal UserIdCamlValue(XElement existingElement)
          : base(UserIdTag, existingElement)
      {
      }

      public bool IsSupported(FieldType fieldType)
      {
        return fieldType == FieldType.Integer;
      }

      protected override void OnParsing(XElement existingElement)
      {
      }
    }
  }

  public class CamlValue<T> : CamlElement
  {
    internal const string ValueTag = "Value";
    internal const string TypeAttr = "Type";
    internal const string IncludeTimeValueAttr = "IncludeTimeValue";
    internal const string StorageTZAttr = "StorageTZ";

    public CamlValue(T value, FieldType type)
            : base(ValueTag)
    {
      if (value == null) throw new ArgumentNullException("value");
      Value = value;
      Type = type;
    }

    public CamlValue(string existingValue)
        : base(ValueTag, existingValue)
    {
    }

    public CamlValue(XElement existingValue)
        : base(ValueTag, existingValue)
    {
    }

    public T Value { get; set; }
    public FieldType Type { get; set; }
    public bool? IncludeTimeValue { get; set; }
    public bool? StorageTZ { get; set; }

    private Type GetValueType()
    {
      switch (Type)
      {
        case FieldType.Guid:
          return typeof(Guid);
        case FieldType.Text:
        case FieldType.Note:
        case FieldType.Choice:
        case FieldType.Lookup:
        case FieldType.User:
        case FieldType.URL:
        case FieldType.MultiChoice:
        case FieldType.ContentTypeId:
        case FieldType.Computed:
          return typeof(string);
        case FieldType.Number:
        case FieldType.Currency:
          return typeof(double);
        case FieldType.Boolean:
        case FieldType.Recurrence:
        case FieldType.Attachments:
        case FieldType.AllDayEvent:
        case FieldType.CrossProjectLink:
          return typeof(bool);
        case FieldType.DateTime:
          return typeof(DateTime);
        case FieldType.Integer:
        case FieldType.Counter:
        case FieldType.ModStat:
        case FieldType.WorkflowStatus:
          return typeof(int);
      }
      throw new NotSupportedException("Type");
    }

    protected override void OnParsing(XElement existingValue)
    {
      var type = existingValue.AttributeIgnoreCase(TypeAttr);
      if (type != null)
      {
        Type = (FieldType)Enum.Parse(typeof(FieldType), type.Value.Trim(), true);
      }
      if (FieldType.DateTime == Type)
      {
        var includeTimeValue = existingValue.AttributeIgnoreCase(IncludeTimeValueAttr);
        if (includeTimeValue != null)
        {
          IncludeTimeValue = Convert.ToBoolean(includeTimeValue.Value);
        }
        var storageTZAttr = existingValue.AttributeIgnoreCase(StorageTZAttr);
        if (storageTZAttr != null)
        {
          StorageTZ = Convert.ToBoolean(storageTZAttr.Value);
        }
        if (existingValue.HasElements)
        {
          foreach (var existingDateValue in existingValue.Elements())
          {
            try
            {
              Value = (T)(object)CamlValue.DateCamlValue.GetValue(existingDateValue);
              break;
            }
            catch
            {
            }
          }
        }
        else
        {
          if (!string.IsNullOrEmpty(existingValue.Value))
          {
            string dateString = existingValue.Value;
            var date = new DateTime(Convert.ToInt32(dateString.Substring(0, 4)), Convert.ToInt32(dateString.Substring(5, 2)), Convert.ToInt32(dateString.Substring(8, 2)), Convert.ToInt32(dateString.Substring(11, 2)), Convert.ToInt32(dateString.Substring(14, 2)), Convert.ToInt32(dateString.Substring(17, 2)), new GregorianCalendar());
            Value = (T)(object)date;
          }
        }
        return;
      }
      if (FieldType.Integer == Type)
      {
        if (existingValue.HasElements)
        {
          foreach (var existingDateValue in existingValue.Elements())
          {
            try
            {
              Value = (T)(object)new CamlValue.UserIdCamlValue(existingDateValue);
              break;
            }
            catch
            {
            }
          }
          return;
        }
      }

      if (!string.IsNullOrEmpty(existingValue.Value))
      {
        if (FieldType.Boolean == Type)
        {
          int value;
          if (int.TryParse(existingValue.Value, out value))
          {
            Value = (T)(object)Convert.ToBoolean(value);
          }
          return;
        }
        Value = (T)Convert.ChangeType(existingValue.Value, GetValueType());
      }
    }

    public override XElement ToXElement()
    {
      var el = base.ToXElement();
      el.Add(new XAttribute(TypeAttr, Type));

      if (FieldType.DateTime == Type)
      {
        if (IncludeTimeValue.HasValue)
        {
          el.Add(new XAttribute(IncludeTimeValueAttr, IncludeTimeValue.Value.ToString().ToUpper()));
        }
        if (StorageTZ.HasValue)
        {
          el.Add(new XAttribute(StorageTZAttr, StorageTZ.Value.ToString().ToUpper()));
        }
        if (Value is DateTime)
        {
          el.Value = string.Concat(Convert.ToDateTime(Value).ToString("s"), "Z");
          return el;
        }
      }
      if (FieldType.Boolean == Type)
      {
        el.Value = (Convert.ToBoolean(Value) ? 1 : 0).ToString();
        return el;
      }
      var value = Value as ICamlSpecialValue;
      if (value != null && value.IsSupported(Type))
      {
        el.Add(value.ToXElement());
      }
      else
      {
        el.Value = Convert.ToString(Value);
      }
      return el;
    }
  }
}