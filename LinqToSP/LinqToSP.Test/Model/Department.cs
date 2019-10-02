﻿using Microsoft.SharePoint.Client;
using SP.Client.Linq;
using SP.Client.Linq.Attributes;
using System.Linq;

namespace LinqToSP.Test.Model
{
  [ContentType(Name = "Department", Id = "0x01004BF822E9207E43869D826290F33C909C", Group = "Custom Content Types")]
  [List(Title = "Departments", Url = "Lists/Departments")]
  public class Department : ListItemEntity
  {
    private SpEntitySet<Employee> _employees;

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

    public ISpEntitySet<Employee> Employees
    {
      get
      {
        if (_employees.SpQueryArgs != null && _employees.SpQueryArgs.Context != null)
        {
          _employees = _employees.Where(employee => employee.DepartmentId == this.Id).ToEntitySet();
        }
        return _employees;
      }
    }
  }
}