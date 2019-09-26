using System;
using System.Xml.Linq;
using SP.Client.Caml.Interfaces;
using Microsoft.SharePoint.Client;
using SP.Client.Extensions;

namespace SP.Client.Caml.Operators
{
    public abstract class FieldValueOperator<T> : ValueOperator<T>, ICamlField
    {
        protected FieldValueOperator(string operatorName, CamlFieldRef fieldRef, CamlValue value)
          : base(operatorName, value)
        {
            FieldRef = fieldRef;
        }

        protected FieldValueOperator(string operatorName, CamlFieldRef fieldRef, CamlValue<T> value)
            : base(operatorName, value)
        {
            FieldRef = fieldRef;
        }

        protected FieldValueOperator(string operatorName, CamlFieldRef fieldRef, T value, FieldType type)
            : base(operatorName, value, type)
        {
            FieldRef = fieldRef;
        }

        protected FieldValueOperator(string operatorName, Guid fieldId, CamlValue<T> value)
            : base(operatorName, value)
        {
            FieldRef = new CamlFieldRef {Id = fieldId};
        }

        protected FieldValueOperator(string operatorName, Guid fieldId, T value, FieldType type)
            : base(operatorName, value, type)
        {
            FieldRef = new CamlFieldRef {Id = fieldId};
        }

        protected FieldValueOperator(string operatorName, string fieldName, CamlValue<T> value)
            : base(operatorName, value)
        {
            FieldRef = new CamlFieldRef {Name = fieldName};
        }

        protected FieldValueOperator(string operatorName, string fieldName, T value, FieldType type)
            : base(operatorName, value, type)
        {
            FieldRef = new CamlFieldRef {Name = fieldName};
        }

        protected FieldValueOperator(string operatorName, string existingSingleFieldValueOperator)
            : base(operatorName, existingSingleFieldValueOperator)
        {
        }

        protected FieldValueOperator(string operatorName, XElement existingSingleFieldValueOperator)
            : base(operatorName, existingSingleFieldValueOperator)
        {
        }

        public CamlFieldRef FieldRef { get; private set; }

        public override XElement ToXElement()
        {
            var el = base.ToXElement();
            if (FieldRef != null) el.AddFirst(FieldRef.ToXElement());
            return el;
        }

        protected override void OnParsing(XElement existingSingleFieldValueOperator)
        {
            var existingValue = existingSingleFieldValueOperator.ElementIgnoreCase(CamlValue.ValueTag);
            if (existingValue != null)
            {
                base.OnParsing(existingValue);
            }
            var existingFieldRef = existingSingleFieldValueOperator.ElementIgnoreCase(CamlFieldRef.FieldRefTag);
            if (existingFieldRef != null)
            {
                FieldRef = new CamlFieldRef(existingFieldRef);
            }
        }
    }
}