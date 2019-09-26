using System;
using System.Linq.Expressions;

namespace SP.Client.Linq.Query.ExpressionVisitors
{
    internal class SpConditionalExpressionVisitor<TContext> : SpExpressionVisitor<TContext>
        where TContext : ISpDataContext
    {
        public SpConditionalExpressionVisitor(SpQueryArgs<TContext> args) : base(args)
        {
        }

        protected override Expression VisitBinary(BinaryExpression exp)
        {
            LeftOperator = ToOperator(exp.Left);
            RightOperator = ToOperator(exp.Right);

            if (LeftOperator == null)
            {
                Operator = RightOperator;
                return exp;
            }
            else if (RightOperator == null)
            {
                Operator = LeftOperator;
                return exp;
            }

            switch (exp.NodeType)
            {
                case ExpressionType.And:
                case ExpressionType.AndAlso:
                    Operator = Caml.CamlExtensions.And(LeftOperator, RightOperator);
                    break;
                case ExpressionType.Or:
                case ExpressionType.OrElse:
                    Operator = Caml.CamlExtensions.Or(LeftOperator, RightOperator);
                    break;
                default:
                    throw new NotSupportedException(string.Format("{0} statement is not supported", exp.NodeType.ToString()));
            }
            return exp;
        }
    }

}
