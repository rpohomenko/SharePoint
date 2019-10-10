using Microsoft.SharePoint.Client;
using SP.Client.Linq.Attributes;
using System;
using System.Collections.Generic;

namespace SP.Client.Linq.Query
{
  public sealed class SpQueryArgs<TContext> : ICloneable
      where TContext : ISpDataContext
  {
    internal TContext Context { get; set; }
    public string ListTitle { get; }
    public string ListUrl { get; }
    public Guid ListId { get; }
    public string Query { get; set; }
    public int BatchSize { get; set; }
    public bool IncludeItemPermissions { get; set; }
    public ViewScope ViewScope { get; set; }
    internal Dictionary<string, FieldAttribute> FieldMappings { get; }
    internal bool SkipResult { get; set; }
    internal bool IsAsync { get; set; }
    internal string FolderUrl { get; set; }
    public Action OnExecute { get; set; }

    internal bool IsPaged { get; set; }

    internal string PagingInfo { get; set; }

    internal SpQueryArgs(string listTitle, string listUrl, Guid listId, string query)
    {
      ListTitle = listTitle;
      ListUrl = listUrl;
      ListId = listId;
      Query = query;
      FieldMappings = new Dictionary<string, FieldAttribute>();
      BatchSize = 100;
      IncludeItemPermissions = true;
      ViewScope = ViewScope.RecursiveAll;
    }

    internal SpQueryArgs(TContext context, string listTitle, string listUrl, Guid listId, string query)
      : this(listTitle, listUrl, listId, query)
    {
      Context = context;
    }

    public override string ToString()
    {
      if (!string.IsNullOrWhiteSpace(ListTitle)) return ListTitle;
      if (!string.IsNullOrWhiteSpace(ListUrl)) return ListUrl;
      if (ListId != default) return ListId.ToString();
      return base.ToString();
    }

    public object Clone()
    {
      return this.MemberwiseClone();
    }
  }
}
