using SP.Client.Linq.Model;

namespace LinqToSP.Test.Model
{
  public class EmployeeMap : EntityMap<Employee>
  {
    public override void Configure()
    {
      base.Configure();
      Property(e => e.Title).IsRequired().HasMaxLength(255).HasColumnName("Title");
      Property(e => e.FirstName).IsOptional().HasMaxLength(100).HasColumnName("FirstName");
      Property(e => e.LastName).IsOptional().HasMaxLength(100).HasColumnName("LastName");
      Property(e => e.DepartmentId).IsOptional().HasColumnName("DepartmentId");

      Property(e => e.Created).IsOptional().HasColumnName("Created");
      Property(e => e.Modified).IsOptional().HasColumnName("Modified");
      Ignore(e => e.ManagerLookup);
      Ignore(e => e.DepartmentLookup);
      Ignore(e => e.CreatedBy);
      Ignore(e => e.ModifiedBy);
      Ignore(e => e.EffectiveBasePermissions);
      Ignore(e => e.ParentFolderUrl);

      Ignore(e => e.Account);
      Ignore(e => e.AccountId);
      Ignore(e => e.AccountName);
      Ignore(e => e.Position);
      Ignore(e => e.Managers);
      Ignore(e => e.Description);
      Ignore(e => e.DepartmentName);
      Ignore(e => e.DepartmentTitle);
      //Ignore(e => e.Department);
     
      //HasOptional(e=>e.Department).WithMany(e => e.Employees).HasForeignKey(e => e.DepartmentId);

    }
  }
}
