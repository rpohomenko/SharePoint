using System;
using System.Collections.Generic;
using System.Linq;
using System.Xml.Linq;

namespace SP.Client.Caml.Operators
{
    public sealed class Or : LogicalJoin
    {
        internal const string OrTag = "Or";

        internal Or(IEnumerable<Operator> operators)
            : base(OrTag, operators)
        {
        }
        
        public Or(ComparisonOperator comparisonOperator, LogicalJoin logicalJoin, params Operator[] operators)
           : base(OrTag, comparisonOperator, logicalJoin, operators)
        {
        }

        public Or(LogicalJoin logicalJoin, ComparisonOperator comparisonOperator, params Operator[] operators)
          : base(OrTag, logicalJoin, comparisonOperator, operators)
        {
        }

        public Or(LogicalJoin firstLogicalJoin, LogicalJoin secondLogicalJoin, params Operator[] operators)
            : base(OrTag, firstLogicalJoin, secondLogicalJoin, operators)
        {
        }

        public Or(ComparisonOperator firstComparisonOperator, ComparisonOperator secondComparisonOperator, params Operator[] operators)
         : base(OrTag, firstComparisonOperator, secondComparisonOperator, operators)
        {
        }

        public Or(string existingOrOperator)
            : base(OrTag, existingOrOperator)
        {
        }

        public Or(XElement existingOrOperator)
            : base(OrTag, existingOrOperator)
        {
        }

        public override void Combine(Operator @operator)
        {
            if (@operator == null) throw new ArgumentNullException("operator");
            var @logicalJoin = Operators.OfType<LogicalJoin>().FirstOrDefault();
            if (@logicalJoin != null)
            {
                @logicalJoin.Combine(@operator);
            }
            else
            {
                var operators = new List<Operator>();
                operators.AddRange(Operators.Where(@op => !(@op is LogicalJoin)).Take(OperatorCount - 1));
                operators.Add(
                    new Or(new List<Operator>(Operators.Where(@op => !operators.Contains(@op))) {@operator}.ToArray()));
                InitOperators(operators);
            }
        }
    }
}