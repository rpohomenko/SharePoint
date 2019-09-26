using SP.Client.Extensions;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Xml.Linq;

namespace FRA.Framework.Recurrence
{
    internal enum RecurrenceType
    {
        Daily,
        Weekly,
        Monthly,
        MonthlyByDay,
        Yearly,
        YearlyByDay
    }

    internal class SPRecurrenceRuleParser
    {
        private const string RecurrenceTag = "recurrence";
        private const string RuleTag = "rule";
        private const string RepeatTag = "repeat";
        private const string WindowEndTag = "windowEnd";
        private const string RepeatInstancesTag = "repeatInstances";
        private const string FirstDayOfWeekTag = "firstDayOfWeek";
        private const string DailyTag = "daily";
        private const string WeeklyTag = "weekly";
        private const string MonthlyTag = "monthly";
        private const string MonthlyByDayTag = "monthlyByDay";
        private const string YearlyTag = "yearly";
        private const string YearlyByDayTag = "yearlyByDay";
        private const string RepeatForeverTag = "repeatForever";

        public DateTime? WindowEnd { get; private set; }

        public RecurrenceType? Type { get; private set; }

        public int? Frequency { get; private set; }

        public int? RepeatInstances { get; private set; }

        public bool IsDay { get; private set; }

        public bool IsWeekday { get; private set; }

        public bool IsWeekendDay { get; private set; }

        public bool HasEndDate { get; private set; }

        public int? Day { get; private set; }

        public int? Month { get; private set; }

        public System.DayOfWeek? FirstDayOfWeek { get; private set; }

        public System.DayOfWeek[] DaysOfWeek { get; private set; }

        public DayOfWeekOrdinal? Ordinal { get; private set; }

        private void SetRecurrenceType(XElement repeat)
        {
            XElement daily = repeat.ElementIgnoreCase(DailyTag);
            if (daily != null)
            {
                SetDay(daily);
                if (IsWeekday)
                {
                    Frequency = 1;
                }
                else
                {
                    XAttribute dayFrequency = daily.AttributeIgnoreCase("dayFrequency");
                    Frequency = (Convert.ToInt32(dayFrequency.Value, CultureInfo.InvariantCulture));
                }
                Type = RecurrenceType.Daily;
                return;
            }
            XElement weekly = repeat.ElementIgnoreCase(WeeklyTag);
            if (weekly != null)
            {
                XAttribute weekFrequency = weekly.AttributeIgnoreCase("weekFrequency");
                Frequency = (Convert.ToInt32(weekFrequency.Value, CultureInfo.InvariantCulture));
                Type = RecurrenceType.Weekly;
                SetDaysOfWeek(weekly);
                return;
            }
            XElement monthly = repeat.ElementIgnoreCase(MonthlyTag);
            if (monthly != null)
            {
                XAttribute monthFrequency = monthly.AttributeIgnoreCase("monthFrequency");
                Frequency = (Convert.ToInt32(monthFrequency.Value, CultureInfo.InvariantCulture));
                Type = RecurrenceType.Monthly;
                SetDay(monthly);
                return;
            }
            XElement monthlyByDay = repeat.ElementIgnoreCase(MonthlyByDayTag);
            if (monthlyByDay != null)
            {
                XAttribute monthFrequency = monthlyByDay.AttributeIgnoreCase("monthFrequency");
                Frequency = (Convert.ToInt32(monthFrequency.Value, CultureInfo.InvariantCulture));
                Type = RecurrenceType.MonthlyByDay;
                SetDay(monthlyByDay);
                SetDaysOfWeek(monthlyByDay);
                SetOrdinal(monthlyByDay);
                return;
            }
            XElement yearly = repeat.ElementIgnoreCase(YearlyTag);
            if (yearly != null)
            {
                XAttribute yearFrequency = yearly.AttributeIgnoreCase("yearFrequency");
                Frequency = (Convert.ToInt32(yearFrequency.Value, CultureInfo.InvariantCulture));
                Type = RecurrenceType.Yearly;
                SetDay(yearly);
                SetMonth(yearly);
                return;
            }
            XElement yearlyByDay = repeat.ElementIgnoreCase(YearlyByDayTag);
            if (yearlyByDay != null)
            {
                XAttribute yearFrequency = yearlyByDay.AttributeIgnoreCase("yearFrequency");
                Frequency = (Convert.ToInt32(yearFrequency.Value, CultureInfo.InvariantCulture));
                Type = RecurrenceType.YearlyByDay;
                SetDay(yearlyByDay);
                SetDaysOfWeek(yearlyByDay);
                SetOrdinal(yearlyByDay);
                SetMonth(yearlyByDay);
            }
        }

        private void SetDaysOfWeek(XElement recurrenceType)
        {
            List<System.DayOfWeek> days = new List<System.DayOfWeek>();
            XAttribute su = recurrenceType.AttributeIgnoreCase("su");
            if (su != null && Convert.ToBoolean(su.Value))
            {
                days.Add(System.DayOfWeek.Sunday);
            }
            XAttribute mo = recurrenceType.AttributeIgnoreCase("mo");
            if (mo != null && Convert.ToBoolean(mo.Value))
            {
                days.Add(System.DayOfWeek.Monday);
            }
            XAttribute tu = recurrenceType.AttributeIgnoreCase("tu");
            if (tu != null && Convert.ToBoolean(tu.Value))
            {
                days.Add(System.DayOfWeek.Tuesday);
            }
            XAttribute we = recurrenceType.AttributeIgnoreCase("we");
            if (we != null && Convert.ToBoolean(we.Value))
            {
                days.Add(System.DayOfWeek.Wednesday);
            }
            XAttribute th = recurrenceType.AttributeIgnoreCase("th");
            if (th != null && Convert.ToBoolean(th.Value))
            {
                days.Add(System.DayOfWeek.Thursday);
            }
            XAttribute fr = recurrenceType.AttributeIgnoreCase("fr");
            if (fr != null && Convert.ToBoolean(fr.Value))
            {
                days.Add(System.DayOfWeek.Friday);
            }
            XAttribute sa = recurrenceType.AttributeIgnoreCase("sa");
            if (sa != null && Convert.ToBoolean(sa.Value))
            {
                days.Add(System.DayOfWeek.Saturday);
            }
            DaysOfWeek = days.ToArray();
        }

        private void SetOrdinal(XElement recurrenceType)
        {
            var weekdayOfMonth = recurrenceType.AttributeIgnoreCase("weekdayOfMonth");
            if (weekdayOfMonth != null && (Type == RecurrenceType.MonthlyByDay || Type == RecurrenceType.YearlyByDay))
            {
                string value = weekdayOfMonth.Value;
                if (!string.IsNullOrEmpty(value))
                {
                    if (string.Equals(value, "first", StringComparison.OrdinalIgnoreCase))
                    {
                        Ordinal = DayOfWeekOrdinal.First;
                    }
                    else if (string.Equals(value, "second", StringComparison.OrdinalIgnoreCase))
                    {
                        Ordinal = DayOfWeekOrdinal.Second;
                    }
                    else if (string.Equals(value, "third", StringComparison.OrdinalIgnoreCase))
                    {
                        Ordinal = DayOfWeekOrdinal.Third;
                    }
                    else if (string.Equals(value, "fourth", StringComparison.OrdinalIgnoreCase))
                    {
                        Ordinal = DayOfWeekOrdinal.Fourth;
                    }
                    else if (string.Equals(value, "last", StringComparison.OrdinalIgnoreCase))
                    {
                        Ordinal = DayOfWeekOrdinal.Last;
                    }
                }
            }
        }

        private void SetFirstDayOfWeek(XElement firstDayOfWeek)
        {
            string value = firstDayOfWeek.Value;
            if (string.Equals(value, "su", StringComparison.OrdinalIgnoreCase))
            {
                FirstDayOfWeek = System.DayOfWeek.Sunday;
                return;
            }
            if (string.Equals(value, "mo", StringComparison.OrdinalIgnoreCase))
            {
                FirstDayOfWeek = System.DayOfWeek.Monday;
                return;
            }
            if (string.Equals(value, "tu", StringComparison.OrdinalIgnoreCase))
            {
                FirstDayOfWeek = System.DayOfWeek.Tuesday;
                return;
            }
            if (string.Equals(value, "we", StringComparison.OrdinalIgnoreCase))
            {
                FirstDayOfWeek = System.DayOfWeek.Wednesday;
                return;
            }
            if (string.Equals(value, "th", StringComparison.OrdinalIgnoreCase))
            {
                FirstDayOfWeek = System.DayOfWeek.Thursday;
                return;
            }
            if (string.Equals(value, "fr", StringComparison.OrdinalIgnoreCase))
            {
                FirstDayOfWeek = System.DayOfWeek.Friday;
                return;
            }
            if (string.Equals(value, "sa", StringComparison.OrdinalIgnoreCase))
            {
                FirstDayOfWeek = System.DayOfWeek.Saturday;
            }
        }

        private void SetDay(XElement recurrenceType)
        {
            XAttribute day = recurrenceType.AttributeIgnoreCase("day");
            if (day != null)
            {
                try
                {
                    IsDay = Convert.ToBoolean(day.Value, CultureInfo.InvariantCulture);
                }
                catch
                {
                    Day = Convert.ToInt32(day.Value, CultureInfo.InvariantCulture);
                }
            }
            XAttribute weekendDay = recurrenceType.AttributeIgnoreCase("weekend_day");
            if (weekendDay != null)
            {
                IsWeekendDay = Convert.ToBoolean(weekendDay.Value);
            }
            XAttribute weekday = recurrenceType.AttributeIgnoreCase("weekday");
            if (weekday != null)
            {
                IsWeekday = Convert.ToBoolean(weekday.Value);
            }
        }

        private void SetMonth(XElement recurrenceType)
        {
            XAttribute month = recurrenceType.AttributeIgnoreCase("month");
            if (month != null)
            {
                Month = (Convert.ToInt32(month.Value, CultureInfo.InvariantCulture));
            }
        }

        public SPRecurrenceRuleParser(string ruleXml)
        {
            XElement recurrence = XElement.Parse(ruleXml);
            if (string.Equals(recurrence.Name.LocalName, RecurrenceTag, StringComparison.OrdinalIgnoreCase))
            {
                XElement rule = recurrence.ElementIgnoreCase(RuleTag);
                if (rule != null)
                {
                    XElement repeat = rule.ElementIgnoreCase(RepeatTag);
                    if (repeat != null)
                    {
                        SetRecurrenceType(repeat);
                    }
                    XElement repeatForever = rule.ElementIgnoreCase(RepeatForeverTag);
                    if (repeatForever != null)
                    {
                        HasEndDate = Convert.ToBoolean(repeatForever.Value);
                    }
                    XElement windowEnd = rule.ElementIgnoreCase(WindowEndTag);
                    if (windowEnd != null)
                    {
                        string windowEndDate = windowEnd.Value;
                        WindowEnd = new DateTime(Convert.ToInt32(windowEndDate.Substring(0, 4)), Convert.ToInt32(windowEndDate.Substring(5, 2)), Convert.ToInt32(windowEndDate.Substring(8, 2)), Convert.ToInt32(windowEndDate.Substring(11, 2)), Convert.ToInt32(windowEndDate.Substring(14, 2)), Convert.ToInt32(windowEndDate.Substring(17, 2)), new GregorianCalendar());
                        HasEndDate = true;
                    }
                    XElement repeatInstances = rule.ElementIgnoreCase(RepeatInstancesTag);
                    if (repeatInstances != null)
                    {
                        RepeatInstances = Convert.ToInt32(repeatInstances.Value, CultureInfo.InvariantCulture);
                        HasEndDate = true;
                    }
                    XElement firstDayOfWeek = rule.ElementIgnoreCase(FirstDayOfWeekTag);
                    if (firstDayOfWeek != null)
                    {
                        SetFirstDayOfWeek(firstDayOfWeek);
                    }
                }
            }
        }
    }
}
