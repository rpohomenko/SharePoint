using SP.Client.Linq.Attributes;
using System.Data.Entity.ModelConfiguration;
using System.Linq;

namespace SP.Client.Linq.Model
{
    public interface IEntityMap
    {
        void Configure();
    }

    public interface IEntityMap<TEntity> : IEntityMap
            where TEntity : class, IListItemEntity, IEntityEntry, new()
    {

    }

    public abstract class EntityMap<TEntity> : EntityTypeConfiguration<TEntity>, IEntityMap<TEntity>
        where TEntity : class, IListItemEntity, IEntityEntry, new()
    {
        public EntityMap()
        {
            //Configure();
        }

        public virtual void Configure()
        {
            var lookupList = AttributeHelper.GetCustomAttributes<ListAttribute>(typeof(TEntity), false).FirstOrDefault();
            if (lookupList != null && lookupList.Url != null)
            {
                ToTable(lookupList.Url.Split('/').LastOrDefault());
            }

            //HasKey(p => p.Id);
            Property(p => p.Id).IsRequired().HasColumnName("ListItemId");
            Property(p => p.ContentTypeId).HasColumnName("ContentTypeId");
            Property(p => p.Version).HasColumnName("Version");

            HasKey(p => p.Key);
            Property(p => p.Key).HasColumnName("Id");
        }
    }
}
