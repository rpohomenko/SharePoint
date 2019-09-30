using Microsoft.SharePoint.Client;
using SP.Client.Linq.Attributes;
using System;
using System.Runtime.Serialization;

namespace SP.Client.Linq
{
    [Serializable]
    [DataContract]
    public class DocumentEntity : ListItemEntity, IDocumentEntity
    {
        [DataMember]
        public virtual string Name
        {
            get;
            set;
        }

        [DataMember]
        public string Url
        {
            get;
            internal set;
        }

        [Field(Name = "File_x0020_Size", IsReadOnly = true, DataType = FieldType.Lookup)]
        [DataMember]
        public int FileSize
        {
            get;
            internal set;
        }

        [DataMember]
        [Field(Name = "File_x0020_Type", IsReadOnly = true, DataType = FieldType.Text)]
        public string FileType
        {
            get;
            internal set;
        }

        [DataMember]
        [Field(Name = "ContentVersion", IsReadOnly = true, DataType = FieldType.Lookup)]
        public int ContentVersion
        {
            get;
            internal set;
        }

        [DataMember]
        [Field(Name = "StreamHash", IsReadOnly = true, DataType = FieldType.Text)]
        public string StreamHash
        {
            get;
            internal set;
        }

        public override string ToString()
        {
            if (!string.IsNullOrWhiteSpace(Name))
            {
                return Name;
            }
            return base.ToString();
        }
    }
}
