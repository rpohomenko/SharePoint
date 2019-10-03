﻿using SP.Client.Linq.Attributes;
using System;
using System.Runtime.Serialization;

namespace SP.Client.Linq
{
    public class FolderEntity : ListItemEntity, IFolderEntity
    {
        [DataMember]
        public string Name { get; set; }

        [DataMember]
        public string Url { get; internal set; }

        [DataMember]
        public int ItemChildCount
        {
            get; internal set;
        }

        [DataMember]
        public int FolderChildCount
        {
            get; internal set;
        }

        [RemovedField()]
        public override string Title
        {
            get
            {
                throw new InvalidOperationException("Field 'Title' was removed from 'Folder' content type.");
            }
            set
            {
                throw new InvalidOperationException("Field 'Title' was removed from 'Folder' content type.");
            }
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