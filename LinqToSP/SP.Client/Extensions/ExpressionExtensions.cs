using System.Linq.Expressions;
using System.Reflection;
using JetBrains.Annotations;

namespace SP.Client.Extensions
{
  public static class ExpressionExtensions
  {
    public static bool IsNullConstantExpression([NotNull] this Expression expression)
        => expression.RemoveConvert() is ConstantExpression constantExpression
           && constantExpression.Value == null;
 
    public static Expression RemoveConvert([CanBeNull] this Expression expression)
    {
      while (expression != null
             && (expression.NodeType == ExpressionType.Convert
                 || expression.NodeType == ExpressionType.ConvertChecked))
      {
        expression = RemoveConvert(((UnaryExpression)expression).Operand);
      }

      return expression;
    }

    public static Expression RemoveTypeAs([CanBeNull] this Expression expression)
    {
      while ((expression?.NodeType == ExpressionType.TypeAs))
      {
        expression = RemoveConvert(((UnaryExpression)expression).Operand);
      }

      return expression;
    }   

    public static bool IsLogicalOperation([NotNull] this Expression expression)
    {
      Check.NotNull(expression, nameof(expression));

      return expression.NodeType == ExpressionType.AndAlso
             || expression.NodeType == ExpressionType.OrElse;
    }

    public static bool IsComparisonOperation([NotNull] this Expression expression)
    {
      Check.NotNull(expression, nameof(expression));

      return expression.Type == typeof(bool)
             && (expression.NodeType == ExpressionType.Equal
                 || expression.NodeType == ExpressionType.NotEqual
                 || expression.NodeType == ExpressionType.LessThan
                 || expression.NodeType == ExpressionType.LessThanOrEqual
                 || expression.NodeType == ExpressionType.GreaterThan
                 || expression.NodeType == ExpressionType.GreaterThanOrEqual
                 || expression.NodeType == ExpressionType.Not);
    }

    public static BinaryExpression CreateAssignExpression(
        [NotNull] this Expression left,
        [NotNull] Expression right)
    {
      var leftType = left.Type;
      if (leftType != right.Type
          && right.Type.GetTypeInfo().IsAssignableFrom(leftType.GetTypeInfo()))
      {
        right = Expression.Convert(right, leftType);
      }

      return Expression.Assign(left, right);
    }

    public static bool IsNullValue(this Expression exp)
    {
      var constantExpression = exp as ConstantExpression;
      return constantExpression != null && constantExpression.Value == null;
    }
  }
}
