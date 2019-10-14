using Microsoft.SharePoint.Client;

namespace SP.Client.Linq.Attributes
{
    public sealed class NoteFieldAttribute : FieldAttribute
    {
        public NoteFieldAttribute()
        {
            DataType = FieldType.Note;
            Sortable = false;
        }

        public NoteFieldAttribute(string name) : base(name, FieldType.Note)
        {
            Sortable = false;
        }

        public bool AllowHyperlink { get; set; }
        public bool AppendOnly { get; set; }
        public int NumberOfLines { get; set; }
        public bool RestrictedMode { get; set; }
        public bool RichText { get; set; }
        public bool UnlimitedLengthInDocumentLibrary { get; set; }

        public override bool Sortable { get => false; }

        public override FieldType DataType { get => FieldType.Note; }
    }
}
