using System;
using System.Xml.Linq;

namespace SP.Client.Caml.Operators
{
    public sealed class IsNotNull : FieldOperator
    {
        internal const string IsNotNullTag = "IsNotNull";

        public IsNotNull(CamlFieldRef fieldRef)
            : base(IsNotNullTag, fieldRef)
        {
        }

        public IsNotNull(Guid fieldId)
            : base(IsNotNullTag, new CamlFieldRef {Id = fieldId})
        {
        }

        public IsNotNull(string fieldName)
            : base(IsNotNullTag, new CamlFieldRef {Name = fieldName})
        {
        }

        public IsNotNull(XElement existingIsNotNullOperator)
            : base(IsNotNullTag, existingIsNotNullOperator)
        {
        }
    }
}