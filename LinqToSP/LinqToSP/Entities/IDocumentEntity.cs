using Microsoft.SharePoint.Client;
using SP.Client.Linq.Attributes;
using SP.Client.Linq.Provisioning;

namespace SP.Client.Linq
{
    [ContentType(Id = "0x0101", Behavior = ProvisionBehavior.None)]
    public interface IDocumentEntity : IListItemEntity
    {
        [Field(Name = "FileLeafRef", Required = true, DataType = FieldType.File, Behavior = ProvisionBehavior.None)]
        string Name
        {
            get;
            set;
        }

        [Field(Name = "FileRef", IsReadOnly = true, DataType = FieldType.Text, Behavior = ProvisionBehavior.None)]
        string Url
        {
            get;
        }

        [Field(Name = "FileDirRef", IsReadOnly = true, DataType = FieldType.Text, Behavior = ProvisionBehavior.None)]
        string ParentFolderUrl
        {
            get;
        }
    }
}
