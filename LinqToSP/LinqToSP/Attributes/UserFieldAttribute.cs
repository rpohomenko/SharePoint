using Microsoft.SharePoint.Client;

namespace SP.Client.Linq.Attributes
{
    public class UserFieldAttribute : LookupFieldAttribute
    {
        public UserFieldAttribute()
        {
            DataType = FieldType.User;
            UserSelectionMode = FieldUserSelectionMode.PeopleOnly;
        }

        public UserFieldAttribute(string name) : base(name)
        {
            DataType = FieldType.User;
            UserSelectionMode = FieldUserSelectionMode.PeopleOnly;
        }

        public override FieldType DataType
        {
            get
            {
                if (base.DataType != FieldType.User)
                {
                    throw new System.Exception($"Field '{Name}' must have the user field type!");
                }
                return base.DataType;
            }
            set
            {
                //if (value != FieldType.User)
                //{
                //    throw new System.Exception($"Field '{Name}' must have the user field type!");
                //}
                base.DataType = value;
            }
        }

        public virtual FieldUserSelectionMode UserSelectionMode
        {
            get; set;
        }
    }
}
