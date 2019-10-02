using Microsoft.SharePoint.Client;
using System;

namespace SP.Client.Linq.Attributes
{
  [AttributeUsage(AttributeTargets.Class | AttributeTargets.Interface, Inherited = true, AllowMultiple = false)]
  public class ContentTypeAttribute : Attribute
  {
    public ContentTypeAttribute()
    {
    }

    public virtual string Id { get; set; }

    public virtual string Name { get; set; }

    public virtual string Group { get; set; }

    public virtual string ParentId { get; set; }

  }
}
