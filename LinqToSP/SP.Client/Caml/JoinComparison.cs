using System;
using System.Collections.Generic;
using System.Linq;
using System.Xml.Linq;
using SP.Client.Caml.Interfaces;

namespace SP.Client.Caml
{
    internal sealed class EqJoinComparison : JoinComparison
    {
        internal const string EqTag = "Eq";

        public EqJoinComparison(IEnumerable<CamlFieldRef> fieldRefs) : base(EqTag, fieldRefs)
        {
        }

        public EqJoinComparison(string existingElement) : base(EqTag, existingElement)
        {
        }

        public EqJoinComparison(XElement existingElement) : base(EqTag, existingElement)
        {
        }
    }

    internal abstract class JoinComparison : CamlElement, ICamlMultiField
    {
        protected JoinComparison(string elementName, IEnumerable<CamlFieldRef> fieldRefs) : base(elementName)
        {
            if (fieldRefs == null) throw new ArgumentNullException("fieldRefs");
            FieldRefs = fieldRefs;
        }

        protected JoinComparison(string elementName, string existingElement) : base(elementName, existingElement)
        {
        }

        protected JoinComparison(string elementName, XElement existingElement) : base(elementName, existingElement)
        {
        }

        public IEnumerable<CamlFieldRef> FieldRefs { get; private set; }

        public override XElement ToXElement()
        {
            var el = base.ToXElement();
            if (FieldRefs != null)
            {
                foreach (var fieldRef in FieldRefs)
                {
                    el.Add(fieldRef.ToXElement());
                }
            }
            return el;
        }

        protected override void OnParsing(XElement existingElement)
        {
            FieldRefs = existingElement.Elements().Select(el => new CamlFieldRef(el));
        }

        public static JoinComparison GetComparison(XElement existingComparison)
        {
            var tag = existingComparison.Name.LocalName;
            if (string.Equals(tag, EqJoinComparison.EqTag, StringComparison.OrdinalIgnoreCase))
            {
                return new EqJoinComparison(existingComparison);
            }
            throw new NotSupportedException("tag");
        }
    }
}