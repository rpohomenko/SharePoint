using SP.Client.Extensions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Xml.Linq;

namespace SP.Client.Caml
{
    public sealed class LeftJoin : Join
    {
        internal const string Left = "LEFT";

        public LeftJoin(string fieldName, string primaryListAlias, string listAlias)
            : base(fieldName, primaryListAlias, listAlias)
        {
        }

        public LeftJoin(string fieldName, string listAlias) : base(fieldName, null, listAlias)
        {
        }

        public LeftJoin(string existingElement) : base(existingElement)
        {
        }

        public LeftJoin(XElement existingElement) : base(existingElement)
        {
        }

        public override XElement ToXElement()
        {
            var el = base.ToXElement();
            el.ReplaceAttributes(new XAttribute(TypeAttr, Left), el.Attributes());
            return el;
        }
    }

    public sealed class InnerJoin : Join
    {
        internal const string Inner = "INNER";

        public InnerJoin(string fieldName, string primaryListAlias, string listAlias)
            : base(fieldName, primaryListAlias, listAlias)
        {
        }

        public InnerJoin(string fieldName, string listAlias) : base(fieldName, null, listAlias)
        {
        }

        public InnerJoin(string existingElement) : base(existingElement)
        {
        }

        public InnerJoin(XElement existingElement) : base(existingElement)
        {
        }

        public override XElement ToXElement()
        {
            var el = base.ToXElement();
            el.ReplaceAttributes(new XAttribute(TypeAttr, Inner), el.Attributes());
            return el;
        }
    }

    public abstract class Join : CamlElement
    {
        internal const string JoinTag = "Join";
        internal const string TypeAttr = "Type";
        internal const string ListAliasAttr = "ListAlias";

        protected Join(string fieldName, string primaryListAlias, string listAlias) : base(JoinTag)
        {
            if (string.IsNullOrWhiteSpace(listAlias)) throw new ArgumentNullException("listAlias");
            if (string.IsNullOrWhiteSpace(fieldName)) throw new ArgumentNullException("fieldName");
            ListAlias = listAlias;
            JoinComparison = new EqJoinComparison(new[]
            {
                new CamlFieldRef
                {
                    List = !string.IsNullOrWhiteSpace(primaryListAlias) ? primaryListAlias : null,
                    Name = fieldName,
                    RefType = "Id"
                },
                new CamlFieldRef
                {
                    List = ListAlias,
                    Name = "ID"
                }
            });
        }

        protected Join(string existingElement) : base(JoinTag, existingElement)
        {
        }

        protected Join(XElement existingElement) : base(JoinTag, existingElement)
        {
        }

        internal JoinComparison JoinComparison { get; private set; }
        public string ListAlias { get; private set; }

        protected override void OnParsing(XElement existingElement)
        {
            var listAlias = existingElement.AttributeIgnoreCase(ListAliasAttr);
            if (listAlias != null)
            {
                ListAlias = listAlias.Value;
            }
            JoinComparison = existingElement.Elements().Select(JoinComparison.GetComparison).FirstOrDefault();
        }

        public override XElement ToXElement()
        {
            var el = base.ToXElement();
            if (!string.IsNullOrWhiteSpace(ListAlias))
            {
                el.Add(new XAttribute(ListAliasAttr, ListAlias));
            }
            if (JoinComparison != null)
            {
                el.Add(JoinComparison.ToXElement());
            }
            return el;
        }

        public static Join GetJoin(XElement existingJoin)
        {
            if (existingJoin == null) throw new ArgumentNullException("existingJoin");
            var tag = existingJoin.Name.LocalName;
            if (string.Equals(tag, JoinTag, StringComparison.OrdinalIgnoreCase))
            {
                var type = existingJoin.AttributeIgnoreCase(TypeAttr);
                var typeValue = type.Value.Trim();
                if (string.Equals(typeValue, Caml.LeftJoin.Left))
                {
                    return new LeftJoin(existingJoin);
                }
                if (string.Equals(typeValue, Caml.InnerJoin.Inner))
                {
                    return new InnerJoin(existingJoin);
                }
            }
            throw new NotSupportedException("tag");
        }

        public IEnumerable<Join> InnerJoin(string fieldName, string listAlias)
        {
            yield return this;
            yield return new InnerJoin(fieldName, ListAlias, listAlias);
        }

        public IEnumerable<Join> LeftJoin(string fieldName, string listAlias)
        {
            yield return this;
            yield return new LeftJoin(fieldName, ListAlias, listAlias);
        }
    }
}