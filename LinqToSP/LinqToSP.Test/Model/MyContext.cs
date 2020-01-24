using SP.Client.Linq;
using SP.Client.Linq.Model;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.ModelConfiguration.Conventions;

namespace LinqToSP.Test.Model
{
  public class MyContext : EFContext
  {
    public MyContext() : base("DefaultConnection")
    {
      Database.SetInitializer(new DropCreateDatabaseIfModelChanges<DbContext>());
    }

    public DbSet<Department> Departments { get; set; }

    public DbSet<Employee> Employees { get; set; }

    protected override void OnModelCreating(DbModelBuilder modelBuilder)
    {
      modelBuilder.HasDefaultSchema("My");
      //modelBuilder.Conventions.Remove<PluralizingTableNameConvention>();
      base.OnModelCreating(modelBuilder);
    }

    protected override ICollection<Type> GetMapTypes()
    {
      return new[] { typeof(DepartmentMap), typeof(EmployeeMap) };
    }
  }
}
