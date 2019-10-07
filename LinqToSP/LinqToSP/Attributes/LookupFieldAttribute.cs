using Microsoft.SharePoint.Client;

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
        }

        public LookupFieldAttribute(string name) : base(name, FieldType.Lookup)
        {
        }

        public override FieldType DataType { get => base.DataType; set => base.DataType = value; }

        public LookupItemResult Result { get; set; }

        public bool IsMultiple { get; set; }

    }
}
