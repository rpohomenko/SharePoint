using System;
using System.Xml.Linq;
using Microsoft.SharePoint.Client;

namespace SP.Client.Caml.Operators
{
    public sealed class Neq : Neq<object>
    {
        public Neq(CamlFieldRef fieldRef, CamlValue<object> value) : base(fieldRef, value)
        {
        }

        public Neq(CamlFieldRef fieldRef, object value, FieldType type)
            : base(fieldRef, value, type)
        {
        }

        public Neq(Guid fieldId, object value, FieldType type)
            : base(fieldId, value, type)
        {
        }

        public Neq(string fieldName, object value, FieldType type)
            : base(fieldName, value, type)
        {
        }

        public Neq(string existingNeqOperator) : base(existingNeqOperator)
        {
        }

        public Neq(XElement existingNeqOperator) : base(existingNeqOperator)
        {
        }
    }

    public class Neq<T> : FieldValueOperator<T>
    {
        internal const string NeqTag = "Neq";

        public Neq(CamlFieldRef fieldRef, CamlValue<T> value)
            : base(NeqTag, fieldRef, value)
        {
        }

        public Neq(CamlFieldRef fieldRef, T value, FieldType type)
            : base(NeqTag, fieldRef, value, type)
        {
        }

        public Neq(Guid fieldId, T value, FieldType type)
            : base(NeqTag, fieldId, value, type)
        {
        }

        public Neq(string fieldName, T value, FieldType type)
            : base(NeqTag, fieldName, value, type)
        {
        }

        public Neq(string existingNeqOperator)
            : base(NeqTag, existingNeqOperator)
        {
        }

        public Neq(XElement existingNeqOperator)
            : base(NeqTag, existingNeqOperator)
        {
        }
    }
}