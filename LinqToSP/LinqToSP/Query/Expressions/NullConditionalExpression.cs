using Remotion.Linq.Parsing.ExpressionVisitors;
using System;
using System.Linq.Expressions;

namespace SP.Client.Linq.Query.Expressions
{
    internal class NullConditionalExpression : Expression
    {
        private readonly Type _type;

        /// <summary>
        ///     Creates a new instance of NullConditionalExpression.
        /// </summary>
        /// <param name="caller"> Expression representing potentially nullable caller that needs to be tested for it's nullability. </param>
        /// <param name="accessOperation"> Expression representing access operation. </param>
        public NullConditionalExpression(
            Expression caller,
            Expression accessOperation)
        {
            Caller = caller;
            AccessOperation = accessOperation;

            _type = accessOperation.Type.IsNullableType()
                ? accessOperation.Type
                : accessOperation.Type.MakeNullable();
        }

        /// <summary>
        ///     Expression representing potentially nullable caller that needs to be tested for it's nullability.
        /// </summary>
        public virtual Expression Caller { get; }

        /// <summary>
        ///     Expression representing access operation.
        /// </summary>
        public virtual Expression AccessOperation { get; }

        /// <summary>
        ///     Indicates that the node can be reduced to a simpler node. If this returns true,
        ///     Reduce() can be called to produce the reduced form.
        /// </summary>
        public override bool CanReduce => true;

        /// <summary>
        ///     Gets the static type of the expression that this expression represents.
        /// </summary>
        public override Type Type => _type;

        /// <summary>
        ///     Gets the node type of this expression.
        /// </summary>
        public override ExpressionType NodeType => ExpressionType.Extension;

        /// <summary>
        ///     Reduces this node to a simpler expression. If CanReduce returns true, this should
        ///     return a valid expression. This method can return another node which itself must
        ///     be reduced.
        /// </summary>
        public override Expression Reduce()
        {
            var nullableCallerType = Caller.Type;
            var nullableCaller = Parameter(nullableCallerType, "__caller");
            var result = Parameter(_type, "__result");

            var caller = Caller.Type != nullableCaller.Type
                ? (Expression)Convert(nullableCaller, Caller.Type)
                : nullableCaller;

            var operation = ReplacingExpressionVisitor.Replace(Caller, caller, AccessOperation);

            if (operation.Type != _type)
            {
                operation = Convert(operation, _type);
            }

            return Block(
                    new[] { nullableCaller, result },
                    Assign(nullableCaller, Caller),
                    Assign(result, Default(_type)),
                    IfThen(
                        NotEqual(nullableCaller, Default(nullableCallerType)),
                        Assign(result, operation)),
                    result);
        }

        /// <summary>
        ///     Reduces the node and then calls the visitor delegate on the reduced expression.
        ///     The method throws an exception if the node is not
        ///     reducible.
        /// </summary>
        /// <returns>
        ///     The expression being visited, or an expression which should replace it in the tree.
        /// </returns>
        /// <param name="visitor">An instance of <see cref="T:System.Func`2" />.</param>
        protected override Expression VisitChildren(ExpressionVisitor visitor)
        {
            var newCaller = visitor.Visit(Caller);
            var newAccessOperation = visitor.Visit(AccessOperation);

            return newCaller != Caller
                || newAccessOperation != AccessOperation
                && !(ExpressionEqualityComparer.Instance.Equals((newAccessOperation as NullConditionalExpression)?.AccessOperation, AccessOperation))
                ? new NullConditionalExpression(newCaller, newAccessOperation)
                : (this);
        }
    }

}
