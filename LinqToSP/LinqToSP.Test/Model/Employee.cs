using Microsoft.SharePoint.Client;
using SP.Client.Linq;
using SP.Client.Linq.Attributes;
using System.Linq;

namespace LinqToSP.Test.Model
{
    [List(Title = "Employees", Url = "Lists/Employees")]
    [ContentType(Id = "0x0100E565C775F9444F2A854437781B8D2749", Name = "Employee2", ParentId = "0x01")]
    public class Employee : ListItemEntity
    {
        public Employee()
        {
            Manager = new SpEntityLookup<Employee>();
            Department = new SpEntityLookup<Department>();
            string query = new SpEntitySet<Employee>().Where(employee => employee.Position == EmployeePosition.Manager).Caml(true, true);
            Managers = new SpEntitySet<Employee>(query);
        }

        public override string Title
        {
            get
            {
                if (string.IsNullOrEmpty(base.Title))
                {
                    base.Title = string.Join(" ", new[] { FirstName, LastName });
                }
                return base.Title;
            }
            set => base.Title = value;
        }

        [CalculatedField(Name = "FullName", Title = "Full Name", Order = 0, Formula = "=CONCATENATE([FirstName], \" \", [LastName])", FieldRefs = new[] { "FirstName", "LastName" })]
        public string FullName
        {
            get;
            set;
        }

        [Field(Name = "FirstName", Title = "First Name", Order = 1, DataType = FieldType.Text)]
        public string FirstName
        {
            get;
            set;
        }

        [Field(Name = "LastName", Title = "Last Name", Order = 2, DataType = FieldType.Text)]
        public string LastName
        {
            get;
            set;
        }

        [Field(Name = "Position", Title = "Position", Order = 3, DataType = FieldType.Choice)]
        public EmployeePosition Position
        {
            get;
            set;
        }

        [Field(Name = "Phone", DataType = FieldType.Text, Order = 4)]
        public string Phone
        {
            get;
            set;
        }

        [Field(Name = "Email", DataType = FieldType.Text, Order = 5)]
        public string Email
        {
            get;
            set;
        }

        [Field(Name = "Manager", Title = "Manager", DataType = FieldType.Lookup, Order = 6)]
        public ISpEntityLookup<Employee> Manager
        {
            get;

        }

        public ISpEntitySet<Employee> Managers
        {
            get;
        }

        [Field(Name = "Department", Title = "Department", DataType = FieldType.Lookup, Order = 7)]
        public ISpEntityLookup<Department> Department
        {
            get;
        }

        [LookupField(Name = "Department", Result = LookupItemResult.Id)]
        public int DepartmentId
        {
            get;
            set;
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
