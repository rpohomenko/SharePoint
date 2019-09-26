using System;
using System.Xml.Linq;
using SP.Client.Caml.Interfaces;
using SP.Client.Extensions;

namespace SP.Client.Caml.Operators
{
    public abstract class FieldOperator : ComparisonOperator, ICamlField
    {
        protected FieldOperator(string operatorName, CamlFieldRef fieldRef)
            : base(operatorName)
        {
            if (fieldRef == null) throw new ArgumentNullException("fieldRef");
            FieldRef = fieldRef;
        }

        protected FieldOperator(string operatorName, string existingFieldOperator)
            : base(operatorName, existingFieldOperator)
        {
        }

        protected FieldOperator(string operatorName, XElement existingFieldOperator)
            : base(operatorName, existingFieldOperator)
        {
        }

        public CamlFieldRef FieldRef { get; private set; }

        public override XElement ToXElement()
        {
            var el = base.ToXElement();
            el.AddFirst(FieldRef.ToXElement());
            return el;
        }

        protected override void OnParsing(XElement existingFieldValueOperator)
        {
            var existingFieldRef = existingFieldValueOperator.ElementIgnoreCase(CamlFieldRef.FieldRefTag);
            if (existingFieldRef != null)
            {
                FieldRef = new CamlFieldRef(existingFieldRef);
            }
        }
    }
}