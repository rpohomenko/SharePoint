﻿using Microsoft.SharePoint.Client;
using SP.Client.Linq.Attributes;
using SP.Client.Linq.Provisioning;
using System;
using System.Runtime.Serialization;

namespace SP.Client.Linq
{
    [Serializable]
    [DataContract]
    public class DocumentEntity : ListItemEntity, IDocumentEntity
    {
        private string _name;

        [DataMember]
        public virtual string Name
        {
            get { return _name; }
            set
            {
                if (value == _name) return;

                OnPropertyChanging(nameof(Name), _name);
                _name = value;
                OnPropertyChanged(nameof(Name), value);
            }
        }

        [DataMember]
        public string Url
        {
            get;
            internal set;
        }

        [Field(Name = "File_x0020_Size", IsReadOnly = true, DataType = FieldType.Lookup, Behavior = ProvisionBehavior.None)]
        [DataMember]
        public int FileSize
        {
            get;
            internal set;
        }

        [DataMember]
        [Field(Name = "File_x0020_Type", IsReadOnly = true, DataType = FieldType.Text, Behavior = ProvisionBehavior.None)]
        public string FileType
        {
            get;
            internal set;
        }

        [DataMember]
        [Field(Name = "ContentVersion", IsReadOnly = true, DataType = FieldType.Lookup, Behavior = ProvisionBehavior.None)]
        public int ContentVersion
        {
            get;
            internal set;
        }

        [DataMember]
        [Field(Name = "StreamHash", IsReadOnly = true, DataType = FieldType.Text, Behavior = ProvisionBehavior.None)]
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
