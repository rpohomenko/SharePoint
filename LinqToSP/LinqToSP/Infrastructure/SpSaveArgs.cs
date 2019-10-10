using Microsoft.SharePoint.Client;
using System.Collections.Generic;

namespace SP.Client.Linq.Infrastructure
{
    public sealed class SpSaveArgs
    {
        public Dictionary<ListItem, bool> Items { get; set; }
        public bool HasChanges { get; set; }
    }
}