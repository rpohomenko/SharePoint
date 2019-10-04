using Microsoft.SharePoint.Client;
using SP.Client.Linq.Attributes;
using SP.Client.Linq.Infrastructure;

namespace SP.Client.Linq
{
    [ContentType(Id = "0x01")]
    public interface IListItemEntity
    {
        [Field(Name = "ID", Required = true, DataType = FieldType.Counter, IsReadOnly = true)]
        int Id { get; }

        [Field(Name = "ContentTypeId", DataType = FieldType.ContentTypeId)]
        string ContentTypeId
        {
            get; set;
        }
    }
}
