using System;
using System.Xml.Linq;
using Microsoft.SharePoint.Client;

namespace SP.Client.Caml.Operators
{
    public sealed class Includes : Includes<object>
    {
        public Includes(CamlFieldRef fieldRef, CamlValue<object> value) : base(fieldRef, value)
        {
        }

        public Includes(CamlFieldRef fieldRef, object value, FieldType type)
            : base(fieldRef, value, type)
        {
        }

        public Includes(Guid fieldId, object value, FieldType type)
            : base(fieldId, value, type)
        {
        }

        public Includes(string fieldName, object value, FieldType type)
            : base(fieldName, value, type)
        {
        }

        public Includes(string existingIncludesOperator) : base(existingIncludesOperator)
        {
        }

        public Includes(XElement existingIncludesOperator) : base(existingIncludesOperator)
        {
        }
    }

    public class Includes<T> : FieldValueOperator<T>
    {
        internal const string IncludesTag = "Includes";

        public Includes(CamlFieldRef fieldRef, CamlValue<T> value)
            : base(IncludesTag, fieldRef, value)
        {
        }

        public Includes(CamlFieldRef fieldRef, T value, FieldType type)
            : base(IncludesTag, fieldRef, value, type)
        {
        }

        public Includes(Guid fieldId, T value, FieldType type)
            : base(IncludesTag, fieldId, value, type)
        {
        }

        public Includes(string fieldName, T value, FieldType type)
            : base(IncludesTag, fieldName, value, type)
        {
        }

        public Includes(string existingIncludesOperator)
            : base(IncludesTag, existingIncludesOperator)
        {
        }

        public Includes(XElement existingIncludesOperator)
            : base(IncludesTag, existingIncludesOperator)
        {
        }
    }
}