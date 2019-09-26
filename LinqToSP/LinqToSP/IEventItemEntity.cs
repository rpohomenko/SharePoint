using Microsoft.SharePoint.Client;
using SP.Client.Linq.Attributes;
using System;

namespace SP.Client.Linq
{
    public interface IEventItemEntity : IListItemEntity
    {
        [Field(Name = "StartDate", Required = true, DataType = FieldType.DateTime)]
        DateTime StartTime { get; set; }

        [Field(Name = "EndDate", Required = true, DataType = FieldType.DateTime)]
        DateTime? EndTime { get; set; }

        [Field(Name = "fAllDayEvent", DataType = FieldType.AllDayEvent)]
        bool? AllDayEvent { get; set; }

        [Field(Name = "fRecurrence", DataType = FieldType.Recurrence)]
        bool? Recurrence { get; set; }

        [Field(Name = "RecurrenceData", DataType = FieldType.Text)]
        string RecurrenceData { get; set; }

        [Field(Name = "RecurrenceID", DataType = FieldType.Text)]
        string RecurrenceId { get; }
    }
}
