using System;
using System.Xml.Linq;
using Microsoft.SharePoint.Client;

namespace SP.Client.Caml.Operators
{
    public sealed class NotIncludes : NotIncludes<object>
    {
        public NotIncludes(CamlFieldRef fieldRef, CamlValue<object> value) : base(fieldRef, value)
        {
        }

        public NotIncludes(CamlFieldRef fieldRef, object value, FieldType type)
            : base(fieldRef, value, type)
        {
        }

        public NotIncludes(Guid fieldId, object value, FieldType type)
            : base(fieldId, value, type)
        {
        }

        public NotIncludes(string fieldName, object value, FieldType type)
            : base(fieldName, value, type)
        {
        }

        public NotIncludes(string existingNotIncludesOperator) : base(existingNotIncludesOperator)
        {
        }

        public NotIncludes(XElement existingNotIncludesOperator) : base(existingNotIncludesOperator)
        {
        }
    }

    public class NotIncludes<T> : FieldValueOperator<T>
    {
        internal const string NotIncludesTag = "NotIncludes";

        public NotIncludes(CamlFieldRef fieldRef, CamlValue<T> value)
            : base(NotIncludesTag, fieldRef, value)
        {
        }

        public NotIncludes(CamlFieldRef fieldRef, T value, FieldType type)
            : base(NotIncludesTag, fieldRef, value, type)
        {
        }

        public NotIncludes(Guid fieldId, T value, FieldType type)
            : base(NotIncludesTag, fieldId, value, type)
        {
        }

        public NotIncludes(string fieldName, T value, FieldType type)
            : base(NotIncludesTag, fieldName, value, type)
        {
        }

        public NotIncludes(string existingNotIncludesOperator)
            : base(NotIncludesTag, existingNotIncludesOperator)
        {
        }

        public NotIncludes(XElement existingNotIncludesOperator)
            : base(NotIncludesTag, existingNotIncludesOperator)
        {
        }
    }
}