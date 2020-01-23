using System;
using System.Linq;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.ModelConfiguration;
using SP.Client.Linq.Attributes;

namespace SP.Client.Linq.Model
{
    public abstract class EFContext : DbContext
    {
        //public EFContext() : base("DefaultConnection")
        //{
        //}

        protected EFContext(string nameOrConnectionString) : base(nameOrConnectionString)
        {
        }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            //Database.SetInitializer<EFContext>(null);

            var mapTypes = this.GetMapTypes();

            foreach (var mapType in mapTypes.Where(t => t.BaseType != null && t.BaseType.IsGenericType && AttributeHelper.IsAssignableToGenericType(t.BaseType, typeof(EntityTypeConfiguration<>))))
            {
                dynamic mapInstance = Activator.CreateInstance(mapType);
                if (mapInstance is IEntityMap)
                {
                    (mapInstance as IEntityMap).Configure();
                }
                modelBuilder.Configurations.Add(mapInstance);
            }
            base.OnModelCreating(modelBuilder);
        }

        protected abstract ICollection<Type> GetMapTypes();
    }
}
