using System;
using System.Xml.Linq;
using Microsoft.SharePoint.Client;

namespace SP.Client.Caml.Operators
{
    public sealed class Eq : Eq<object>
    {
        public Eq(CamlFieldRef fieldRef, CamlValue<object> value) : base(fieldRef, value)
        {
        }

        public Eq(CamlFieldRef fieldRef, object value, FieldType type)
            : base(fieldRef, value, type)
        {
        }

        public Eq(Guid fieldId, object value, FieldType type)
            : base(fieldId, value, type)
        {
        }

        public Eq(string fieldName, object value, FieldType type)
            : base(fieldName, value, type)
        {
        }

        public Eq(string existingEqOperator) : base(existingEqOperator)
        {
        }

        public Eq(XElement existingEqOperator) : base(existingEqOperator)
        {
        }
    }

    public class Eq<T> : FieldValueOperator<T>
    {
        internal const string EqTag = "Eq";

        public Eq(CamlFieldRef fieldRef, CamlValue<T> value)
            : base(EqTag, fieldRef, value)
        {
        }

        public Eq(CamlFieldRef fieldRef, T value, FieldType type)
            : base(EqTag, fieldRef, value, type)
        {
        }

        public Eq(Guid fieldId, T value, FieldType type)
            : base(EqTag, fieldId, value, type)
        {
        }

        public Eq(string fieldName, T value, FieldType type)
            : base(EqTag, fieldName, value, type)
        {
        }

        public Eq(string existingEqOperator)
            : base(EqTag, existingEqOperator)
        {
        }

        public Eq(XElement existingEqOperator)
            : base(EqTag, existingEqOperator)
        {
        }
    }
}