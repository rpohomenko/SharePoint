using Microsoft.SharePoint.Client;
using SP.Client.Linq.Attributes;
using SP.Client.Linq.Provisioning;

namespace SP.Client.Linq
{
  [ContentType(Id = "0x01", Behavior = ProvisionBehavior.None)]
    public interface IListItemEntity
    {
        [Field(Name = "ID", Required = true, DataType = FieldType.Counter, IsReadOnly = true, Behavior = ProvisionBehavior.None)]
        int Id { get; }

        [Field(Name = "ContentTypeId", DataType = FieldType.ContentTypeId, Behavior = ProvisionBehavior.None)]
        string ContentTypeId
        {
            get; set;
        }

        [Field(Name = "owshiddenversion", DataType = FieldType.Integer, IsReadOnly = false, Behavior = ProvisionBehavior.None)]
        int? Version
        {
            get;
        }
    }
}
