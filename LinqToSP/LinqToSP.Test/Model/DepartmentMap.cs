using SP.Client.Linq.Model;

namespace LinqToSP.Test.Model
{
    public class DepartmentMap : EntityMap<Department>
    {
        public override void Configure()
        {
            base.Configure();
            Property(e => e.Title).IsRequired().HasMaxLength(255).HasColumnName("Title");
            Property(e => e.ShortName).IsOptional().HasMaxLength(100).HasColumnName("ShortName");
            Property(e => e.Created).IsOptional().HasColumnName("Created");
            Property(e => e.Modified).IsOptional().HasColumnName("Modified");
            Ignore(e => e.Employees);
            Ignore(e => e.CreatedBy);
            Ignore(e => e.ModifiedBy);
            Ignore(e => e.EffectiveBasePermissions);
            Ignore(e => e.ParentFolderUrl);
        }
    }
}
