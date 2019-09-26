// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.

using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using JetBrains.Annotations;

namespace SP.Client.Extensions
{
  /// <summary>
  ///     This API supports the Entity Framework Core infrastructure and is not intended to be used
  ///     directly from your code. This API may change or be removed in future releases.
  /// </summary>
  [DebuggerStepThrough]
  public static class ExpressionExtensions
  {
    /// <summary>
    ///     This API supports the Entity Framework Core infrastructure and is not intended to be used
    ///     directly from your code. This API may change or be removed in future releases.
    /// </summary>
    public static bool IsNullConstantExpression([NotNull] this Expression expression)
        => expression.RemoveConvert() is ConstantExpression constantExpression
           && constantExpression.Value == null;

    /// <summary>
    ///     This API supports the Entity Framework Core infrastructure and is not intended to be used
    ///     directly from your code. This API may change or be removed in future releases.
    /// </summary>
    private static IReadOnlyList<PropertyInfo> MatchPropertyAccessList(
        this LambdaExpression lambdaExpression, Func<Expression, Expression, PropertyInfo> propertyMatcher)
    {
      Debug.Assert(lambdaExpression.Body != null);

      var parameterExpression
          = lambdaExpression.Parameters.Single();

      if (RemoveConvert(lambdaExpression.Body) is NewExpression newExpression)
      {
        var propertyInfos
            = newExpression
                .Arguments
                .Select(a => propertyMatcher(a, parameterExpression))
                .Where(p => p != null)
                .ToList();

        return propertyInfos.Count != newExpression.Arguments.Count ? null : propertyInfos;
      }

      var propertyPath
          = propertyMatcher(lambdaExpression.Body, parameterExpression);

      return propertyPath != null ? new[] { propertyPath } : null;
    }

    /// <summary>
    ///     This API supports the Entity Framework Core infrastructure and is not intended to be used
    ///     directly from your code. This API may change or be removed in future releases.
    /// </summary>
    private static PropertyInfo MatchSimplePropertyAccess(
        this Expression parameterExpression, Expression propertyAccessExpression)
    {
      var propertyInfos = MatchPropertyAccess(parameterExpression, propertyAccessExpression);

      return propertyInfos?.Count == 1 ? propertyInfos[0] : null;
    }

    /// <summary>
    ///     This API supports the Entity Framework Core infrastructure and is not intended to be used
    ///     directly from your code. This API may change or be removed in future releases.
    /// </summary>
    public static bool TryGetComplexPropertyAccess(
        [NotNull] this LambdaExpression propertyAccessExpression,
        out IReadOnlyList<PropertyInfo> propertyPath)
    {
      Debug.Assert(propertyAccessExpression.Parameters.Count == 1);

      propertyPath
          = propertyAccessExpression
              .Parameters
              .Single()
              .MatchPropertyAccess(propertyAccessExpression.Body);

      return propertyPath != null;
    }

    private static IReadOnlyList<PropertyInfo> MatchPropertyAccess(
        this Expression parameterExpression, Expression propertyAccessExpression)
    {
      var propertyInfos = new List<PropertyInfo>();

      MemberExpression memberExpression;

      do
      {
        memberExpression = RemoveTypeAs(RemoveConvert(propertyAccessExpression)) as MemberExpression;

        if (!(memberExpression?.Member is PropertyInfo propertyInfo))
        {
          return null;
        }

        propertyInfos.Insert(0, propertyInfo);

        propertyAccessExpression = memberExpression.Expression;
      }
      while (RemoveTypeAs(RemoveConvert(memberExpression.Expression)) != parameterExpression);

      return propertyInfos;
    }

    /// <summary>
    ///     This API supports the Entity Framework Core infrastructure and is not intended to be used
    ///     directly from your code. This API may change or be removed in future releases.
    /// </summary>
    // Issue#11266 This method is being used by provider code. Do not break.
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

    /// <summary>
    ///     This API supports the Entity Framework Core infrastructure and is not intended to be used
    ///     directly from your code. This API may change or be removed in future releases.
    /// </summary>
    public static Expression RemoveTypeAs([CanBeNull] this Expression expression)
    {
      while ((expression?.NodeType == ExpressionType.TypeAs))
      {
        expression = RemoveConvert(((UnaryExpression)expression).Operand);
      }

      return expression;
    }

    /// <summary>
    ///     This API supports the Entity Framework Core infrastructure and is not intended to be used
    ///     directly from your code. This API may change or be removed in future releases.
    /// </summary>
    public static TExpression GetRootExpression<TExpression>([NotNull] this Expression expression)
        where TExpression : Expression
    {
      while (expression is MemberExpression memberExpression)
      {
        expression = memberExpression.Expression;
      }

      return expression as TExpression;
    }

    /// <summary>
    ///     This API supports the Entity Framework Core infrastructure and is not intended to be used
    ///     directly from your code. This API may change or be removed in future releases.
    /// </summary>
    public static bool IsLogicalOperation([NotNull] this Expression expression)
    {
      Check.NotNull(expression, nameof(expression));

      return expression.NodeType == ExpressionType.AndAlso
             || expression.NodeType == ExpressionType.OrElse;
    }

    /// <summary>
    ///     This API supports the Entity Framework Core infrastructure and is not intended to be used
    ///     directly from your code. This API may change or be removed in future releases.
    /// </summary>
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

    /// <summary>
    ///     This API supports the Entity Framework Core infrastructure and is not intended to be used
    ///     directly from your code. This API may change or be removed in future releases.
    /// </summary>
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

    /// <summary>
    ///     This API supports the Entity Framework Core infrastructure and is not intended to be used
    ///     directly from your code. This API may change or be removed in future releases.
    /// </summary>
    public static MemberExpression MakeMemberAccess(
            [CanBeNull] this Expression expression,
            [NotNull] MemberInfo member)
    {
      var memberDeclaringClrType = member.DeclaringType;
      if (expression != null
          && memberDeclaringClrType != expression.Type
          && expression.Type.GetTypeInfo().IsAssignableFrom(memberDeclaringClrType.GetTypeInfo()))
      {
        expression = Expression.Convert(expression, memberDeclaringClrType);
      }

      return Expression.MakeMemberAccess(expression, member);
    }

    /// <summary>
    ///     This API supports the Entity Framework Core infrastructure and is not intended to be used
    ///     directly from your code. This API may change or be removed in future releases.
    /// </summary>
    public static bool IsNullPropagationCandidate(
        [NotNull] this ConditionalExpression conditionalExpression,
        out Expression testExpression,
        out Expression resultExpression)
    {
      Check.NotNull(conditionalExpression, nameof(conditionalExpression));

      testExpression = null;
      resultExpression = null;

      if (!(conditionalExpression.Test is BinaryExpression binaryTest)
          || !(binaryTest.NodeType == ExpressionType.Equal
               || binaryTest.NodeType == ExpressionType.NotEqual))
      {
        return false;
      }

      var isLeftNullConstant = binaryTest.Left.IsNullConstantExpression();
      var isRightNullConstant = binaryTest.Right.IsNullConstantExpression();

      if (isLeftNullConstant == isRightNullConstant)
      {
        return false;
      }

      if (binaryTest.NodeType == ExpressionType.Equal)
      {
        if (!conditionalExpression.IfTrue.IsNullConstantExpression())
        {
          return false;
        }
      }
      else
      {
        if (!conditionalExpression.IfFalse.IsNullConstantExpression())
        {
          return false;
        }
      }

      testExpression = isLeftNullConstant ? binaryTest.Right : binaryTest.Left;
      resultExpression = binaryTest.NodeType == ExpressionType.Equal ? conditionalExpression.IfFalse : conditionalExpression.IfTrue;

      return true;
    }

    /// <summary>
    ///     This API supports the Entity Framework Core infrastructure and is not intended to be used
    ///     directly from your code. This API may change or be removed in future releases.
    /// </summary>
    public static ConstantExpression GenerateDefaultValueConstantExpression(this Type type)
    {
      Check.NotNull(type, nameof(type));

      return (ConstantExpression)_generateDefaultValueConstantExpressionInternalMethod.MakeGenericMethod(type).Invoke(null, Array.Empty<object>());
    }

    private static readonly MethodInfo _generateDefaultValueConstantExpressionInternalMethod =
        typeof(ExpressionExtensions).GetTypeInfo().GetDeclaredMethod(nameof(GenerateDefaultValueConstantExpressionInternal));

    private static ConstantExpression GenerateDefaultValueConstantExpressionInternal<TDefault>()
        => Expression.Constant(default(TDefault));
  }
}
