using Microsoft.SharePoint.Client;
using SP.Client.Linq.Attributes;
using SP.Client.Linq.Provisioning;
using System;

namespace SP.Client.Linq
{
  [ContentType(Id = "0x0102", Behavior = ProvisionBehavior.None)]
  public interface IEventEntity : IListItemEntity
  {
    [Field(Name = "StartDate", Required = true, DataType = FieldType.DateTime, Behavior = ProvisionBehavior.None)]
    DateTime StartTime { get; set; }

    [Field(Name = "EndDate", Required = true, DataType = FieldType.DateTime, Behavior = ProvisionBehavior.None)]
    DateTime? EndTime { get; set; }

    [Field(Name = "fAllDayEvent", DataType = FieldType.AllDayEvent, Behavior = ProvisionBehavior.None)]
    bool? AllDayEvent { get; set; }

    [Field(Name = "fRecurrence", DataType = FieldType.Recurrence, Behavior = ProvisionBehavior.None)]
    bool? Recurrence { get; set; }

    [Field(Name = "RecurrenceData", DataType = FieldType.Text, Behavior = ProvisionBehavior.None)]
    string RecurrenceData { get; set; }

    [Field(Name = "RecurrenceID", DataType = FieldType.Text, Behavior = ProvisionBehavior.None)]
    string RecurrenceId { get; }
  }
}
