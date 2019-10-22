using Microsoft.SharePoint.Client;
using Newtonsoft.Json;
using System;

namespace SP.ProjectTaskWeb.Models
{
  public class SPRegionalInfo
  {
    internal SPRegionalInfo(RegionalSettings regionalSettings)
    {
      if (regionalSettings == null) throw new ArgumentNullException(nameof(regionalSettings));
      if (regionalSettings.IsPropertyAvailable("AM"))
      {
        this.AM = regionalSettings.AM;
      }
      if (regionalSettings.IsPropertyAvailable("AdjustHijriDays"))
      {
        this.AdjustHijriDays = regionalSettings.AdjustHijriDays;
      }
      if (regionalSettings.IsPropertyAvailable("AlternateCalendarType"))
      {
        this.AlternateCalendarType = regionalSettings.AlternateCalendarType;
      }
      if (regionalSettings.IsPropertyAvailable("CalendarType"))
      {
        this.CalendarType = regionalSettings.CalendarType;
      }
      if (regionalSettings.IsPropertyAvailable("Collation"))
      {
        this.Collation = regionalSettings.Collation;
      }
      if (regionalSettings.IsPropertyAvailable("CollationLCID"))
      {
        this.CollationLCID = regionalSettings.CollationLCID;
      }
      if (regionalSettings.IsPropertyAvailable("DateFormat"))
      {
        this.DateFormat = regionalSettings.DateFormat;
      }
      if (regionalSettings.IsPropertyAvailable("DateSeparator"))
      {
        this.DateSeparator = regionalSettings.DateSeparator;
      }
      if (regionalSettings.IsPropertyAvailable("DecimalSeparator"))
      {
        this.DecimalSeparator = regionalSettings.DecimalSeparator;
      }
      if (regionalSettings.IsPropertyAvailable("DigitGrouping"))
      {
        this.DigitGrouping = regionalSettings.DigitGrouping;
      }
      if (regionalSettings.IsPropertyAvailable("FirstDayOfWeek"))
      {
        this.FirstDayOfWeek = regionalSettings.FirstDayOfWeek;
      }
      if (regionalSettings.IsPropertyAvailable("FirstWeekOfYear"))
      {
        this.FirstWeekOfYear = regionalSettings.FirstWeekOfYear;
      }
      if (regionalSettings.IsPropertyAvailable("IsEastAsia"))
      {
        this.IsEastAsia = regionalSettings.IsEastAsia;
      }
      if (regionalSettings.IsPropertyAvailable("IsRightToLeft"))
      {
        this.IsRightToLeft = regionalSettings.IsRightToLeft;
      }
      if (regionalSettings.IsPropertyAvailable("IsUIRightToLeft"))
      {
        this.IsUIRightToLeft = regionalSettings.IsUIRightToLeft;
      }
      if (regionalSettings.IsPropertyAvailable("ListSeparator"))
      {
        this.ListSeparator = regionalSettings.ListSeparator;
      }
      if (regionalSettings.IsPropertyAvailable("LocaleId"))
      {
        this.LocaleId = regionalSettings.LocaleId;
      }
      if (regionalSettings.IsPropertyAvailable("NegNumberMode"))
      {
        this.NegNumberMode = regionalSettings.NegNumberMode;
      }
      if (regionalSettings.IsPropertyAvailable("NegativeSign"))
      {
        this.NegativeSign = regionalSettings.NegativeSign;
      }
      if (regionalSettings.IsPropertyAvailable("PM"))
      {
        this.PM = regionalSettings.PM;
      }
      if (regionalSettings.IsPropertyAvailable("PositiveSign"))
      {
        this.PositiveSign = regionalSettings.PositiveSign;
      }
      if (regionalSettings.IsPropertyAvailable("ShowWeeks"))
      {
        this.ShowWeeks = regionalSettings.ShowWeeks;
      }
      if (regionalSettings.IsPropertyAvailable("ThousandSeparator"))
      {
        this.ThousandSeparator = regionalSettings.ThousandSeparator;
      }
      if (regionalSettings.IsPropertyAvailable("Time24"))
      {
        this.Time24 = regionalSettings.Time24;
      }
      if (regionalSettings.IsPropertyAvailable("TimeMarkerPosition"))
      {
        this.TimeMarkerPosition = regionalSettings.TimeMarkerPosition;
      }
      if (regionalSettings.IsPropertyAvailable("TimeSeparator"))
      {
        this.TimeSeparator = regionalSettings.TimeSeparator;
      }
      if (regionalSettings.IsPropertyAvailable("WorkDayEndHour"))
      {
        this.WorkDayEndHour = regionalSettings.WorkDayEndHour;
      }
      if (regionalSettings.IsPropertyAvailable("WorkDayStartHour"))
      {
        this.WorkDayStartHour = regionalSettings.WorkDayStartHour;
      }
      if (regionalSettings.IsPropertyAvailable("WorkDays"))
      {
        this.WorkDays = regionalSettings.WorkDays;
      }
      if (regionalSettings.TimeZone.IsPropertyAvailable("Information"))
      {
        this.TimeZoneBias = regionalSettings.TimeZone.Information.Bias;
      }
    }


    [JsonProperty("adjustHijriDays")]
    public short AdjustHijriDays { get; private set; }

    [JsonProperty("alternateCalendarType")]
    public short AlternateCalendarType { get; private set; }

    [JsonProperty("am")]
    public string AM { get; private set; }

    [JsonProperty("calendarType")]
    public short CalendarType { get; private set; }

    [JsonProperty("collation")]
    public short Collation { get; private set; }

    [JsonProperty("collationLCID")]
    public uint CollationLCID { get; private set; }

    [JsonProperty("dateFormat")]
    public uint DateFormat { get; private set; }

    [JsonProperty("dateSeparator")]
    public string DateSeparator { get; private set; }

    [JsonProperty("decimalSeparator")]
    public string DecimalSeparator { get; private set; }

    [JsonProperty("digitGrouping")]
    public string DigitGrouping { get; private set; }

    [JsonProperty("firstDayOfWeek")]
    public uint FirstDayOfWeek { get; private set; }

    [JsonProperty("firstWeekOfYear")]
    public short FirstWeekOfYear { get; private set; }

    [JsonProperty("isEastAsia")]
    public bool IsEastAsia { get; private set; }

    [JsonProperty("isRightToLeft")]
    public bool IsRightToLeft { get; private set; }

    [JsonProperty("isUIRightToLeft")]
    public bool IsUIRightToLeft { get; private set; }

    [JsonProperty("listSeparator")]
    public string ListSeparator { get; private set; }

    [JsonProperty("localeId")]
    public uint LocaleId { get; private set; }

    [JsonProperty("negativeSign")]
    public string NegativeSign { get; private set; }

    [JsonProperty("negNumberMode")]
    public uint NegNumberMode { get; private set; }

    [JsonProperty("pm")]
    public string PM { get; private set; }

    [JsonProperty("positiveSign")]
    public string PositiveSign { get; private set; }

    [JsonProperty("showWeeks")]
    public bool ShowWeeks { get; private set; }

    [JsonProperty("thousandSeparator")]
    public string ThousandSeparator { get; private set; }

    [JsonProperty("time24")]
    public bool Time24 { get; private set; }

    [JsonProperty("timeMarkerPosition")]
    public uint TimeMarkerPosition { get; private set; }

    [JsonProperty("timeSeparator")]
    public string TimeSeparator { get; private set; }

    [JsonProperty("workDayEnd")]
    public short WorkDayEndHour { get; private set; }

    [JsonProperty("workDays")]
    public short WorkDays { get; private set; }

    [JsonProperty("workDayStart")]
    public short WorkDayStartHour { get; private set; }

    [JsonProperty("tzBias")]
    public int TimeZoneBias { get; private set; }
  }
}