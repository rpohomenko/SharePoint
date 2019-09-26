using Microsoft.SharePoint.Client;
using SP.Client.Linq;
using SP.Client.Linq.Attributes;
using System.Linq;

namespace LinqToSP.Test.Model
{
    [List(Title = "Departments", Url = "Lists/Departments")]
    public class Department : ListItemEntity
    {
        private readonly SpEntitySet<Employee> _employees;

        public Department()
        {
            _employees = new SpEntitySet<Employee>();
        }

        public ISpEntitySet<Employee> Employees
        {
            get
            {
                if (_employees.SpQueryArgs != null && _employees.SpQueryArgs.Query == null)
                {
                    _employees.SpQueryArgs.Query = new SpEntitySet<Employee>().Where(employee => employee.DepartmentId == this.Id).Caml(true, true);
                }
                return _employees;
            }
        }
    }
}