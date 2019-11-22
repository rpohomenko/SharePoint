using Microsoft.SharePoint.Client;
using SP.Client.Linq;
using SP.Client.Linq.Attributes;
using SP.Client.Linq.Provisioning;
using System.Linq;
using System.Runtime.Serialization;

namespace SP.ProjectTaskWeb.Models
{
  [ContentType(Name = "Department", Id = "0x01004BF822E9207E43869D826290F33C909C", Level = ProvisionLevel.List, Behavior = ProvisionBehavior.Default)]
  [List(Title = "Departments", Url = "Lists/Departments", Behavior = ProvisionBehavior.Default)]
  public class Department : ListItemEntity
  {
    private readonly SpEntitySet<Employee> _employees;

    public Department()
    {
      _employees = new SpEntitySet<Employee>();
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
    [DataMember]
    [TextField(Name = "pt_ShortName", Title = "Short Name", MaxLength = 100)]
    public string ShortName
    {
      get;
      set;
    }

    public ISpEntitySet<Employee> Employees
    {
      get
      {
        return _employees.Where(employee => employee.DepartmentId == this.Id).ToEntitySet();
      }
    }
  }
}