using Microsoft.SharePoint.Client;

namespace SP.Client.Linq.Attributes
{
    public class CalculatedFieldAttribute : FieldAttribute
    {
        public CalculatedFieldAttribute()
        {
            DataType = FieldType.Calculated;
            ResultType = FieldType.Text;
            IsReadOnly = true;
            Behavior = Provisioning.ProvisionBehavior.Overwrite;
        }

        public CalculatedFieldAttribute(string name) : base(name, FieldType.Calculated)
        {
        }

        public string Formula { get; set; }
        public string[] FieldRefs { get; set; }
        public FieldType ResultType { get; set; }
        public override FieldType DataType { get => FieldType.Calculated; }

        public override bool Indexed { get => false; }

        public override bool EnforceUniqueValues { get => false; }
    }
}
