using Microsoft.SharePoint.Client;
using SP.Client.Caml;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;

namespace SP.Client.Linq.Query.ExpressionVisitors
{
  internal class SpIncludesExpressionVisitor<TContext> : SpComparisonExpressionVisitor<TContext>
      where TContext : ISpDataContext
  {
    protected IEnumerable<object> FieldValues { get; private set; }

    public SpIncludesExpressionVisitor(SpQueryArgs<TContext> args) : base(args)
    {
    }

    protected override Expression VisitMethodCall(MethodCallExpression node)
    {
      if (node.Method.Name == "Includes" /*&& typeof(ListItemEntityExtensions).IsAssignableFrom(node.Method.DeclaringType)*/)
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
        if (fieldRef == null || FieldValues == null)
        {
          return node;
        }

        Operator = new Caml.Operators.In(fieldRef, FieldValues, dataType);
        return node;
      }
      throw new NotSupportedException($"{node.NodeType} method is not supported in LinqToSP.");
    }

    protected override Expression VisitConstant(ConstantExpression exp)
    {
      if (typeof(string[]).IsAssignableFrom(exp.Type))
      {
        FieldValues = exp.Value as string[];
      }
      else if (typeof(int[]).IsAssignableFrom(exp.Type))
      {
        FieldValues = (exp.Value as int[]).Select(v => v as object);
      }
      return exp;
    }
  }
}
