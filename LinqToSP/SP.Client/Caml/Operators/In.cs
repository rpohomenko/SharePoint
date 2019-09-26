using System;
using System.Collections.Generic;
using System.Xml.Linq;
using Microsoft.SharePoint.Client;

namespace SP.Client.Caml.Operators
{
    public sealed class In : In<object>
    {
        public In(Guid fieldId, IEnumerable<CamlValue<object>> values) : base(fieldId, values)
        {
        }

        public In(Guid fieldId, IEnumerable<object> values, FieldType type)
            : base(fieldId, values, type)
        {
        }

        public In(string fieldName, IEnumerable<object> values, FieldType type)
            : base(fieldName, values, type)
        {
        }

        public In(string fieldName, IEnumerable<CamlValue<object>> values) : base(fieldName, values)
        {
        }

        public In(CamlFieldRef fieldRef, IEnumerable<object> values, FieldType type)
            : base(fieldRef, values, type)
        {
        }

        public In(CamlFieldRef fieldRef, IEnumerable<CamlValue<object>> values) : base(fieldRef, values)
        {
        }

        public In(string existingInOperator) : base(existingInOperator)
        {
        }

        public In(XElement existingInOperator) : base(existingInOperator)
        {
        }
    }

    public class In<T> : FieldCamlMultiValue<T>
    {
        internal const string InTag = "In";

        public In(Guid fieldId, IEnumerable<CamlValue<T>> values)
            : base(InTag, fieldId, values)
        {
        }

        public In(Guid fieldId, IEnumerable<T> values, FieldType type)
            : base(InTag, fieldId, values, type)
        {
        }

        public In(string fieldName, IEnumerable<T> values, FieldType type)
            : base(InTag, fieldName, values, type)
        {
        }

        public In(string fieldName, IEnumerable<CamlValue<T>> values)
            : base(InTag, fieldName, values)
        {
        }

        public In(CamlFieldRef fieldRef, IEnumerable<T> values, FieldType type)
            : base(InTag, fieldRef, values, type)
        {
        }

        public In(CamlFieldRef fieldRef, IEnumerable<CamlValue<T>> values)
            : base(InTag, fieldRef, values)
        {
        }

        public In(string existingInOperator)
            : base(InTag, existingInOperator)
        {
        }

        public In(XElement existingInOperator)
            : base(InTag, existingInOperator)
        {
        }
    }
}