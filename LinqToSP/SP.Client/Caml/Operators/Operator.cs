using System;
using System.Xml.Linq;

namespace SP.Client.Caml.Operators
{
    public abstract class Operator : CamlElement
    {
        protected Operator(string operatorName)
            : base(operatorName)
        {
        }

        protected Operator(string operatorName, string existingOperator)
            : base(operatorName, existingOperator)
        {
        }

        protected Operator(string operatorName, XElement existingOperator)
            : base(operatorName, existingOperator)
        {
        }

        internal static Operator GetOperator(XElement existingOperator)
        {
            var tag = existingOperator.Name.LocalName;
            if (string.Equals(tag, And.AndTag, StringComparison.OrdinalIgnoreCase))
            {
                return new And(existingOperator);
            }
            if (string.Equals(tag, Or.OrTag, StringComparison.OrdinalIgnoreCase))
            {
                return new Or(existingOperator);
            }
            return ComparisonOperator.GetComparisonOperator(existingOperator);
        }
    }
}