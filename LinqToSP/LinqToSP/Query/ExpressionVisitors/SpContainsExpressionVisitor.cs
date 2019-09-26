using Microsoft.SharePoint.Client;
using SP.Client.Caml;
using System;
using System.Linq.Expressions;

namespace SP.Client.Linq.Query.ExpressionVisitors
{
    internal class SpContainsExpressionVisitor<TContext> : SpComparisonExpressionVisitor<TContext>
        where TContext : ISpDataContext
    {
        public SpContainsExpressionVisitor(SpQueryArgs<TContext> args) : base(args)
        {
        }

        protected override Expression VisitMethodCall(MethodCallExpression node)
        {
            if (node.Method.Name == "Contains")
            {
                Visit(node.Object);
                foreach (var arg in node.Arguments)
                {
                    Visit(arg);
                }

                FieldType dataType;
                CamlFieldRef fieldRef = GetFieldRef(out dataType);
                CamlValue value = GetValue(dataType);
                if (fieldRef == null)
                {
                    return node;
                }

                Operator = new Caml.Operators.Contains(fieldRef, value);

                return node;
            }
            throw new NotSupportedException($"{node.NodeType} method is not supported in LinqToSP.");
        }
    }

}
