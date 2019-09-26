using System;
using System.Xml.Linq;

namespace SP.Client.Caml.Clauses
{
    public abstract class CamlClause : CamlElement
    {
        protected CamlClause(string elementName)
            : base(elementName)
        {
        }

        protected CamlClause(string elementName, string existingElement)
            : base(elementName, existingElement)
        {
        }

        protected CamlClause(string elementName, XElement existingElement)
            : base(elementName, existingElement)
        {
        }

        internal static CamlClause GetClause(XElement existingClause)
        {
            var tag = existingClause.Name.LocalName;
            if (string.Equals(tag, CamlWhere.WhereTag, StringComparison.OrdinalIgnoreCase))
            {
                return new CamlWhere(existingClause);
            }
            if (string.Equals(tag, CamlOrderBy.OrderByTag, StringComparison.OrdinalIgnoreCase))
            {
                return new CamlOrderBy(existingClause);
            }
            if (string.Equals(tag, CamlGroupBy.GroupByTag, StringComparison.OrdinalIgnoreCase))
            {
                return new CamlGroupBy(existingClause);
            }
            throw new NotSupportedException("tag");
        }
    }
}
