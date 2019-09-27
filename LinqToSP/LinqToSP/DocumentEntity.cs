using Microsoft.SharePoint.Client;
using SP.Client.Linq.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace SP.Client.Linq
{
  [Serializable]
  [DataContract]
  public class DocumentEntity : ListItemEntity, IDocumentEntity
  {
    [Field(Name = "FileLeafRef", Required = true, DataType = FieldType.File)]
    public virtual string Name
    {
      get;
      internal set;
    }
  }
}
