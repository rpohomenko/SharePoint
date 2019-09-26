using System;
using System.Xml.Linq;

namespace SP.Client.Caml.Operators
{
    public abstract class ComparisonOperator : Operator
    {
        protected ComparisonOperator(string operatorName)
            : base(operatorName)
        {
        }

        protected ComparisonOperator(string operatorName, string existingOperator)
            : base(operatorName, existingOperator)
        {
        }

        protected ComparisonOperator(string operatorName, XElement existingOperator)
            : base(operatorName, existingOperator)
        {
        }

        internal static ComparisonOperator GetComparisonOperator(XElement existingOperator)
        {
            var tag = existingOperator.Name.LocalName;
            if (string.Equals(tag, BeginsWith.BeginsWithTag, StringComparison.OrdinalIgnoreCase))
            {
                return new BeginsWith(existingOperator);
            }
            if (string.Equals(tag, Contains.ContainsTag, StringComparison.OrdinalIgnoreCase))
            {
                return new Contains(existingOperator);
            }
            if (string.Equals(tag, Eq.EqTag, StringComparison.OrdinalIgnoreCase))
            {
                return new Eq(existingOperator);
            }
            if (string.Equals(tag, Geq.GeqTag, StringComparison.OrdinalIgnoreCase))
            {
                return new Geq(existingOperator);
            }
            if (string.Equals(tag, Gt.GtTag, StringComparison.OrdinalIgnoreCase))
            {
                return new Gt(existingOperator);
            }
            if (string.Equals(tag, Leq.LeqTag, StringComparison.OrdinalIgnoreCase))
            {
                return new Leq(existingOperator);
            }
            if (string.Equals(tag, Lt.LtTag, StringComparison.OrdinalIgnoreCase))
            {
                return new Lt(existingOperator);
            }
            if (string.Equals(tag, Neq.NeqTag, StringComparison.OrdinalIgnoreCase))
            {
                return new Neq(existingOperator);
            }
            if (string.Equals(tag, IsNull.IsNullTag, StringComparison.OrdinalIgnoreCase))
            {
                return new IsNull(existingOperator);
            }
            if (string.Equals(tag, IsNotNull.IsNotNullTag, StringComparison.OrdinalIgnoreCase))
            {
                return new IsNotNull(existingOperator);
            }
            if (string.Equals(tag, DateRangesOverlap.DateRangesOverlapTag, StringComparison.OrdinalIgnoreCase))
            {
                return new DateRangesOverlap(existingOperator);
            }
            if (string.Equals(tag, In.InTag, StringComparison.OrdinalIgnoreCase))
            {
                return new In(existingOperator);
            }
            if (string.Equals(tag, Includes.IncludesTag, StringComparison.OrdinalIgnoreCase))
            {
                return new Includes(existingOperator);
            }
            if (string.Equals(tag, NotIncludes.NotIncludesTag, StringComparison.OrdinalIgnoreCase))
            {
                return new NotIncludes(existingOperator);
            }
            if (string.Equals(tag, Membership.MembershipTag, StringComparison.OrdinalIgnoreCase))
            {
                return new Membership(existingOperator);
            }
            throw new NotSupportedException("tag");
        }
    }
}
