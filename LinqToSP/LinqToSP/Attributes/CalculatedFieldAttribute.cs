using Microsoft.SharePoint.Client;
using System;

namespace SP.Client.Linq.Attributes
{
    public class CalculatedFieldAttribute : FieldAttribute
    {
        public CalculatedFieldAttribute()
        {
            DataType = FieldType.Calculated;
            ResultType = FieldType.Text;
        }

        public CalculatedFieldAttribute(string name) : base(name, FieldType.Calculated)
        {
        }

        public string Formula { get; set; }
        public string[] FieldRefs { get; set; }
        public FieldType ResultType { get; set; }
        public override FieldType DataType { get => FieldType.Calculated; set => base.DataType = value; }
    }
}
