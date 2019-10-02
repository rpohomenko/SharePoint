﻿using Microsoft.SharePoint.Client;
using System;

namespace SP.Client.Linq.Attributes
{
  [AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Class | AttributeTargets.Interface, Inherited = true, AllowMultiple = false)]
  public class ListAttribute : Attribute
  {
    public ListAttribute() : this(ListTemplateType.GenericList)
    {

    }

    public ListAttribute(ListTemplateType type)
    {
      Type = type;
    }

    public virtual string Title { get; set; }

    public virtual string Url { get; set; }

    internal Guid Id { get; set; }

    public virtual ListTemplateType Type { get; set; }

    public virtual Guid TemplateFeatureId { get; set; }
  }
}
