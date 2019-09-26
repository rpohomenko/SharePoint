using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.SharePoint.Client;

namespace FRA.Framework.Recurrence
{
    public static class SPRecurrenceHelper
    {
        public static TimeSpan GetDuration(this ListItem item, DateTime? startDate = null, DateTime? endDate = null)
        {
            TimeSpan duration;
            bool isRecurrence = (bool)item["fRecurrence"];
            if (isRecurrence)
            {
                bool isAllDayEvent = (bool)item["fAllDayEvent"];
                duration = new TimeSpan();
                RecurrenceRule recurrenceRule = item.GetRecurrenceRule("EventDate", "EndDate", "RecurrenceData");
                TimeSpan startTime = recurrenceRule.StartDate.TimeOfDay;
                TimeSpan endTime;
                if (endDate.HasValue)
                {
                    if (recurrenceRule.EndDate.HasValue)
                    {
                        endTime = recurrenceRule.EndDate.Value.TimeOfDay;
                        if (recurrenceRule.EndDate.Value > endDate.Value)
                        {
                            recurrenceRule.EndDate = endDate;
                        }
                    }
                    else
                    {
                        if (recurrenceRule.StartDate <= endDate.Value)
                        {
                            endTime = TimeSpan.FromDays(1);
                            recurrenceRule.EndDate = endDate;
                        }
                        else
                        {
                            duration = new TimeSpan();
                            return duration;
                        }
                    }
                }
                else
                {
                    endTime = TimeSpan.FromDays(1);
                }

                if (startDate.HasValue &&
                    (recurrenceRule.EndDate.HasValue && startDate.Value > recurrenceRule.EndDate.Value))
                {
                    duration = new TimeSpan();
                    return duration;
                }

                var occurrences = isAllDayEvent
                    ? recurrenceRule.GetOccurrences(new TimeSpan(), TimeSpan.FromDays(1))
                    : recurrenceRule.GetOccurrences(startTime, endTime);
                foreach (Occurrence occurrence in occurrences)
                {
                    if (startDate.HasValue && occurrence.Start < startDate.Value)
                    {
                        if (occurrence.End > startDate.Value)
                        {
                            duration = duration.Add((occurrence.End - startDate.Value).Duration());
                        }
                        continue;
                    }
                    duration = duration.Add(occurrence.Duration);
                }
            }
            else
            {
                var start = (DateTime)item["EventDate"];
                var end = (DateTime)item["EndDate"];
                if (startDate.HasValue && (startDate.Value > start))
                {
                    start = startDate.Value;
                }
                if (endDate.HasValue && (endDate.Value < end))
                {
                    end = endDate.Value;
                }
                duration = (end - start).Duration();
            }
            return duration;
        }

        public static RecurrenceRule GetRecurrenceRule(this ListItem item, string startDateFieldName, string endDateFieldName, string recurrenceDataFieldName)
        {
            if (item == null) throw new ArgumentNullException("item");
            if (string.IsNullOrWhiteSpace(startDateFieldName)) throw new ArgumentNullException("startDateFieldName");
            if (string.IsNullOrWhiteSpace(endDateFieldName)) throw new ArgumentNullException("endDateFieldName");
            if (string.IsNullOrWhiteSpace(recurrenceDataFieldName)) throw new ArgumentNullException("recurrenceDataFieldName");
            DateTime startDate = (DateTime)item[startDateFieldName];
            DateTime endDate = (DateTime)item[endDateFieldName];
            string recurrenceData = (string)item[recurrenceDataFieldName];
            if (!string.IsNullOrEmpty(recurrenceData))
            {
                return ParseRule(startDate, endDate, recurrenceData);
            }
            return null;
        }

        public static RecurrenceRule ParseRule(DateTime startDate, DateTime? endDate, string recurrenceData)
        {
            RecurrenceRule recurrenceRule = null;
            var ruleParser = new SPRecurrenceRuleParser(recurrenceData);
            if (ruleParser.Type.HasValue)
            {
                switch (ruleParser.Type)
                {
                    case RecurrenceType.Daily:
                        var dyilyRecurrenceRule = new DyilyRecurrenceRule { IsWeekday = ruleParser.IsWeekday };
                        recurrenceRule = dyilyRecurrenceRule;
                        break;
                    case RecurrenceType.Weekly:
                        var weeklyRecurrenceRule = new WeeklyRecurrenceRule();
                        var daysOfWeek = new List<DayOfWeek>(ruleParser.DaysOfWeek.Select(GetDayOfWeek));
                        if (ruleParser.IsDay)
                        {
                            daysOfWeek.Add(DayOfWeek.Day);
                        }
                        if (ruleParser.IsWeekday)
                        {
                            daysOfWeek.Add(DayOfWeek.Weekday);
                        }
                        if (ruleParser.IsWeekendDay)
                        {
                            daysOfWeek.Add(DayOfWeek.WeekendDay);
                        }
                        weeklyRecurrenceRule.DaysOfWeek = daysOfWeek.ToArray();
                        if (ruleParser.FirstDayOfWeek.HasValue)
                        {
                            weeklyRecurrenceRule.FirstDayOfWeek = ruleParser.FirstDayOfWeek.Value;
                        }
                        recurrenceRule = weeklyRecurrenceRule;
                        break;
                    case RecurrenceType.Monthly:
                        var monthlyRecurrenceRule = new MonthlyRecurrenceRule();
                        if (ruleParser.Day != null)
                        {
                            monthlyRecurrenceRule.DayOfMonth = ruleParser.Day.Value;
                        }
                        recurrenceRule = monthlyRecurrenceRule;
                        break;
                    case RecurrenceType.MonthlyByDay:
                        var monthlyByDayRecurrenceRule = new MonthlyByDayRecurrenceRule();
                        if (ruleParser.IsDay)
                        {
                            monthlyByDayRecurrenceRule.DayOfWeek = DayOfWeek.Day;
                        }
                        else if (ruleParser.IsWeekday)
                        {
                            monthlyByDayRecurrenceRule.DayOfWeek = DayOfWeek.Weekday;
                        }
                        else if (ruleParser.IsWeekendDay)
                        {
                            monthlyByDayRecurrenceRule.DayOfWeek = DayOfWeek.WeekendDay;
                        }
                        else if (ruleParser.DaysOfWeek.Length > 0)
                        {
                            monthlyByDayRecurrenceRule.DayOfWeek = GetDayOfWeek(ruleParser.DaysOfWeek.First());
                        }
                        if (ruleParser.Ordinal != null)
                        {
                            monthlyByDayRecurrenceRule.DayOfWeekOrdinal = ruleParser.Ordinal.Value;
                        }
                        recurrenceRule = monthlyByDayRecurrenceRule;
                        break;
                    case RecurrenceType.Yearly:
                        var yearlyRecurrenceRule = new YearlyRecurrenceRule();
                        if (ruleParser.Month != null)
                        {
                            yearlyRecurrenceRule.Month = (Month)ruleParser.Month;
                        }
                        if (ruleParser.Day != null)
                        {
                            yearlyRecurrenceRule.DayOfMonth = ruleParser.Day.Value;
                        }
                        recurrenceRule = yearlyRecurrenceRule;
                        break;
                    case RecurrenceType.YearlyByDay:
                        var yearlyByDayRecurrenceRule = new YearlyByDayRecurrenceRule();
                        if (ruleParser.Month != null)
                        {
                            yearlyByDayRecurrenceRule.Month = (Month)ruleParser.Month;
                        }
                        if (ruleParser.IsDay)
                        {
                            yearlyByDayRecurrenceRule.DayOfWeek = DayOfWeek.Day;
                        }
                        else if (ruleParser.IsWeekday)
                        {
                            yearlyByDayRecurrenceRule.DayOfWeek = DayOfWeek.Weekday;
                        }
                        else if (ruleParser.IsWeekendDay)
                        {
                            yearlyByDayRecurrenceRule.DayOfWeek = DayOfWeek.WeekendDay;
                        }
                        else if (ruleParser.DaysOfWeek.Length > 0)
                        {
                            yearlyByDayRecurrenceRule.DayOfWeek = GetDayOfWeek(ruleParser.DaysOfWeek.First());
                        }
                        if (ruleParser.Ordinal != null)
                        {
                            yearlyByDayRecurrenceRule.DayOfWeekOrdinal = ruleParser.Ordinal.Value;
                        }
                        recurrenceRule = yearlyByDayRecurrenceRule;
                        break;
                }

                if (recurrenceRule != null)
                {
                    if (ruleParser.Frequency != null)
                    {
                        recurrenceRule.Interval = ruleParser.Frequency.Value;
                    }
                    if (ruleParser.WindowEnd.HasValue)
                    {
                        recurrenceRule.EndDate = endDate < ruleParser.WindowEnd.Value
                            ? endDate
                            : ruleParser.WindowEnd.Value;
                        recurrenceRule.StartDate = startDate > ruleParser.WindowEnd.Value
                            ? ruleParser.WindowEnd.Value
                            : startDate;
                    }
                    else
                    {
                        recurrenceRule.StartDate = startDate;
                        recurrenceRule.EndDate = endDate;
                    }
                    if (ruleParser.RepeatInstances != null)
                    {
                        recurrenceRule.NumberOfOccurrences = ruleParser.RepeatInstances.Value;
                    }
                }
            }
            return recurrenceRule;
        }

        public static bool IsDayOfWeekMatched(IEnumerable<DayOfWeek> dayOfWeeks, DateTime date)
        {
            if (dayOfWeeks == null) throw new ArgumentNullException("dayOfWeeks");
            var dayOfWeekArray = dayOfWeeks as DayOfWeek[] ?? dayOfWeeks.ToArray();
            if (dayOfWeekArray.Any(dayOfWeek => dayOfWeek == DayOfWeek.Day)) return true;
            switch (date.DayOfWeek)
            {
                case System.DayOfWeek.Sunday:
                    return dayOfWeekArray.Any(dayOfWeek => dayOfWeek == DayOfWeek.Sunday || dayOfWeek == DayOfWeek.WeekendDay);
                case System.DayOfWeek.Monday:
                    return dayOfWeekArray.Any(dayOfWeek => dayOfWeek == DayOfWeek.Monday || dayOfWeek == DayOfWeek.Weekday);
                case System.DayOfWeek.Tuesday:
                    return dayOfWeekArray.Any(dayOfWeek => dayOfWeek == DayOfWeek.Tuesday || dayOfWeek == DayOfWeek.Weekday);
                case System.DayOfWeek.Wednesday:
                    return dayOfWeekArray.Any(dayOfWeek => dayOfWeek == DayOfWeek.Wednesday || dayOfWeek == DayOfWeek.Weekday);
                case System.DayOfWeek.Thursday:
                    return dayOfWeekArray.Any(dayOfWeek => dayOfWeek == DayOfWeek.Thursday || dayOfWeek == DayOfWeek.Weekday);
                case System.DayOfWeek.Friday:
                    return dayOfWeekArray.Any(dayOfWeek => dayOfWeek == DayOfWeek.Friday || dayOfWeek == DayOfWeek.Weekday);
                case System.DayOfWeek.Saturday:
                    return dayOfWeekArray.Any(dayOfWeek => dayOfWeek == DayOfWeek.Saturday || dayOfWeek == DayOfWeek.WeekendDay);
            }
            return false;
        }

        public static DayOfWeek GetDayOfWeek(System.DayOfWeek dayOfWeek)
        {
            switch (dayOfWeek)
            {
                case System.DayOfWeek.Sunday:
                    return DayOfWeek.Sunday;
                case System.DayOfWeek.Monday:
                    return DayOfWeek.Monday;
                case System.DayOfWeek.Tuesday:
                    return DayOfWeek.Tuesday;
                case System.DayOfWeek.Wednesday:
                    return DayOfWeek.Wednesday;
                case System.DayOfWeek.Thursday:
                    return DayOfWeek.Thursday;
                case System.DayOfWeek.Friday:
                    return DayOfWeek.Friday;
                case System.DayOfWeek.Saturday:
                    return DayOfWeek.Saturday;
            }
            return DayOfWeek.Sunday;
        }

        public static IEnumerable<int> GetMatchedDays(DateTime startDate, DayOfWeekOrdinal dayOfWeekOrdinal, DayOfWeek dayOfWeek)
        {
            int ordinal = 0;
            DateTime currentDate = new DateTime(startDate.Year, startDate.Month,
                dayOfWeekOrdinal == DayOfWeekOrdinal.Last ? DateTime.DaysInMonth(startDate.Year, startDate.Month) : 1);
            while (currentDate.Month == startDate.Month)
            {
                if (IsDayOfWeekMatched(new[] { dayOfWeek }, currentDate))
                {
                    if (dayOfWeekOrdinal == DayOfWeekOrdinal.Last)
                    {
                        if (currentDate.Day >= startDate.Day)
                        {
                            yield return currentDate.Day;
                        }
                        break;
                    }
                    ordinal++;
                    if (ordinal == (int)dayOfWeekOrdinal || dayOfWeekOrdinal == DayOfWeekOrdinal.None)
                    {
                        if (currentDate.Day >= startDate.Day)
                        {
                            yield return currentDate.Day;
                        }
                        break;
                    }
                }
                currentDate = currentDate.AddDays(dayOfWeekOrdinal == DayOfWeekOrdinal.Last ? -1 : 1);
            }
        }
    }
}

