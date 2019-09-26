using System;
using System.Linq;
using System.Collections.Generic;

namespace FRA.Framework.Recurrence
{
    [Serializable]
    public abstract class RecurrenceRule
    {
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool HasEnd
        {
            get { return NumberOfOccurrences > 0 || EndDate.HasValue; }
        }
        public int NumberOfOccurrences { get; set; }
        public int Interval { get; set; }

        public IEnumerable<Occurrence> GetOccurrences()
        {
            TimeSpan startTime = StartDate.TimeOfDay;
            TimeSpan endTime = EndDate.HasValue
                ? (startTime >= EndDate.Value.TimeOfDay
                    ? startTime
                    : EndDate.Value.TimeOfDay)
                : new TimeSpan(1, 0, 0, 0);
            return GetOccurrences(startTime, endTime);
        }

        public IEnumerable<Occurrence> GetOccurrences(TimeSpan endTime)
        {
            TimeSpan startTime = new TimeSpan(StartDate.Hour, StartDate.Minute, StartDate.Second);
            return GetOccurrences(startTime, endTime);
        }

        public IEnumerable<Occurrence> GetOccurrences(TimeSpan startTime, TimeSpan endTime)
        {
            if (startTime > endTime)
            {
                throw new ArgumentException("endTime");
            }
            int occurrenceCounter = 0;
            if (HasEnd)
            {
                Occurrence lastOccurrence = null;
                bool loop = true;
                while (loop)
                {
                    var occurrences = GetNextOccurrences(lastOccurrence, startTime, endTime);
                    bool found = false;
                    foreach (Occurrence occurrence in occurrences)
                    {
                        found = true;
                        lastOccurrence = occurrence;
                        if ((NumberOfOccurrences > 0 && NumberOfOccurrences == occurrenceCounter) ||
                            (EndDate.HasValue && occurrence.Start > EndDate.Value))
                        {
                            loop = false;
                            break;
                        }
                        occurrenceCounter++;
                        if (occurrence.Start >= StartDate)
                        {
                            yield return occurrence;
                        }
                    }
                    if (loop && !found)
                    {
                        break;
                    }
                }
            }
        }

        protected abstract IEnumerable<Occurrence> GetNextOccurrences(Occurrence lastOccurrence, TimeSpan startTime, TimeSpan endTime);
    }

    public sealed class DyilyRecurrenceRule : RecurrenceRule
    {
        public bool IsWeekday { get; set; }

        protected override IEnumerable<Occurrence> GetNextOccurrences(Occurrence lastOccurrence, TimeSpan startTime, TimeSpan endTime)
        {
            DateTime startDate;
            if (lastOccurrence != null)
            {
                startDate = lastOccurrence.Start.Date.Add(startTime).AddDays(Interval);
            }
            else
            {
                startDate = StartDate.Date.Add(startTime);
                if (StartDate > startDate)
                {
                    startDate = StartDate;
                }
            }
            if (IsWeekday)
            {
                while (startDate.DayOfWeek == System.DayOfWeek.Saturday || startDate.DayOfWeek == System.DayOfWeek.Sunday)
                {
                    startDate = startDate.AddDays(1);
                }
            }

            DateTime endDate = startDate.Date.Add(endTime);
            if (startDate <= endDate)
            {
                if (EndDate.HasValue && endDate >= EndDate.Value)
                {
                    yield return new Occurrence(startDate, EndDate.Value);
                }
                else
                {
                    yield return new Occurrence(startDate, endDate);
                }
            }
        }
    }

    [Serializable]
    public sealed class WeeklyRecurrenceRule : RecurrenceRule
    {
        public DayOfWeek[] DaysOfWeek { get; set; }
        public System.DayOfWeek FirstDayOfWeek { get; set; }

        protected override IEnumerable<Occurrence> GetNextOccurrences(Occurrence lastOccurrence, TimeSpan startTime, TimeSpan endTime)
        {
            DateTime startDate;
            if (lastOccurrence != null)
            {
                startDate = lastOccurrence.Start.Date.Add(startTime).AddDays(7 * Interval);
            }
            else
            {
                startDate = StartDate.Date.Add(startTime);
                if (StartDate > startDate)
                {
                    startDate = StartDate;
                }
            }
            while (startDate.DayOfWeek != FirstDayOfWeek)
            {
                startDate = startDate.AddDays(-1);
            }
            do
            {
                DateTime endDate = startDate.Date.Add(endTime);
                if (startDate <= endDate)
                {
                    if (SPRecurrenceHelper.IsDayOfWeekMatched(DaysOfWeek, startDate))
                    {
                        if (EndDate.HasValue && endDate >= EndDate.Value)
                        {
                            yield return new Occurrence(startDate, EndDate.Value);
                        }
                        else
                        {
                            yield return new Occurrence(startDate, endDate);
                        }
                    }
                }
                startDate = startDate.AddDays(1);
            } while (startDate.DayOfWeek != FirstDayOfWeek);
        }
    }

    [Serializable]
    public sealed class MonthlyRecurrenceRule : RecurrenceRule
    {
        public int DayOfMonth { get; set; }

        protected override IEnumerable<Occurrence> GetNextOccurrences(Occurrence lastOccurrence, TimeSpan startTime, TimeSpan endTime)
        {
            DateTime startDate;
            if (lastOccurrence != null)
            {
                startDate = lastOccurrence.Start.Date.Add(startTime).AddDays(1 - lastOccurrence.Start.Day).AddMonths(Interval);
            }
            else
            {
                startDate = StartDate.Date.Add(startTime);
                if (StartDate > startDate)
                {
                    startDate = StartDate;
                }
                if (startDate.Day > DayOfMonth)
                {
                    startDate = startDate.AddDays(1 - startDate.Day).AddMonths(1);
                }
            }
            int daysInMonth = DateTime.DaysInMonth(startDate.Year, startDate.Month);
            startDate = startDate.AddDays(((daysInMonth < DayOfMonth) ? daysInMonth : DayOfMonth) - 1);
            if (!EndDate.HasValue || startDate <= EndDate.Value)
            {
                DateTime endDate = startDate.Date.Add(endTime);
                if (startDate <= endDate)
                {
                    if (EndDate.HasValue && endDate >= EndDate.Value)
                    {
                        yield return new Occurrence(startDate, EndDate.Value);
                    }
                    else
                    {
                        yield return new Occurrence(startDate, endDate);
                    }
                }
            }
        }
    }

    [Serializable]
    public sealed class MonthlyByDayRecurrenceRule : RecurrenceRule
    {
        public DayOfWeek DayOfWeek { get; set; }
        public DayOfWeekOrdinal DayOfWeekOrdinal { get; set; }

        protected override IEnumerable<Occurrence> GetNextOccurrences(Occurrence lastOccurrence, TimeSpan startTime, TimeSpan endTime)
        {
            int[] days;
            DateTime startDate;
            if (lastOccurrence != null)
            {
                startDate = lastOccurrence.Start.Date.Add(startTime).AddDays(1 - lastOccurrence.Start.Day).AddMonths(Interval);
                days = SPRecurrenceHelper.GetMatchedDays(startDate, DayOfWeekOrdinal, DayOfWeek).ToArray();
            }
            else
            {
                startDate = StartDate.Date.Add(startTime);
                if (StartDate > startDate)
                {
                    startDate = StartDate;
                }
                days = SPRecurrenceHelper.GetMatchedDays(startDate, DayOfWeekOrdinal, DayOfWeek).ToArray();
                if (days.Length == 0)
                {
                    startDate = startDate.AddDays(1 - startDate.Day).AddMonths(1);
                    days = SPRecurrenceHelper.GetMatchedDays(startDate, DayOfWeekOrdinal, DayOfWeek).ToArray();
                }
            }
            foreach (int day in days)
            {
                startDate = startDate.AddDays(day - startDate.Day);
                DateTime endDate = startDate.Date.Add(endTime);
                if (startDate <= endDate)
                {
                    if (EndDate.HasValue && endDate >= EndDate.Value)
                    {
                        yield return new Occurrence(startDate, EndDate.Value);
                    }
                    else
                    {
                        yield return new Occurrence(startDate, endDate);
                    }
                }
            }
        }
    }

    [Serializable]
    public sealed class YearlyRecurrenceRule : RecurrenceRule
    {
        public int DayOfMonth { get; set; }
        public Month Month { get; set; }

        protected override IEnumerable<Occurrence> GetNextOccurrences(Occurrence lastOccurrence, TimeSpan startTime, TimeSpan endTime)
        {
            DateTime startDate;
            if (lastOccurrence != null)
            {
                startDate = lastOccurrence.Start.Date.Add(startTime).AddDays(1 - lastOccurrence.Start.Day).AddYears(Interval);
            }
            else
            {
                startDate = StartDate.Date.Add(startTime);
                startDate = StartDate > startDate
                    ? StartDate.AddDays(1 - startDate.Day)
                    : startDate.AddDays(1 - startDate.Day);
                if (startDate.Month > (int)Month || (startDate.Month == (int)Month && startDate.Day > DayOfMonth))
                {
                    startDate = startDate.AddDays(1 - startDate.Day).AddMonths((int)Month - startDate.Month).AddYears(1);
                }
            }
            int daysInMonth = DateTime.DaysInMonth(startDate.Year, startDate.Month);
            startDate = startDate.AddDays(((daysInMonth < DayOfMonth) ? daysInMonth : DayOfMonth) - 1);
            DateTime endDate = startDate.Date.Add(endTime);
            if (startDate <= endDate)
            {
                if (EndDate.HasValue && endDate >= EndDate.Value)
                {
                    yield return new Occurrence(startDate, EndDate.Value);
                }
                else
                {
                    yield return new Occurrence(startDate, endDate);
                }
            }
        }
    }

    [Serializable]
    public sealed class YearlyByDayRecurrenceRule : RecurrenceRule
    {
        public DayOfWeek DayOfWeek { get; set; }
        public DayOfWeekOrdinal DayOfWeekOrdinal { get; set; }
        public Month Month { get; internal set; }

        protected override IEnumerable<Occurrence> GetNextOccurrences(Occurrence lastOccurrence, TimeSpan startTime, TimeSpan endTime)
        {
            DateTime startDate;
            if (lastOccurrence != null)
            {
                startDate = lastOccurrence.Start.Date.Add(startTime).AddDays(1 - lastOccurrence.Start.Day).AddYears(Interval);
            }
            else
            {
                startDate = StartDate.Date.Add(startTime);
                startDate = StartDate > startDate
                    ? StartDate.AddDays(1 - startDate.Day)
                    : startDate.AddDays(1 - startDate.Day);
                if (startDate.Month > (int)Month)
                {
                    startDate = startDate.AddDays(1 - startDate.Day).AddMonths((int)Month - startDate.Month).AddYears(1);
                }
            }
            var days = SPRecurrenceHelper.GetMatchedDays(startDate, DayOfWeekOrdinal, DayOfWeek).ToArray();
            foreach (int day in days)
            {
                startDate = startDate.AddDays(day - startDate.Day);
                DateTime endDate = startDate.Date.Add(endTime);
                if (startDate <= endDate)
                {
                    if (EndDate.HasValue && endDate >= EndDate.Value)
                    {
                        yield return new Occurrence(startDate, EndDate.Value);
                    }
                    else
                    {
                        yield return new Occurrence(startDate, endDate);
                    }
                }
            }
        }
    }

    [Serializable]
    public sealed class Occurrence
    {
        public Occurrence(DateTime start, DateTime end)
        {
            Start = start;
            End = end;
        }

        public DateTime End { get; private set; }
        public DateTime Start { get; private set; }
        public TimeSpan Duration
        {
            get { return (End - Start).Duration(); }
        }
    }
    
    public enum Month
    {
        January = 1,
        February = 2,
        March = 3,
        April = 4,
        May = 5,
        June = 6,
        July = 7,
        August = 8,
        September = 9,
        October = 10,
        November = 11,
        December = 12
    }

    public enum DayOfWeekOrdinal
    {
        None = 0,
        First = 1,
        Second = 2,
        Third = 3,
        Fourth = 4,
        Last = 5
    }

    public enum DayOfWeek
    {
        Sunday = 0,
        Monday = 1,
        Tuesday = 2,
        Wednesday = 3,
        Thursday = 4,
        Friday = 5,
        Saturday = 6,
        Day = 7,
        Weekday = 8,
        WeekendDay = 9
    }
}
