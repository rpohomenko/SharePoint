using FRA.Framework.Recurrence;
using Microsoft.SharePoint.Client;
using SP.Client.Linq.Attributes;
using System;

namespace SP.Client.Linq
{
    public class EventItemEntity : ListItemEntity, IEventItemEntity
    {
        [Field(Name = "EventDate", Required = true, DataType = FieldType.DateTime)]
        public virtual DateTime StartTime { get; set; }
        public virtual DateTime? EndTime { get; set; }
        public virtual bool? AllDayEvent { get; set; }
        public virtual bool? Recurrence { get; set; }
        public virtual string RecurrenceData { get; set; }
        public string RecurrenceId { get; internal set; }

        public RecurrenceRule GetRecurrence()
        {
            if (!string.IsNullOrEmpty(RecurrenceData))
            {
                return SPRecurrenceHelper.ParseRule(StartTime, EndTime, RecurrenceData);
            }
            return null;
        }
    }
}
