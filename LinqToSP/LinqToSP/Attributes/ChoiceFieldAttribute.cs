using Microsoft.SharePoint.Client;

namespace SP.Client.Linq.Attributes
{
    public class ChoiceFieldAttribute : FieldAttribute
    {
        public ChoiceFieldAttribute()
        {
            DataType = FieldType.Choice;
        }

        public ChoiceFieldAttribute(string name) : base(name, FieldType.Choice)
        {
        }

        public bool IsMultiple { get; set; }

        public override bool? Sortable
        {
            get
            {
                if (IsMultiple)
                {
                    return false;
                }
                return base.Sortable;
            }
        }

        public ChoiceFormatType EditFormat { get; set; }

        public override FieldType DataType
        {
            get
            {
                return IsMultiple ? FieldType.MultiChoice : FieldType.Choice;
            }
        }
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
