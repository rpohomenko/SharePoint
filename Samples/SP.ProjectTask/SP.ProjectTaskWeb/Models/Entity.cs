using Microsoft.SharePoint.Client;
using SP.Client.Linq;
using System.Runtime.Serialization;

namespace SP.ProjectTaskWeb.Models
{
    public abstract class Entity: ListItemEntity
    {
        [DataMember]
        public bool CanUpdate
        {
            get
            {
               return EffectiveBasePermissions != null ? EffectiveBasePermissions.Has(PermissionKind.EditListItems) : false;
            }
        }       

        [DataMember]
        public bool CanDelete
        {
            get
            {
                return EffectiveBasePermissions != null ? EffectiveBasePermissions.Has(PermissionKind.DeleteListItems) : false;
            }
        }
    }
}