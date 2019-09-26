using Microsoft.SharePoint.Client;
using SP.Client.Caml;
using System;
using System.Linq.Expressions;

namespace SP.Client.Linq.Query.ExpressionVisitors
{
    internal class SpLookupIncludesExpressionVisitor<TContext> : SpComparisonExpressionVisitor<TContext>
        where TContext : ISpDataContext
    {
        public SpLookupIncludesExpressionVisitor(SpQueryArgs<TContext> args) : base(args)
        {
        }

        protected override Expression VisitMethodCall(MethodCallExpression node)
        {
            if ((node.Method.Name == "LookupIncludes" || node.Method.Name == "LookupIdIncludes") && typeof(ListItemEntityExtensions).IsAssignableFrom(node.Method.DeclaringType))
            {
                Visit(node.Object);
                foreach (var arg in node.Arguments)
                {
                    if (arg.NodeType == ExpressionType.Constant || arg.NodeType == ExpressionType.Lambda)
                    {
                        Visit(arg);
                    }
                }

                FieldType dataType;
                CamlFieldRef fieldRef = GetFieldRef(out dataType);
                CamlValue value = GetValue(dataType);
                if (fieldRef == null || value == null)
                {
                    return node;
                }
                if (node.Method.Name == "LookupIdIncludes")
                {
                    fieldRef.LookupId = true;
                }
                Operator = new Caml.Operators.Includes(fieldRef, value);
                return node;
            }
            throw new NotSupportedException($"{node.NodeType} method is not supported in LinqToSP.");
        }
    }
}
