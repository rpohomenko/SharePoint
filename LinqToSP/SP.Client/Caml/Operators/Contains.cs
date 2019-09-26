using System;
using System.Xml.Linq;
using Microsoft.SharePoint.Client;

namespace SP.Client.Caml.Operators
{
    public sealed class Contains : Contains<string>
    {
        public Contains(CamlFieldRef fieldRef, CamlValue<string> value)
            : base(fieldRef, value)
        {
        }

        public Contains(CamlFieldRef fieldRef, CamlValue value)
            : base(fieldRef, value)
        {
        }

        public Contains(CamlFieldRef fieldRef, string value)
            : base(fieldRef, value, FieldType.Text)
        {
        }

        public Contains(Guid fieldId, string value)
            : base(fieldId, value, FieldType.Text)
        {
        }

        public Contains(string fieldName, string value)
            : base(fieldName, value, FieldType.Text)
        {
        }

        public Contains(string existingGtOperator)
            : base(existingGtOperator)
        {
        }

        public Contains(XElement existingGtOperator)
            : base(existingGtOperator)
        {
        }
    }

    public class Contains<T> : FieldValueOperator<T>
    {
        internal const string ContainsTag = "Contains";

        public Contains(CamlFieldRef fieldRef, CamlValue value)
           : base(ContainsTag, fieldRef, (T)value.Value, value.Type)
        {
        }

        public Contains(CamlFieldRef fieldRef, CamlValue<T> value)
            : base(ContainsTag, fieldRef, value)
        {
        }

        public Contains(CamlFieldRef fieldRef, T value, FieldType type)
            : base(ContainsTag, fieldRef, value, type)
        {
        }

        public Contains(Guid fieldId, T value, FieldType type)
            : base(ContainsTag, fieldId, value, type)
        {
        }

        public Contains(string fieldName, T value, FieldType type)
            : base(ContainsTag, fieldName, value, type)
        {
        }

        public Contains(string existingContainsOperator)
            : base(ContainsTag, existingContainsOperator)
        {
        }

        public Contains(XElement existingContainsOperator)
            : base(ContainsTag, existingContainsOperator)
        {
        }
    }
}