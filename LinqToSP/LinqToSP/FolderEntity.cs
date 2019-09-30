using SP.Client.Linq.Attributes;
using System;

namespace SP.Client.Linq
{
    public class FolderEntity : ListItemEntity, IFolderEntity
    {
        public string Name { get; set; }

        public string Url { get; internal set; }

        public int ItemChildCount
        {
            get; internal set;
        }

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
