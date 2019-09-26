using System;
using System.Xml.Linq;
using Microsoft.SharePoint.Client;

namespace SP.Client.Caml.Operators
{
    public sealed class Gt : Gt<object>
    {
        public Gt(CamlFieldRef fieldRef, CamlValue<object> value) : base(fieldRef, value)
        {
        }

        public Gt(CamlFieldRef fieldRef, object value, FieldType type)
            : base(fieldRef, value, type)
        {
        }

        public Gt(Guid fieldId, object value, FieldType type)
            : base(fieldId, value, type)
        {
        }

        public Gt(string fieldName, object value, FieldType type)
            : base(fieldName, value, type)
        {
        }

        public Gt(string existingGtOperator) : base(existingGtOperator)
        {
        }

        public Gt(XElement existingGtOperator) : base(existingGtOperator)
        {
        }
    }

    public class Gt<T> : FieldValueOperator<T>
    {
        internal const string GtTag = "Gt";

        public Gt(CamlFieldRef fieldRef, CamlValue<T> value)
            : base(GtTag, fieldRef, value)
        {
        }

        public Gt(CamlFieldRef fieldRef, T value, FieldType type)
            : base(GtTag, fieldRef, value, type)
        {
        }

        public Gt(Guid fieldId, T value, FieldType type)
            : base(GtTag, fieldId, value, type)
        {
        }

        public Gt(string fieldName, T value, FieldType type)
            : base(GtTag, fieldName, value, type)
        {
        }

        public Gt(string existingGtOperator)
            : base(GtTag, existingGtOperator)
        {
        }

        public Gt(XElement existingGtOperator)
            : base(GtTag, existingGtOperator)
        {
        }
    }
}