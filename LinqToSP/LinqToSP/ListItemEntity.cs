using Microsoft.SharePoint.Client;
using SP.Client.Linq.Attributes;
using System;
using System.Runtime.Serialization;

namespace SP.Client.Linq
{
  [Serializable]
  [DataContract]
  public class ListItemEntity : IListItemEntity
  {
    public ListItemEntity()
    {
    }

    [DataMember]
    public int Id { get; internal set; }

    [DataMember]
    [Field("Title", FieldType.Text, Required = false)]
    public virtual string Title { get; set; }

    /// <summary>
    /// Effective Permissions
    /// </summary>
    public BasePermissions EffectiveBasePermissions
    {
      get; internal set;
    }

    /// <summary>
    /// Version
    /// </summary>
    [DataMember]
    [Field(Name = "owshiddenversion", DataType = FieldType.Integer, IsReadOnly = false)]
    public int? Version
    {
      get; internal set;
    }

    /// <summary>
    /// Content Type ID
    /// </summary>
    [DataMember]
    public virtual string ContentTypeId
    {
      get; set;
    }

    /// <summary>
    /// Author
    /// </summary>
    [LookupField(Name = "Author", DataType = FieldType.User, IsReadOnly = true)]
    [DataMember]
    public FieldLookupValue CreatedBy
    {
      get; internal set;
    }

    /// <summary>
    /// Created date
    /// </summary>
    [Field(Name = "Created", DataType = FieldType.DateTime, IsReadOnly = true)]
    [DataMember]
    public DateTime? Created { get; internal set; }

    /// <summary>
    /// Editor
    /// </summary>
    [LookupField(Name = "Editor", DataType = FieldType.User, IsReadOnly = true)]
    [DataMember]
    public FieldLookupValue ModifiedBy
    {
      get; internal set;
    }

    /// <summary>
    /// Modified date
    /// </summary>
    [Field(Name = "Modified", DataType = FieldType.DateTime, IsReadOnly = true)]
    [DataMember]
    public DateTime? Modified
    {
      get; internal set;
    }

    public override string ToString()
    {
      if (!string.IsNullOrWhiteSpace(Title))
      {
        return Title;
      }
      return base.ToString();
    }
  }
}
