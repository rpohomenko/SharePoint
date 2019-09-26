using System;
using System.Xml.Linq;
using Microsoft.SharePoint.Client;

namespace SP.Client.Caml.Operators
{
    public sealed class BeginsWith : BeginsWith<string>
    {
        public BeginsWith(CamlFieldRef fieldRef, CamlValue value)
            : base(fieldRef, value)
        {
        }
        public BeginsWith(CamlFieldRef fieldRef, CamlValue<string> value)
            : base(fieldRef, value)
        {
        }

        public BeginsWith(CamlFieldRef fieldRef, string value)
            : base(fieldRef, value, FieldType.Text)
        {
        }

        public BeginsWith(Guid fieldId, string value)
            : base(fieldId, value, FieldType.Text)
        {
        }

        public BeginsWith(string fieldName, string value)
            : base(fieldName, value, FieldType.Text)
        {
        }

        public BeginsWith(string existingBeginsWithOperator)
            : base(existingBeginsWithOperator)
        {
        }

        public BeginsWith(XElement existingBeginsWithOperator)
            : base(existingBeginsWithOperator)
        {
        }
    }

    public class BeginsWith<T> : FieldValueOperator<T>
    {
        internal const string BeginsWithTag = "BeginsWith";
        public BeginsWith(CamlFieldRef fieldRef, CamlValue<T> value)
            : base(BeginsWithTag, fieldRef, value)
        {
        }

        public BeginsWith(CamlFieldRef fieldRef, CamlValue value)
          : base(BeginsWithTag, fieldRef, (T)value.Value, value.Type)
        {
        }

        public BeginsWith(CamlFieldRef fieldRef, T value, FieldType type)
            : base(BeginsWithTag, fieldRef, value, type)
        {
        }

        public BeginsWith(Guid fieldId, T value, FieldType type)
            : base(BeginsWithTag, fieldId, value, type)
        {
        }

        public BeginsWith(string fieldName, T value, FieldType type)
            : base(BeginsWithTag, fieldName, value, type)
        {
        }

        public BeginsWith(string existingLtOperator)
            : base(BeginsWithTag, existingLtOperator)
        {
        }

        public BeginsWith(XElement existingLtOperator)
            : base(BeginsWithTag, existingLtOperator)
        {
        }
    }
}