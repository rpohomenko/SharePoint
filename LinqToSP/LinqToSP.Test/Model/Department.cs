using Microsoft.SharePoint.Client;
using SP.Client.Linq;
using SP.Client.Linq.Attributes;
using SP.Client.Linq.Model;
using SP.Client.Linq.Provisioning;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;

namespace LinqToSP.Test.Model
{
  [ContentType(Name = "Department", Id = "0x01004BF822E9207E43869D826290F33C909C", Level = ProvisionLevel.List, Behavior = ProvisionBehavior.Default)]
  [List(Title = "Departments", Url = "Lists/Departments", Behavior = ProvisionBehavior.Default)]
  public class Department : ListItemEntity, IEntityEntry
  {
    private SpEntitySet<Employee> _employees;

    public Department()
    {
      _employees = new SpEntitySet<Employee>();
    }

    public override int Id
    {
      get => base.Id;
      protected set
      {
        base.Id = value;
        Key = value;
      }
    }

    public override string ContentTypeId
    {
      get
      {
        if (string.IsNullOrEmpty(base.ContentTypeId))
        {
          base.ContentTypeId = "0x01004BF822E9207E43869D826290F33C909C";
        }
        return base.ContentTypeId;
      }
      set => base.ContentTypeId = value;
    }

    [TextField(Name = "Dep_ShortName", Title = "Short Name", MaxLength = 100)]
    public string ShortName
    {
      get;
      set;
    }

    public ISpEntitySet<Employee> EmployeesSet
    {
      get
      {
        return _employees.Where(employee => employee.DepartmentId == this.Id).ToEntitySet();
      }
    }

    public virtual ICollection<Employee> Employees { get; set; }

    public int Key { get; set; }
  }
}