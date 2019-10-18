using Microsoft.SharePoint.Client;
using SP.Client.Linq;
using SP.Client.Linq.Attributes;
using SP.Client.Linq.Provisioning;
using System;

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

        [LookupField(Name = "pt_Project", Title = "Project", IsMultiple = false, Behavior = ProvisionBehavior.Overwrite)]
        public ISpEntityLookup<Project> ProjectLookup
        {
            get;
        }

        public Project Project
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

        [Field(Name = "AssignedTo", DataType = FieldType.User, Behavior = ProvisionBehavior.None)]
        public virtual FieldLookupValue AssignedTo
        {
            get;
            set;
        }

        [Field(Name = "Body", DataType = FieldType.Note, Behavior = ProvisionBehavior.None)]
        public string Body
        {
            get;
            set;
        }

        [Field(Name = "StartDate", DataType = FieldType.DateTime, Behavior = ProvisionBehavior.None)]
        public virtual DateTime? StartDate
        {
            get;
            set;
        }

        [Field(Name = "TaskDueDate", DataType = FieldType.DateTime, Behavior = ProvisionBehavior.None)]
        public virtual DateTime? DueDate
        {
            get;
            set;
        }

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