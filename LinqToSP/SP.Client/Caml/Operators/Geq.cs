using System;
using System.Xml.Linq;
using Microsoft.SharePoint.Client;

namespace SP.Client.Caml.Operators
{
    public sealed class Geq : Geq<object>
    {
        public Geq(CamlFieldRef fieldRef, CamlValue<object> value) : base(fieldRef, value)
        {
        }

        public Geq(CamlFieldRef fieldRef, object value, FieldType type)
            : base(fieldRef, value, type)
        {
        }

        public Geq(Guid fieldId, object value, FieldType type)
            : base(fieldId, value, type)
        {
        }

        public Geq(string fieldName, object value, FieldType type)
            : base(fieldName, value, type)
        {
        }

        public Geq(string existingGeqOperator) : base(existingGeqOperator)
        {
        }

        public Geq(XElement existingGeqOperator) : base(existingGeqOperator)
        {
        }
    }

    public class Geq<T> : FieldValueOperator<T>
    {
        internal const string GeqTag = "Geq";

        public Geq(CamlFieldRef fieldRef, CamlValue<T> value)
            : base(GeqTag, fieldRef, value)
        {
        }

        public Geq(CamlFieldRef fieldRef, T value, FieldType type)
            : base(GeqTag, fieldRef, value, type)
        {
        }

        public Geq(Guid fieldId, T value, FieldType type)
            : base(GeqTag, fieldId, value, type)
        {
        }

        public Geq(string fieldName, T value, FieldType type)
            : base(GeqTag, fieldName, value, type)
        {
        }

        public Geq(string existingGeqOperator)
            : base(GeqTag, existingGeqOperator)
        {
        }

        public Geq(XElement existingGeqOperator)
            : base(GeqTag, existingGeqOperator)
        {
        }
    }
}