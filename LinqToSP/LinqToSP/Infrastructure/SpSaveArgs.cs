using Microsoft.SharePoint.Client;
using System.Collections.Generic;

namespace SP.Client.Linq.Infrastructure
{
    public class SpSaveArgs
    {
        public List<ListItem> Items { get; set; }
        public bool HasChanges { get; set; }
    }
}