using System;
using System.Xml.Linq;

namespace SP.Client.Caml.Operators
{
    public sealed class IsNull : FieldOperator
    {
        internal const string IsNullTag = "IsNull";

        public IsNull(CamlFieldRef fieldRef)
            : base(IsNullTag, fieldRef)
        {
        }

        public IsNull(Guid fieldId)
            : base(IsNullTag, new CamlFieldRef {Id = fieldId})
        {
        }

        public IsNull(string fieldName)
            : base(IsNullTag, new CamlFieldRef {Name = fieldName})
        {
        }

        public IsNull(XElement existingIsNullOperator)
            : base(IsNullTag, existingIsNullOperator)
        {
        }
    }
}