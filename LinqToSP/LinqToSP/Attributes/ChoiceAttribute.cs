using System;

namespace SP.Client.Linq.Attributes
{
  [AttributeUsage(AttributeTargets.Field, AllowMultiple = false)]
  public sealed class ChoiceAttribute: Attribute
  {
    public ChoiceAttribute()
    {
    }

    public string Value { get; set; }

    public int Index { get; set; }

  }
}
