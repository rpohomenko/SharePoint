using SP.Client.Extensions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Xml.Linq;

namespace SP.Client.Caml.Operators
{
    public abstract class LogicalJoin : Operator
    {
        internal const int OperatorCount = 2;

        protected LogicalJoin(string operatorName, ComparisonOperator comparisonOperator, LogicalJoin logicalJoin, IEnumerable<Operator> operators)
           : base(operatorName)
        {
            var allOperators = new List<Operator>() { comparisonOperator, logicalJoin };
            if (operators != null)
            {
                allOperators.AddRange(operators);
            }
            InitOperators(allOperators);
        }

        protected LogicalJoin(string operatorName, LogicalJoin logicalJoin, ComparisonOperator comparisonOperator, IEnumerable<Operator> operators)
          : base(operatorName)
        {
            var allOperators = new List<Operator>() { logicalJoin, comparisonOperator };
            if (operators != null)
            {
                allOperators.AddRange(operators);
            }
            InitOperators(allOperators);
        }

        protected LogicalJoin(string operatorName, ComparisonOperator firstComparisonOperator, ComparisonOperator secondComparisonOperator, IEnumerable<Operator> operators)
         : base(operatorName)
        {
            var allOperators = new List<Operator>() { firstComparisonOperator, secondComparisonOperator };
            if (operators != null)
            {
                allOperators.AddRange(operators);
            }
            InitOperators(allOperators);
        }

        protected LogicalJoin(string operatorName, LogicalJoin firstLogicalJoin, LogicalJoin secondLogicalJoin, IEnumerable<Operator> operators)
            : base(operatorName)
        {
            var allOperators = new List<Operator>() { firstLogicalJoin, secondLogicalJoin };
            if (operators != null)
            {
                allOperators.AddRange(operators);
            }
            InitOperators(allOperators);
        }

        protected LogicalJoin(string operatorName, IEnumerable<Operator> operators)
            : base(operatorName)
        {
            InitOperators(operators);
        }

        protected LogicalJoin(string operatorName, string existingLogicalJoin)
            : base(operatorName, existingLogicalJoin)
        {
        }

        protected LogicalJoin(string operatorName, XElement existingLogicalJoin)
            : base(operatorName, existingLogicalJoin)
        {
        }

        public LogicalJoin Parent { get; private set; }
        public Operator[] Operators { get; private set; }

        protected void InitOperators(IEnumerable<Operator> operators)
        {
            if (operators != null)
            {
                Operators = operators as Operator[] ?? operators.Where(op => op != null).Take(OperatorCount).ToArray();
                if (Operators.Length < OperatorCount)
                {
                    throw new NotSupportedException(string.Format("Should be at least of {0} operators.", OperatorCount));
                }
                //if (Operators.OfType<LogicalJoin>().Count() == Operators.Length)
                //{
                //    throw new NotSupportedException("All operators are logical joins.");
                //}
                foreach (var @operator in Operators.OfType<LogicalJoin>())
                {
                    @operator.Parent = this;
                }
                foreach (var @operator in operators.Where(op => op != null).Skip(OperatorCount))
                {
                    Combine(@operator);
                }
            }
        }

        protected override void OnParsing(XElement existingLogicalJoin)
        {
            var operators = existingLogicalJoin.Elements().Select(GetOperator);
            InitOperators(operators);
        }

        public abstract void Combine(Operator @operator);

        internal LogicalJoin CombineAnd(params Operator[] combinedOperator)
        {
            if (combinedOperator == null) throw new ArgumentNullException("combinedOperator");
            var childOperator = Operators.OfType<LogicalJoin>()
                .FirstOrDefaultFromMany(op => op.Operators.OfType<LogicalJoin>(),
                    op => !op.Operators.OfType<LogicalJoin>().Any());

            LogicalJoin @operator = childOperator ?? this;
            var operators = new List<Operator>
            {
                @operator.Operators.First(),
                new And(new List<Operator> {@operator.Operators.Last()}.Union(combinedOperator))
            };
            @operator.InitOperators(operators);
            return this;
        }

        internal LogicalJoin CombineOr(params Operator[] combinedOperator)
        {
            if (combinedOperator == null) throw new ArgumentNullException("combinedOperator");

            var childOperator = Operators.OfType<LogicalJoin>()
                .FirstOrDefaultFromMany(op => op.Operators.OfType<LogicalJoin>(),
                    op => !op.Operators.OfType<LogicalJoin>().Any());

            LogicalJoin @operator = childOperator ?? this;
            var operators = new List<Operator>
            {
                @operator.Operators.First(),
                new Or(new List<Operator> {@operator.Operators.Last()}.Union(combinedOperator))
            };
            @operator.InitOperators(operators);
            return this;
        }

        public override XElement ToXElement()
        {
            var el = base.ToXElement();
            foreach (var op in Operators.Where(op => op != null))
            {
                el.Add(op.ToXElement());
            }
            return el;
        }
    }
}