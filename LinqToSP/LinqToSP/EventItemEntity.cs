using FRA.Framework.Recurrence;
using Microsoft.SharePoint.Client;
using SP.Client.Linq.Attributes;
using System;
using System.Runtime.Serialization;

namespace SP.Client.Linq
{
  [Serializable]
  [DataContract]
  public class EventItemEntity : ListItemEntity, IEventItemEntity
  {
    [Field(Name = "EventDate", Required = true, DataType = FieldType.DateTime)]
    [DataMember]
    public virtual DateTime StartTime { get; set; }
    [DataMember]
    public virtual DateTime? EndTime { get; set; }
    [DataMember]
    public virtual bool? AllDayEvent { get; set; }
    [DataMember]
    public virtual bool? Recurrence { get; set; }
    [DataMember]
    public virtual string RecurrenceData { get; set; }
    [DataMember]
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
