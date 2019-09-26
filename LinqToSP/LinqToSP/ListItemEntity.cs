using Microsoft.SharePoint.Client;
using SP.Client.Linq.Attributes;
using System;

namespace SP.Client.Linq
{
    public class ListItemEntity : IListItemEntity
    {
        public ListItemEntity()
        {
        }
      
        public int Id { get; internal set; }

        [Field("Title", FieldType.Text, Required = false)]
        public virtual string Title { get; set; }
                
        /// <summary>
        /// Effective Permissions
        /// </summary>
        public BasePermissions EffectiveBasePermissions
        {
            get; internal set;
        }

        /// <summary>
        /// Version
        /// </summary>
        [Field(Name = "owshiddenversion", DataType = FieldType.Integer, IsReadOnly = false)]
        public int? Version
        {
            get; internal set;
        }

        /// <summary>
        /// Content Type ID
        /// </summary>
        [Field(Name = "ContentTypeId", DataType = FieldType.ContentTypeId)]
        public virtual string ContentTypeId
        {
            get; set;
        }

        /// <summary>
        /// Author
        /// </summary>
        [LookupField(Name = "Author", DataType = FieldType.User, IsReadOnly = true)]
        public FieldLookupValue CreatedBy
        {
            get; internal set;
        }

        /// <summary>
        /// Created date
        /// </summary>
        [Field(Name = "Created", DataType = FieldType.DateTime, IsReadOnly = true)]
        public DateTime? Created { get; internal set; }

        /// <summary>
        /// Editor
        /// </summary>
        [LookupField(Name = "Editor", DataType = FieldType.User, IsReadOnly = true)]
        public FieldLookupValue ModifiedBy
        {
            get; internal set;
        }

        /// <summary>
        /// Modified date
        /// </summary>
        [Field(Name = "Modified", DataType = FieldType.DateTime, IsReadOnly = true)]
        public DateTime? Modified
        {
            get; internal set;
        }
    }
}
