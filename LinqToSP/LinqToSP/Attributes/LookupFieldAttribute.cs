using Microsoft.SharePoint.Client;
using SP.Client.Linq.Provisioning;

namespace SP.Client.Linq.Attributes
{
  public enum LookupItemResult
  {
    None = 0,
    Id = 1,
    Value = 2
  }

  public class LookupFieldAttribute : FieldAttribute
  {
    public LookupFieldAttribute()
    {
      DataType = FieldType.Lookup;
      Result = LookupItemResult.None;
      Behavior = ProvisionBehavior.Overwrite;
    }

    public LookupFieldAttribute(string name) : base(name, FieldType.Lookup)
    {
      Result = LookupItemResult.None;
      Behavior = ProvisionBehavior.Overwrite;
    }

    public override FieldType DataType
    {
      get
      {
        if (base.DataType != FieldType.Lookup && base.DataType != FieldType.User)
        {
          throw new System.Exception($"Field '{base.Name}' must have the lookup field type!");
        }
        return base.DataType;
      }
      set
      {
        if (value != FieldType.Lookup && value != FieldType.User)
        {
          throw new System.Exception($"Field '{base.Name}' must have the lookup field type!");
        }
        base.DataType = value;
      }
    }

    public override bool? Sortable
    {
      get
      {
        if (IsMultiple)
        {
          return false;
        }
        return base.Sortable;
      }
    }
    public virtual LookupItemResult Result { get; set; }

    public bool IsMultiple { get; set; }

    public override bool Indexed { get => IsMultiple ? false : base.Indexed; }

    public override bool EnforceUniqueValues { get => IsMultiple ? false : base.EnforceUniqueValues; }

  }
}
