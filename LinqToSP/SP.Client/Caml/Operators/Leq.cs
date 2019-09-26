using System;
using System.Xml.Linq;
using Microsoft.SharePoint.Client;

namespace SP.Client.Caml.Operators
{
    public sealed class Leq : Leq<object>
    {
        public Leq(CamlFieldRef fieldRef, CamlValue<object> value) : base(fieldRef, value)
        {
        }

        public Leq(CamlFieldRef fieldRef, object value, FieldType type)
            : base(fieldRef, value, type)
        {
        }

        public Leq(Guid fieldId, object value, FieldType type)
            : base(fieldId, value, type)
        {
        }

        public Leq(string fieldName, object value, FieldType type)
            : base(fieldName, value, type)
        {
        }

        public Leq(string existingLeqOperator) : base(existingLeqOperator)
        {
        }

        public Leq(XElement existingLeqOperator) : base(existingLeqOperator)
        {
        }
    }

    public class Leq<T> : FieldValueOperator<T>
    {
        internal const string LeqTag = "Leq";

        public Leq(CamlFieldRef fieldRef, CamlValue<T> value)
            : base(LeqTag, fieldRef, value)
        {
        }

        public Leq(CamlFieldRef fieldRef, T value, FieldType type)
            : base(LeqTag, fieldRef, value, type)
        {
        }

        public Leq(Guid fieldId, T value, FieldType type)
            : base(LeqTag, fieldId, value, type)
        {
        }

        public Leq(string fieldName, T value, FieldType type)
            : base(LeqTag, fieldName, value, type)
        {
        }

        public Leq(string existingLeqOperator)
            : base(LeqTag, existingLeqOperator)
        {
        }

        public Leq(XElement existingLeqOperator)
            : base(LeqTag, existingLeqOperator)
        {
        }
    }
}