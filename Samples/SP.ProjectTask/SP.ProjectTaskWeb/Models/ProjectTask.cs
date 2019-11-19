using Microsoft.SharePoint.Client;
using SP.Client.Linq;
using SP.Client.Linq.Attributes;
using SP.Client.Linq.Provisioning;
using System;
using System.Runtime.Serialization;

namespace SP.ProjectTaskWeb.Models
{
    [ContentType(Name = "ProjectTask", /*Id = "0x01084225DD54225249DB88BDACE25F9E3880",*/ ParentId = "0x0108", Level = ProvisionLevel.List, Behavior = ProvisionBehavior.Default)]
    [List(Title = "Project Tasks", Url = "Lists/ProjectTasks", Behavior = ProvisionBehavior.Default)]
    public class ProjectTask : ListItemEntity
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

        //[IgnoreDataMember]
        //public Project Project
        //{
        //    get
        //    {
        //        return ProjectLookup.GetEntity();
        //    }
        //    set
        //    {
        //        ProjectLookup.SetEntity(value);
        //    }
        //}

        [DataMember]
        public LookupValue Project
        {
            get
            {
                return ProjectId > 0 ? new LookupValue() { Id = ProjectId, Value = ProjectValue } : null;
            }
            set
            {
                if (value != null)
                {
                    ProjectId = value.Id;
                    ProjectValue = value.Value;
                }
                else
                {
                    ProjectId = 0;
                    ProjectValue = null;
                }
            }
        }

        //[DataMember]
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

        //[DataMember]
        [LookupField(Name = "pt_Project", Result = LookupItemResult.Value)]
        public string ProjectValue
        {
            get;
            protected set;
        }

        [DataMember]
        [Field(Name = "AssignedTo", DataType = FieldType.User, Behavior = ProvisionBehavior.None)]
        public virtual FieldLookupValue AssignedTo
        {
            get;
            set;
        }

        [DataMember]
        [Field(Name = "Body", DataType = FieldType.Note, Behavior = ProvisionBehavior.None)]
        public string Body
        {
            get;
            set;
        }

        [DataMember]
        [Field(Name = "StartDate", DataType = FieldType.DateTime, Behavior = ProvisionBehavior.None)]
        public virtual DateTime? StartDate
        {
            get;
            set;
        }

        [DataMember]
        [Field(Name = "TaskDueDate", DataType = FieldType.DateTime, Behavior = ProvisionBehavior.None)]
        public virtual DateTime? DueDate
        {
            get;
            set;
        }

        [DataMember]
        [ChoiceField(Name = "TaskStatus", Behavior = ProvisionBehavior.None)]
        public virtual TaskStatus TaskStatus
        {
            get;
            set;
        }
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