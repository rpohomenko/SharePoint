using Microsoft.SharePoint.Client;
using System;

namespace SP.ProjectTaskWeb.Models
{
  public class SPPermissionInfo
  {
    internal SPPermissionInfo(BasePermissions permissions)
    {
      if (permissions == null) throw new ArgumentNullException(nameof(permissions));
      this.High = 0u;
      this.Low = 0u;

      foreach (var perm in (PermissionKind[])Enum.GetValues(typeof(PermissionKind)))
      {
        if (permissions.Has(perm))
        {
          if (perm == PermissionKind.FullMask)
          {
            this.Low = 65535u;
            this.High = 32767u;
            continue;
          }
          if (perm == PermissionKind.EmptyMask)
          {
            this.Low = 0u;
            this.High = 0u;
            continue;
          }
          int low = perm - PermissionKind.ViewListItems;
          uint high = 1u;
          if (low >= 0 && low < 32)
          {
            high <<= low;
            this.Low |= high;
            continue;
          }
          if (low >= 32 && low < 64)
          {
            high <<= low - 32;
            this.High |= high;
          }
        }
      }
    }

    public uint High { get; }

    public uint Low { get; }
  }
}