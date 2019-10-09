using SP.Client.Linq.Provisioning;
using System;

namespace SP.Client.Linq.Attributes
{
  [AttributeUsage(AttributeTargets.Class | AttributeTargets.Interface, Inherited = true, AllowMultiple = false)]
  public class ContentTypeAttribute : Attribute
  {
    public ContentTypeAttribute()
    {
      Behavior = ProvisionBehavior.Default;
      Level = ProvisionLevel.Default;
    }

    public virtual string Id { get; set; }

    public virtual string Name { get; set; }

    public virtual string Group { get; set; }

    public virtual string ParentId { get; set; }

    public ProvisionBehavior Behavior { get; set; }
    public ProvisionLevel Level { get; set; }

  }
}
