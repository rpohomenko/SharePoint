using FRA.Framework.Recurrence;
using Microsoft.SharePoint.Client;
using SP.Client.Linq.Attributes;
using SP.Client.Linq.Provisioning;
using System;
using System.Runtime.Serialization;

namespace SP.Client.Linq
{
    [Serializable]
    [DataContract]
    public class EventEntity : ListItemEntity, IEventEntity
    {
        private DateTime _startTime;
        private DateTime? _endTime;
        private bool? _allDayEvent;
        private bool? _recurrence;
        private string _recurrenceData;

        [Field(Name = "EventDate", Required = true, DataType = FieldType.DateTime, Behavior = ProvisionBehavior.None)]
        [DataMember]
        public virtual DateTime StartTime
        {
            get { return _startTime; }
            set
            {
                if (value == _startTime) return;

                OnPropertyChanging(nameof(StartTime), _startTime);
                _startTime = value;
                OnPropertyChanged(nameof(StartTime), value);
            }
        }

        [DataMember]
        public virtual DateTime? EndTime
        {
            get { return _endTime; }
            set
            {
                if (value == _endTime) return;

                OnPropertyChanging(nameof(EndTime), _endTime);
                _endTime = value;
                OnPropertyChanged(nameof(EndTime), value);
            }
        }

        [DataMember]
        public virtual bool? AllDayEvent
        {
            get { return _allDayEvent; }
            set
            {
                if (value == _allDayEvent) return;

                OnPropertyChanging(nameof(AllDayEvent), _allDayEvent);
                _allDayEvent = value;
                OnPropertyChanged(nameof(AllDayEvent), value);
            }
        }

        [DataMember]
        public virtual bool? Recurrence
        {
            get { return _recurrence; }
            set
            {
                if (value == _recurrence) return;

                OnPropertyChanging(nameof(Recurrence), _recurrence);
                _recurrence = value;
                OnPropertyChanged(nameof(Recurrence), value);
            }
        }

        [DataMember]
        public virtual string RecurrenceData
        {
            get { return _recurrenceData; }
            set
            {
                if (value == _recurrenceData) return;

                OnPropertyChanging(nameof(RecurrenceData), _recurrenceData);
                _recurrenceData = value;
                OnPropertyChanged(nameof(RecurrenceData), value);
            }
        }

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
