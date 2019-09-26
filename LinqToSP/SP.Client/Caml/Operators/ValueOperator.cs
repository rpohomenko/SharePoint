using System;
using System.Xml.Linq;
using SP.Client.Caml.Interfaces;
using Microsoft.SharePoint.Client;

namespace SP.Client.Caml.Operators
{
    public abstract class ValueOperator<T> : ComparisonOperator, ICamlValue<T>
    {
        protected ValueOperator(string operatorName, CamlValue<T> value)
            : base(operatorName)
        {
            if (value == null) throw new ArgumentNullException("value");
            Value = value;
        }

        protected ValueOperator(string operatorName, T value, FieldType type)
            : base(operatorName)
        {
            if (value is CamlValue<T>)
            {
                Value = value as CamlValue<T>;
            }
            else
            {
                Value = new CamlValue<T>(value, type);
            }
        }

        protected ValueOperator(string operatorName, string existingValueOperator)
            : base(operatorName, existingValueOperator)
        {
        }

        protected ValueOperator(string operatorName, XElement existingValueOperator)
            : base(operatorName, existingValueOperator)
        {
        }

        public CamlValue<T> Value { get; private set; }

        public override XElement ToXElement()
        {
            var el = base.ToXElement();
            if (Value != null) el.Add(Value.ToXElement());
            return el;
        }

        protected override void OnParsing(XElement existingValueOperator)
        {
            Value = new CamlValue<T>(existingValueOperator);
        }
    }
}