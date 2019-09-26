using SP.Client.Extensions;
using System;
using System.Xml.Linq;

namespace SP.Client.Caml
{
    public sealed class CamlRowLimit : CamlElement
    {
        internal const string RowLimitTag = "RowLimit";
        internal const string PagedAttr = "Paged";

        public CamlRowLimit(int limit = 0, bool? paged = null)
            : base(RowLimitTag)
        {
            Limit = limit;
            Paged = paged;
        }

        public CamlRowLimit(string existingFieldRef)
            : base(RowLimitTag, existingFieldRef)
        {
        }

        public CamlRowLimit(XElement existingFieldRef)
            : base(RowLimitTag, existingFieldRef)
        {
        }

        public bool? Paged { get; set; }

        public int Limit { get; set; }

        protected override void OnParsing(XElement existingRowLimit)
        {
            var paged = existingRowLimit.AttributeIgnoreCase(PagedAttr);
            if (paged != null)
            {
                Paged = Convert.ToBoolean(paged.Value);
            }
            Limit = Convert.ToInt32(existingRowLimit.Value);
        }

        public override XElement ToXElement()
        {
            var el = new XElement(RowLimitTag);
            if (Paged.HasValue)
            {
                el.Add(new XAttribute(PagedAttr, Paged.Value));
            }
            el.Add(Limit);
            return el;
        }

        public override string ToString()
        {
            return ToXElement().ToString();
        }
    }
}