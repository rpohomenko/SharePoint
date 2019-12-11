using Microsoft.SharePoint.Client;
using SP.Client.Caml;
using SP.Client.Caml.Operators;
using System;
using System.Linq.Expressions;

namespace SP.Client.Linq.Query.ExpressionVisitors
{
  internal class SpIsMembershipExpressionVisitor<TContext> : SpComparisonExpressionVisitor<TContext>
      where TContext : ISpDataContext
  {
    public SpIsMembershipExpressionVisitor(SpQueryArgs<TContext> args) : base(args)
    {
    }

    protected override Expression VisitMethodCall(MethodCallExpression node)
    {
      if ((node.Method.Name == "IsMembership") /*&& typeof(ListItemEntityExtensions).IsAssignableFrom(node.Method.DeclaringType)*/)
      {
        Visit(node.Object);
        foreach (var arg in node.Arguments)
        {
          if (arg.NodeType == ExpressionType.MemberAccess || arg.NodeType == ExpressionType.Constant || arg.NodeType == ExpressionType.Lambda)
          {
            Visit(arg);
          }
        }

        FieldType dataType;
        CamlFieldRef fieldRef = GetFieldRef(out dataType);

        if (fieldRef == null || FieldValue == null)
        {
          return node;
        }

        Operator = new Membership(fieldRef, (MembershipType)FieldValue);
        return node;
      }
      throw new NotSupportedException($"{node.NodeType} method is not supported in LinqToSP.");
    }

    protected override Expression VisitConstant(ConstantExpression exp)
    {
      MembershipType membershipType;
      if (exp.Value != null && Enum.TryParse(exp.Value.ToString(), out membershipType))
      {
        FieldValue = membershipType;
      }
      return base.VisitConstant(exp);
    }
  }
}
