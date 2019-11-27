using Microsoft.SharePoint.Client;
using SP.Client.Linq;
using SP.Client.Linq.Attributes;
using SP.Client.Linq.Provisioning;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;

namespace SP.ProjectTaskWeb.Models
{
    [ContentType(Id = "0x0100E565C775F9444F2A854437781B8D2749", Name = "Employee", ParentId = "0x01", Level = ProvisionLevel.List, Behavior = ProvisionBehavior.Default)]
    [List(Title = "Employees", Url = "Lists/Employees", Behavior = ProvisionBehavior.Default)]
    public class Employee : Entity
    {
        public Employee()
        {
            ManagerLookup = new SpEntityLookupCollection<Employee>();
            DepartmentLookup = new SpEntityLookup<Department>();
        }

        public override string ContentTypeId
        {
            get
            {
                if (string.IsNullOrEmpty(base.ContentTypeId))
                {
                    base.ContentTypeId = "0x0100E565C775F9444F2A854437781B8D2749";
                }
                return base.ContentTypeId;
            }
            set => base.ContentTypeId = value;
        }

        public override string Title
        {
            get
            {
                if (string.IsNullOrWhiteSpace(base.Title))
                {
                    base.Title = string.IsNullOrWhiteSpace(FirstName) ? LastName : string.Join(" ", new[] { FirstName, LastName }).Trim();
                }
                return base.Title;
            }
            set
            {
                base.Title = value;
            }
        }
        [DataMember]
        [CalculatedField(Name = "pt_FullName", Title = "Full Name", Required =true, Level = ProvisionLevel.Web, Order = 0, Formula = "=CONCATENATE([pt_FirstName],\" \",[pt_LastName])", FieldRefs = new[] { "pt_FirstName", "pt_LastName" })]
        public string FullName
        {
            get;
            internal set;
        }
        [DataMember]
        [Field(Name = "pt_FirstName", Title = "First Name", Required = true, Order = 1, DataType = FieldType.Text)]
        public string FirstName
        {
            get;
            set;
        }
        [DataMember]
        [Field(Name = "pt_LastName", Title = "Last Name", Order = 2, DataType = FieldType.Text)]
        public string LastName
        {
            get;
            set;
        }

        [Field("pt_Account", Title = "Account", Order = 3, DataType = FieldType.User, Indexed = true, EnforceUniqueValues = true)]
        public FieldLookupValue Account
        {
            get;
            set;
        }
        [DataMember]
        [LookupField(Name = "pt_Account", Result = LookupItemResult.Id)]
        public int AccountId
        {
            get;
            set;
        }
        [DataMember]
        [LookupField(Name = "pt_Account", Result = LookupItemResult.Value, IsReadOnly = false)]
        public string AccountName
        {
            get;
            set;
        }
        [DataMember]
        [ChoiceField(Name = "pt_Position", Title = "Position", Order = 3, IsMultiple = true)]
        public EmployeePosition Position
        {
            get;
            set;
        }
        [DataMember]
        [Field(Name = "pt_Phone", Title = "Phone", DataType = FieldType.Text, Indexed = true, EnforceUniqueValues = true, Order = 4)]
        public string Phone
        {
            get;
            set;
        }
        [DataMember]
        [Field(Name = "pt_Email", Title = "Email", DataType = FieldType.Text, Indexed = true, EnforceUniqueValues = true, Order = 5)]
        public string Email
        {
            get;
            set;
        }

        [LookupField(Name = "pt_Manager", Title = "Manager", Order = 6, IsMultiple = true, Behavior = ProvisionBehavior.Overwrite)]
        public ISpEntityLookupCollection<Employee> ManagerLookup
        {
            get;
        }

        public ICollection<Employee> ManagerEntities
        {
            get
            {
                return ManagerLookup.GetEntities();
            }
            set
            {
                ManagerLookup.SetEntities(value);
            }
        }


        [LookupField(Name = "pt_Manager", Title = "Manager", Result = LookupItemResult.None, Order = 6, IsMultiple = true)]
        public FieldLookupValue[] Managers
        {
            get;
            set;
        }

        [DataMember]
        public ICollection<LookupValue> Manager
        {
            get
            {
                return Managers != null
                    ? Managers.Select(lookupValue => new LookupValue() { Id = lookupValue.LookupId, Value = lookupValue.LookupValue }).ToArray()
                    : null;
            }
            set
            {
                if (value != null)
                {
                    Managers = value.Select(lookup => new FieldLookupValue() { LookupId = lookup.Id }).ToArray();
                }
                else
                {
                    Managers = null;
                }
            }
        }

        [DataMember]
        public LookupValue Department
        {
            get
            {
                return DepartmentId > 0 ? new LookupValue() { Id = DepartmentId, Value = DepartmentTitle } : null;
            }
            set
            {
                if (value != null)
                {
                    DepartmentId = value.Id;
                    DepartmentTitle = value.Value;
                }
                else
                {
                    DepartmentId = 0;
                    DepartmentTitle = null;
                }
            }
        }

        [LookupField(Name = "pt_Department")]
        public Department DepartmentEntity
        {
            get { return DepartmentLookup.GetEntity(); }
            set { DepartmentLookup.SetEntity(value); }
        }

        [LookupField(Name = "pt_Department", Result = LookupItemResult.Id)]
        public int DepartmentId
        {
            get { return DepartmentLookup.EntityId; }
            set { DepartmentLookup.EntityId = value; }
        }

        [LookupField(Name = "pt_Department", Result = LookupItemResult.Value)]
        public string DepartmentTitle
        {
            get;
            protected set;
        }

        [Field(Name = "pt_Department", Title = "Department", DataType = FieldType.Lookup, Order = 7, Behavior = ProvisionBehavior.Overwrite)]
        public ISpEntityLookup<Department> DepartmentLookup
        {
            get;
        }
        [DataMember]
        [NoteField(Name = "pt_Description", Title = "Description", Order = 8, RichText = true, RestrictedMode = true)]
        public string Description
        {
            get;
            set;
        }
        [DataMember]
        [DependentLookupField(LookupFieldName = "pt_Department", ShowField = "pt_ShortName", List = "Lists/Departments", Result = LookupItemResult.Value)]
        public string DepartmentName
        {
            get;
            set;
        }
    }

    [Flags]
    public enum EmployeePosition
    {
        None = 0,
        [Choice(Value = "Web developer", Index = 4)]
        WebDeveloper = 1,
        [Choice(Value = "Project manager", Index = 1)]
        ProjectManager = 2,
        [Choice(Value = "Software tester", Index = 2)]
        SoftwareTester = 3,
        [Choice(Value = "Technical consultant", Index = 3)]
        TechnicalConsultant = 4,
        [Choice(Value = "Business analyst", Index = 0)]
        BusinessAnalyst = 5
    }
}
