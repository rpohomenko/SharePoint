using Microsoft.SharePoint.Client;
using SP.Client.Linq;
using SP.Client.Linq.Attributes;
using System.Linq;

namespace LinqToSP.Test.Model
{
  [ContentType(Id = "0x0100E565C775F9444F2A854437781B8D2749", Name = "Employee", ParentId = "0x01", Group = "Custom Content Types")]
  [List(Title = "Employees", Url = "Lists/Employees")]
  public class Employee : ListItemEntity
  {
    public Employee()
    {
      Manager = new SpEntityLookup<Employee>();
      Department = new SpEntityLookup<Department>();
      string query = new SpEntitySet<Employee>().Where(employee => employee.Position == EmployeePosition.Manager).Caml(true, true);
      Managers = new SpEntitySet<Employee>(query);
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

    [Field(Name = "Emp_Manager", Title = "Manager", DataType = FieldType.Lookup, Order = 6, Overwrite = true)]
    public ISpEntityLookup<Employee> Manager
    {
      get;

    }

    public ISpEntitySet<Employee> Managers
    {
      get;
    }

    [Field(Name = "Emp_Department", Title = "Department", DataType = FieldType.Lookup, Order = 7, Overwrite = true)]
    public ISpEntityLookup<Department> Department
    {
      get;
    }

    [LookupField(Name = "Emp_Department", Result = LookupItemResult.Id)]
    public int DepartmentId
    {
      get { return Department.EntityId; }
      set { Department.EntityId = value; }
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
