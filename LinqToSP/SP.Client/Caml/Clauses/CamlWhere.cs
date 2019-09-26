using System;
using System.Linq;
using System.Xml.Linq;
using SP.Client.Caml.Operators;

namespace SP.Client.Caml.Clauses
{
    public sealed class CamlWhere : CamlClause
    {
        internal const string WhereTag = "Where";

        public CamlWhere(Operator op)
            : base(WhereTag)
        {
            if (op == null) throw new ArgumentNullException("op");
            Operator = op;
        }

        public CamlWhere(string existingWhere)
            : base(WhereTag, existingWhere)
        {
        }

        public CamlWhere(XElement existingWhere)
            : base(WhereTag, existingWhere)
        {
        }

        internal Operator Operator { get; private set; }

        protected override void OnParsing(XElement existingWhere)
        {
            Operator = existingWhere.Elements().Select(Operator.GetOperator).FirstOrDefault(op => op != null);
        }

        public override XElement ToXElement()
        {
            var el = base.ToXElement();
            if (Operator != null)
            {
                el.Add(Operator.ToXElement());
            }
            return el;
        }
    }
}