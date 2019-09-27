using Microsoft.SharePoint.Client;
using SP.Client.Linq.Attributes;

namespace SP.Client.Linq
{
  [ContentType(Id = "0x0101")]
  public interface IDocumentEntity: IListItemEntity
  {
    [Field(Name = "FileLeafRef", Required = true, DataType = FieldType.File)]
    string Name
    {
      get;
      set;
    }

    [Field(Name = "FileRef", IsReadOnly = true, DataType = FieldType.Text)]
    string FileRef
    {
      get;
    }

    [Field(Name = "FileDirRef", IsReadOnly = true, DataType = FieldType.Text)]
    string FileDirRef
    {
      get;
    }   
  }
}
