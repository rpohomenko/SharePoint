using SP.Client.Linq.Attributes;
using System;
using System.Collections.Generic;

namespace SP.Client.Linq.Query
{
    public class SpQueryArgs<TContext>
        where TContext : ISpDataContext
    {
        internal TContext Context { get; set; }
        public string ListTitle { get; }
        public string ListUrl { get; }
        public Guid ListId { get; }
        public string Query { get; set; }
        public int BatchSize { get; set; }
        public bool IncludeItemPermissions { get; set; }
        internal Dictionary<string, FieldAttribute> FieldMappings { get; }
        internal bool SkipResult { get; set; }
        internal bool IsAsync { get; set; }

        public SpQueryArgs(string listTitle, string listUrl, Guid listId, string query)
        {
            ListTitle = listTitle;
            ListUrl = listUrl;
            ListId = listId;
            Query = query;
            FieldMappings = new Dictionary<string, FieldAttribute>();
            BatchSize = 100;
            IncludeItemPermissions = true;
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
    }
}
