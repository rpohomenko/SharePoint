using SP.Client.Linq.Query.Expressions;
using Remotion.Linq.Clauses.Expressions;
using Remotion.Linq.Parsing;
using System.Linq.Expressions;

namespace SP.Client.Linq.Query.ExpressionVisitors
{
    internal abstract class ExpressionVisitorBase : /*RelinqExpressionVisitor*/ ThrowingExpressionVisitor
    {
        /// <summary>
        ///     Visits the children of the extension expression.
        /// </summary>
        /// <returns>
        ///     The modified expression, if it or any subexpression was modified; otherwise, returns the original expression.
        /// </returns>
        /// <param name="extensionExpression">The expression to visit.</param>
        protected override Expression VisitExtension(Expression extensionExpression)
        {
            return extensionExpression is NullConditionalExpression ? extensionExpression : base.VisitExtension(extensionExpression);
        }

        /// <summary>
        ///     Visits the children of the subquery expression.
        /// </summary>
        /// <returns>
        ///     The modified expression, if it or any subexpression was modified; otherwise, returns the original expression.
        /// </returns>
        /// <param name="subQueryExpression">The expression to visit.</param>
        protected override Expression VisitSubQuery(SubQueryExpression subQueryExpression)
        {
            subQueryExpression.QueryModel.TransformExpressions(Visit);
            return base.VisitSubQuery(subQueryExpression);
        }

        /// <summary>Visits the children of the <see cref="T:System.Linq.Expressions.Expression`1" />.</summary>
        /// <returns>
        ///     The modified expression, if it or any subexpression was modified; otherwise, returns the original
        ///     expression.
        /// </returns>
        /// <param name="node">The expression to visit.</param>
        /// <typeparam name="T">The type of the delegate.</typeparam>
        protected override Expression VisitLambda<T>(Expression<T> node)
        {
            var newBody = Visit(node.Body);

            return newBody == node.Body
                ? node
                : Expression.Lambda(newBody, node.Name, node.TailCall, node.Parameters);
        }

    }
}
