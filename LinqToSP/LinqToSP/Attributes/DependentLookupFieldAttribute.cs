using Microsoft.SharePoint.Client;
using SP.Client.Linq.Provisioning;

namespace SP.Client.Linq.Attributes
{
    public class DependentLookupFieldAttribute : LookupFieldAttribute
    {
        public DependentLookupFieldAttribute()
        {
            Result = LookupItemResult.None;
            Behavior = ProvisionBehavior.None;
        }

        public DependentLookupFieldAttribute(string name) : base(name)
        {
        }

        public string LookupFieldName { get; set; }

        public string ShowField { get; set; }

        public string List { get; set; }

        public override string Name
        {
            get
            {
                if (string.IsNullOrEmpty(base.Name))
                {
                    return $"{this.LookupFieldName}_{this.ShowField}";
                }
                return base.Name;
            }
            set => base.Name = value;
        }

        public override FieldType DataType { get => FieldType.Lookup; }

        public override ProvisionBehavior Behavior { get => ProvisionBehavior.None; }
    }
}
