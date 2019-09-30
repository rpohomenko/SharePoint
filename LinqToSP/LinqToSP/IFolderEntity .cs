using Microsoft.SharePoint.Client;
using SP.Client.Linq.Attributes;

namespace SP.Client.Linq
{
    [ContentType(Id = "0x0120")]
    public interface IFolderEntity : IListItemEntity
    {
        [Field(Name = "FileLeafRef", Required = true, DataType = FieldType.File)]
        string Name
        {
            get;
            set;
        }

        [Field(Name = "FileRef", IsReadOnly = true, DataType = FieldType.Text)]
        string Url
        {
            get;
        }

        [Field(Name = "FileDirRef", IsReadOnly = true, DataType = FieldType.Text)]
        string ParentFolderUrl
        {
            get;
        }

        [LookupField(Name = "ItemChildCount", IsReadOnly = true, DataType = FieldType.Lookup, Result = LookupItemResult.Value)]
        int ItemChildCount
        {
            get;
        }

        [LookupField(Name = "FolderChildCount", IsReadOnly = true, DataType = FieldType.Lookup, Result = LookupItemResult.Value)]
        int FolderChildCount
        {
            get;
        }
    }
}
