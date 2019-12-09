using Microsoft.SharePoint.Client;
using SP.Client.Linq.Provisioning;

namespace SP.Client.Linq.Attributes
{
    public enum LookupItemResult
    {
        None = 0,
        Id = 1,
        Value = 2
    }

    public class LookupFieldAttribute : FieldAttribute
    {
        public LookupFieldAttribute()
        {
            DataType = FieldType.Lookup;
            Result = LookupItemResult.None;
            Behavior = ProvisionBehavior.Overwrite;
        }

        public LookupFieldAttribute(string name) : base(name, FieldType.Lookup)
        {
        }

        //public LookupFieldAttribute(string name, FieldType fieldType) : base(name, fieldType)
        //{
        //}

        public override FieldType DataType
        {
            get
            {
                if (base.DataType != FieldType.Lookup && base.DataType != FieldType.User)
                {
                    throw new System.Exception($"Field '{base.Name}' must have the lookup field type!");
                }
                return base.DataType;
            }
            set
            {
                if (value != FieldType.Lookup && value != FieldType.User)
                {
                    throw new System.Exception($"Field '{base.Name}' must have the lookup field type!");
                }
                base.DataType = value;
            }
        }

        public override bool? Sortable
        {
            get
            {
                return base.Sortable;
            }
            set
            {
                base.Sortable = IsMultiple ? false : value;
            }
        }
        public virtual LookupItemResult Result { get; set; }

        public bool IsMultiple { get; set; }

        public override bool Indexed
        {
            //get => base.Indexed;
            set
            {
                base.Indexed = IsMultiple ? false : value;
            }
        }

        public override bool EnforceUniqueValues
        {
            //get => base.EnforceUniqueValues;
            set
            {
                base.EnforceUniqueValues = IsMultiple ? false : value;
            }
        }

    }
}
