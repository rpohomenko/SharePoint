using Microsoft.SharePoint.Client;

namespace SP.Client.Linq.Attributes
{
    public sealed class TextFieldAttribute : FieldAttribute
    {
        public TextFieldAttribute()
        {
            DataType = FieldType.Text;
        }

        public TextFieldAttribute(string name) : base(name, FieldType.Text)
        {
        }
        public int MaxLength { get; set; }

        public override FieldType DataType { get => FieldType.Text; }
    }
}
