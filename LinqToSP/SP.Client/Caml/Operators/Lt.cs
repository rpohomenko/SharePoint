using System;
using System.Xml.Linq;
using Microsoft.SharePoint.Client;

namespace SP.Client.Caml.Operators
{
    public sealed class Lt : Lt<object>
    {
        public Lt(CamlFieldRef fieldRef, CamlValue<object> value) : base(fieldRef, value)
        {
        }

        public Lt(CamlFieldRef fieldRef, object value, FieldType type)
            : base(fieldRef, value, type)
        {
        }

        public Lt(Guid fieldId, object value, FieldType type)
            : base(fieldId, value, type)
        {
        }

        public Lt(string fieldName, object value, FieldType type)
            : base(fieldName, value, type)
        {
        }

        public Lt(string existingLtOperator) : base(existingLtOperator)
        {
        }

        public Lt(XElement existingLtOperator) : base(existingLtOperator)
        {
        }
    }

    public class Lt<T> : FieldValueOperator<T>
    {
        internal const string LtTag = "Lt";

        public Lt(CamlFieldRef fieldRef, CamlValue<T> value)
            : base(LtTag, fieldRef, value)
        {
        }

        public Lt(CamlFieldRef fieldRef, T value, FieldType type)
            : base(LtTag, fieldRef, value, type)
        {
        }

        public Lt(Guid fieldId, T value, FieldType type)
            : base(LtTag, fieldId, value, type)
        {
        }

        public Lt(string fieldName, T value, FieldType type)
            : base(LtTag, fieldName, value, type)
        {
        }

        public Lt(string existingLtOperator)
            : base(LtTag, existingLtOperator)
        {
        }

        public Lt(XElement existingLtOperator)
            : base(LtTag, existingLtOperator)
        {
        }
    }
}