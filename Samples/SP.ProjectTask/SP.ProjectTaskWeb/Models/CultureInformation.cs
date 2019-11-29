using Newtonsoft.Json;
using System;
using System.Globalization;

namespace SP.ProjectTaskWeb.Models
{
    public class CultureInformation
    {
        internal CultureInformation(CultureInfo cultureInfo)
        {
            Name = cultureInfo.Name;
            TwoLetterISOLanguageName = cultureInfo.TwoLetterISOLanguageName;
            ShortDateFormat = cultureInfo.DateTimeFormat.ShortDatePattern;
            ShortTimeFormat = cultureInfo.DateTimeFormat.ShortTimePattern;
            LongDateFormat = cultureInfo.DateTimeFormat.LongDatePattern;
            LongTimeFormat = cultureInfo.DateTimeFormat.LongTimePattern;
            AbbreviatedDayNames = cultureInfo.DateTimeFormat.AbbreviatedDayNames;
            DayNames = cultureInfo.DateTimeFormat.DayNames;
            MonthNames = cultureInfo.DateTimeFormat.MonthNames;
            AbbreviatedMonthNames = cultureInfo.DateTimeFormat.AbbreviatedMonthNames;
            FirstDayOfWeek = cultureInfo.DateTimeFormat.FirstDayOfWeek;
            DateSeparator = cultureInfo.DateTimeFormat.DateSeparator;
            TimeSeparator = cultureInfo.DateTimeFormat.TimeSeparator;
            FullDateTimeFormat = cultureInfo.DateTimeFormat.FullDateTimePattern;
            MonthDayFormat = cultureInfo.DateTimeFormat.MonthDayPattern;
            MonthGenitiveNames = cultureInfo.DateTimeFormat.MonthGenitiveNames;
            ShortestDayNames = cultureInfo.DateTimeFormat.ShortestDayNames;
            NumberDecimalSeparator = cultureInfo.NumberFormat.NumberDecimalSeparator;
            NegativeSign = cultureInfo.NumberFormat.NegativeSign;
            NumberGroupSeparator = cultureInfo.NumberFormat.NumberGroupSeparator;
            PercentDecimalSeparator = cultureInfo.NumberFormat.PercentDecimalSeparator;
            PercentGroupSeparator = cultureInfo.NumberFormat.PercentGroupSeparator;
            CurrencyDecimalSeparator = cultureInfo.NumberFormat.CurrencyDecimalSeparator;
            CurrencyGroupSeparator = cultureInfo.NumberFormat.CurrencyGroupSeparator;
        }

        [JsonProperty("name")]
        public string Name { get; }

        [JsonProperty("twoLetterISOLanguageName")]
        public string TwoLetterISOLanguageName { get; }

        [JsonProperty("shortDateFormat")]
        public string ShortDateFormat { get; }

        [JsonProperty("shortTimeFormat")]
        public string ShortTimeFormat { get; }

        [JsonProperty("longDateFormat")]
        public string LongDateFormat { get; }

        [JsonProperty("abbreviatedDayNames")]
        public string[] AbbreviatedDayNames { get; }

        [JsonProperty("dayNames")]
        public string[] DayNames { get; }

        [JsonProperty("monthNames")]
        public string[] MonthNames { get; }

        [JsonProperty("firstDayOfWeek")]
        public DayOfWeek FirstDayOfWeek { get; }

        [JsonProperty("dateSeparator")]
        public string DateSeparator { get; }

        [JsonProperty("timeSeparator")]
        public string TimeSeparator { get; }

        [JsonProperty("fullDateTimeFormat")]
        public string FullDateTimeFormat { get; }

        [JsonProperty("monthDayFormat")]
        public string MonthDayFormat { get; }

        [JsonProperty("monthGenitiveNames")]
        public string[] MonthGenitiveNames { get; }

        [JsonProperty("shortestDayNames")]
        public string[] ShortestDayNames { get; }

        [JsonProperty("numberDecimalSeparator")]
        public string NumberDecimalSeparator { get; }

        [JsonProperty("negativeSign")]
        public string NegativeSign { get; }

        [JsonProperty("numberGroupSeparator")]
        public string NumberGroupSeparator { get; }

        [JsonProperty("percentDecimalSeparator")]
        public string PercentDecimalSeparator { get; }

        [JsonProperty("percentGroupSeparator")]
        public string PercentGroupSeparator { get; }

        [JsonProperty("currencyDecimalSeparator")]
        public string CurrencyDecimalSeparator { get; }

        [JsonProperty("currencyGroupSeparator")]
        public string CurrencyGroupSeparator { get; }

        [JsonProperty("longTimeFormat")]
        public string LongTimeFormat { get; }

        [JsonProperty("abbreviatedMonthNames")]
        public string[] AbbreviatedMonthNames { get; }
    }
}