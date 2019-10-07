using Microsoft.SharePoint.Client;
using SP.Client.Linq;
using SP.Client.Linq.Attributes;
using System.Collections.Generic;

namespace LinqToSP.Test.Model
{
    [ContentType(Id = "0x0100E565C775F9444F2A854437781B8D2749", Name = "Employee", ParentId = "0x01", Group = "Custom Content Types")]
    [List(Title = "Employees", Url = "Lists/Employees")]
    public class Employee : ListItemEntity
    {
        //private SpEntitySet<Employee> _managers;

        public Employee()
        {
            ManagerLookups = new SpEntityLookupCollection<Employee>();
            DepartmentLookup = new SpEntityLookup<Department>();
            //_managers = new SpEntitySet<Employee>();
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

        [CalculatedField(Name = "Emp_FullName", Title = "Full Name", Order = 0, Group = "Custom Columns", Formula = "=CONCATENATE([Emp_FirstName], \" \", [Emp_LastName])", FieldRefs = new[] { "Emp_FirstName", "Emp_LastName" })]
        public string FullName
        {
            get;
            internal set;
        }

        [Field(Name = "Emp_FirstName", Title = "First Name", Order = 1, Group = "Custom Columns", DataType = FieldType.Text)]
        public string FirstName
        {
            get;
            set;
        }

        [Field(Name = "Emp_LastName", Title = "Last Name", Order = 2, Group = "Custom Columns", DataType = FieldType.Text)]
        public string LastName
        {
            get;
            set;
        }

        [LookupField(Name = "Emp_Account", Title = "Account", Order = 3, Group = "Custom Columns", DataType = FieldType.User, IsMultiple = false)]
        public FieldLookupValue Account
        {
            get;
            set;
        }

        [LookupField(Name = "Emp_Account", Result = LookupItemResult.Id)]
        public int AccountId
        {
            get;
            set;
        }

        [LookupField(Name = "Emp_Account", Result = LookupItemResult.Value, IsReadOnly = false)]
        public string AccountName
        {
            get;
            set;
        }

        [Field(Name = "Emp_Position", Title = "Position", Order = 3, Group = "Custom Columns", DataType = FieldType.Choice)]
        public EmployeePosition Position
        {
            get;
            set;
        }

        [Field(Name = "Emp_Phone", Title = "Phone", DataType = FieldType.Text, Order = 4, Group = "Custom Columns")]
        public string Phone
        {
            get;
            set;
        }

        [Field(Name = "Emp_Email", Title = "Email", DataType = FieldType.Text, Order = 5, Group = "Custom Columns")]
        public string Email
        {
            get;
            set;
        }

        [LookupField(Name = "Emp_Manager", Title = "Manager", Order = 6, Overwrite = true, IsMultiple = true)]
        public ISpEntityLookupCollection<Employee> ManagerLookups
        {
            get;
        }
        public ICollection<Employee> Managers
        {
            get
            {
                return ManagerLookups.GetEntities();
            }
            set
            {
                ManagerLookups.SetEntities(value);
            }
        }

        [LookupField(Name = "Emp_Department")]
        public Department Department
        {
            get { return DepartmentLookup.GetEntity(); }
            set { DepartmentLookup.SetEntity(value); }
        }

        [LookupField(Name = "Emp_Department", Result = LookupItemResult.Id)]
        public int DepartmentId
        {
            get { return DepartmentLookup.EntityId; }
            set { DepartmentLookup.EntityId = value; }
        }

        [Field(Name = "Emp_Department", Title = "Department", DataType = FieldType.Lookup, Order = 7, Overwrite = true)]
        public ISpEntityLookup<Department> DepartmentLookup
        {
            get;
        }
    }

    public enum EmployeePosition
    {
        [Choice(Value = "Specialist", Index = 0)]
        Specialist = 0,
        [Choice(Value = "Manager", Index = 1)]
        Manager = 1
    }
}
