using System;
using System.Collections.Generic;
using System.Linq;
using System.Xml.Linq;

namespace SP.Client.Caml.Operators
{
    public sealed class And : LogicalJoin
    {
        internal const string AndTag = "And";

        internal And(IEnumerable<Operator> operators)
            : base(AndTag, operators)
        {
        }
        
        public And(ComparisonOperator comparisonOperator, LogicalJoin logicalJoin, params Operator[] operators)
           : base(AndTag, comparisonOperator, logicalJoin, operators)
        {
        }

        public And(LogicalJoin logicalJoin, ComparisonOperator comparisonOperator, params Operator[] operators)
          : base(AndTag, logicalJoin, comparisonOperator, operators)
        {
        }

        public And(ComparisonOperator firstComparisonOperator, ComparisonOperator secondComparisonOperator, params Operator[] operators)
         : base(AndTag, firstComparisonOperator, secondComparisonOperator, operators)
        {
        }

        public And(LogicalJoin firstLogicalJoin, LogicalJoin secondLogicalJoin, params Operator[] operators)
            : base(AndTag, firstLogicalJoin, secondLogicalJoin, operators)
        {
        }

        public And(string existingAndOperator)
            : base(AndTag, existingAndOperator)
        {
        }

        public And(XElement existingAndOperator)
            : base(AndTag, existingAndOperator)
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
                    new And(new List<Operator>(Operators.Where(@op => !operators.Contains(@op))) { @operator }.ToArray()));
                InitOperators(operators);
            }
        }
    }
}