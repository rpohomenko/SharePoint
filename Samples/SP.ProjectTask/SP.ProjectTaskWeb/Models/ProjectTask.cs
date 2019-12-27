using Microsoft.SharePoint.Client;
using SP.Client.Linq;
using SP.Client.Linq.Attributes;
using SP.Client.Linq.Provisioning;
using System;
using System.Linq;
using System.Collections.Generic;
using System.Runtime.Serialization;

namespace SP.ProjectTaskWeb.Models
{
    [ContentType(Name = "ProjectTask", /*Id = "0x01084225DD54225249DB88BDACE25F9E3880",*/ ParentId = "0x0108", Level = ProvisionLevel.List, Behavior = ProvisionBehavior.Default)]
    [List(Title = "Project Tasks", Url = "Lists/ProjectTasks", Behavior = ProvisionBehavior.Default)]
    public class ProjectTask : Entity
    {
        public ProjectTask()
        {
            ProjectLookup = new SpEntityLookup<Project>();
        }

        //public override string ContentTypeId
        //{
        //    get
        //    {
        //        if (string.IsNullOrEmpty(base.ContentTypeId))
        //        {
        //            base.ContentTypeId = "0x01084225DD54225249DB88BDACE25F9E3880";
        //        }
        //        return base.ContentTypeId;
        //    }
        //    set => base.ContentTypeId = value;
        //}

        [IgnoreDataMember]
        [LookupField(Name = "pt_Project", Title = "Project", IsMultiple = false, Behavior = ProvisionBehavior.Overwrite)]
        public ISpEntityLookup<Project> ProjectLookup
        {
            get;
        }

        [LookupField(Name = "pt_Project", Behavior = ProvisionBehavior.None)]
        public FieldLookupValue ProjectValue
        {
            get;
        }

        [IgnoreDataMember]
        public Project ProjectEntity
        {
            get
            {
                return ProjectLookup.GetEntity();
            }
            set
            {
                ProjectLookup.SetEntity(value);
            }
        }

        [DataMember]
        public LookupValue Project
        {
            get
            {
                return ProjectId > 0 ? new LookupValue() { Id = ProjectId, Value = ProjectTitle } : null;
            }
            set
            {
                if (value != null)
                {
                    ProjectId = value.Id;
                    ProjectTitle = value.Value;
                }
                else
                {
                    ProjectId = 0;
                    ProjectTitle = null;
                }
            }
        }

        [DataMember]
        [LookupField(Name = "pt_Project", Result = LookupItemResult.Id)]
        public int ProjectId
        {
            get
            {
                return ProjectLookup.EntityId;
            }
            set
            {
                ProjectLookup.EntityId = value;
            }
        }

        [DataMember]
        [LookupField(Name = "pt_Project", Result = LookupItemResult.Value)]
        public string ProjectTitle
        {
            get;
            protected set;
        }

        //[DataMember]
        [UserField(Name = "AssignedTo", Title = "Assigned To", Behavior = ProvisionBehavior.Overwrite, IsMultiple = true)]
        public virtual ICollection<FieldUserValue> AssignedToLookup
        {
            get;
            set;
        }

        [DataMember]
        public ICollection<LookupValue> AssignedTo
        {
            get
            {
                return AssignedToLookup != null
                    ? AssignedToLookup.Select(lookupValue => new LookupValue() { Id = lookupValue.LookupId, Value = lookupValue.LookupValue }).ToArray()
                    : null;
            }
            set
            {
                if (value != null)
                {
                    AssignedToLookup = value.Select(lookup => new FieldUserValue() { LookupId = lookup.Id }).ToArray();
                }
                else
                {
                    AssignedToLookup = null;
                }
            }
        }

        [DataMember]
        [Field(Name = "Body", DataType = FieldType.Note, Behavior = ProvisionBehavior.None)]
        public string Body
        {
            get;
            set;
        }

        [DataMember]
        [Field(Name = "StartDate", Title = "Start Date",  DataType = FieldType.DateTime, Behavior = ProvisionBehavior.None)]
        public virtual DateTime? StartDate
        {
            get;
            set;
        }

        [DataMember]
        [Field(Name = "TaskDueDate", Title = "End Date", DataType = FieldType.DateTime, Behavior = ProvisionBehavior.None)]
        public virtual DateTime? DueDate
        {
            get;
            set;
        }

        [DataMember]
        [ChoiceField(Name = "TaskStatus", Title = "Status", Behavior = ProvisionBehavior.None)]
        public virtual TaskStatus TaskStatus
        {
            get;
            set;
        }

        //[DataMember]
        //[ChoiceField(Name = "TaskStatus", Behavior = ProvisionBehavior.None)]
        //public virtual string TaskStatus
        //{
        //    get;
        //    set;
        //}
    }

    public enum TaskStatus
    {
        None = 0,
        [Choice(Value = "Not Started")]
        NotStarted = 1,
        [Choice(Value = "In Progress")]
        InProgress = 2,
        [Choice(Value = "Completed")]
        Completed = 3
    }
}