using System;
using System.Linq;
using System.Xml.Linq;
using SP.Client.Caml.Clauses;

namespace SP.Client.Caml
{
    public sealed class Query : CamlElement
    {
        internal const string QueryTag = "Query";

        public Query() : base(QueryTag)
        {
        }

        public Query(string existingQuery) : base(QueryTag, existingQuery)
        {
        }

        public Query(XElement existingQuery) : base(QueryTag, existingQuery)
        {
        }

        public CamlWhere Where { get; set; }
        public CamlOrderBy OrderBy { get; set; }
        public CamlGroupBy GroupBy { get; set; }

        protected override void OnParsing(XElement existingQuery)
        {
            var existingClauses = existingQuery.Elements().Select(CamlClause.GetClause).ToList();
            Where = existingClauses.OfType<CamlWhere>().FirstOrDefault();
            OrderBy = existingClauses.OfType<CamlOrderBy>().FirstOrDefault();
            GroupBy = existingClauses.OfType<CamlGroupBy>().FirstOrDefault();
        }

        public override XElement ToXElement()
        {
            var el = base.ToXElement();
            if (Where != null)
            {
                el.Add(Where.ToXElement());
            }
            if (OrderBy != null)
            {
                el.Add(OrderBy.ToXElement());
            }
            if (GroupBy != null)
            {
                el.Add(GroupBy.ToXElement());
            }
            return el;
        }

        public static Query GetQuery(View view)
        {
            if (view == null) throw new ArgumentNullException("view");
            return new Query(string.Format("<{0}>{1}</{0}>", QueryTag, view.Query));
        }
    }
}