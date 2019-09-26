using JetBrains.Annotations;
using SP.Client.Extensions;
using System;
using System.Linq.Expressions;

namespace SP.Client.Linq.Query.Expressions
{
    internal class NullSafeEqualExpression : Expression
    {
        /// <summary>
        ///     This API supports the Entity Framework Core infrastructure and is not intended to be used
        ///     directly from your code. This API may change or be removed in future releases.
        /// </summary>
        public NullSafeEqualExpression(
            [NotNull] Expression outerKeyNullCheck,
            [NotNull] BinaryExpression equalExpression)
        {
            Check.NotNull(outerKeyNullCheck, nameof(outerKeyNullCheck));
            Check.NotNull(equalExpression, nameof(equalExpression));

            OuterKeyNullCheck = outerKeyNullCheck;
            EqualExpression = equalExpression;
        }

        /// <summary>
        ///     This API supports the Entity Framework Core infrastructure and is not intended to be used
        ///     directly from your code. This API may change or be removed in future releases.
        /// </summary>
        public virtual Expression OuterKeyNullCheck { get; }

        /// <summary>
        ///     This API supports the Entity Framework Core infrastructure and is not intended to be used
        ///     directly from your code. This API may change or be removed in future releases.
        /// </summary>
        public virtual BinaryExpression EqualExpression { get; }

        /// <summary>
        ///     This API supports the Entity Framework Core infrastructure and is not intended to be used
        ///     directly from your code. This API may change or be removed in future releases.
        /// </summary>
        public override Type Type => typeof(bool);

        /// <summary>
        ///     This API supports the Entity Framework Core infrastructure and is not intended to be used
        ///     directly from your code. This API may change or be removed in future releases.
        /// </summary>
        public override bool CanReduce => true;

        /// <summary>
        ///     This API supports the Entity Framework Core infrastructure and is not intended to be used
        ///     directly from your code. This API may change or be removed in future releases.
        /// </summary>
        public override ExpressionType NodeType => ExpressionType.Extension;

        /// <summary>
        ///     This API supports the Entity Framework Core infrastructure and is not intended to be used
        ///     directly from your code. This API may change or be removed in future releases.
        /// </summary>
        public override Expression Reduce()
            => AndAlso(
                OuterKeyNullCheck,
                EqualExpression);

        /// <summary>
        ///     This API supports the Entity Framework Core infrastructure and is not intended to be used
        ///     directly from your code. This API may change or be removed in future releases.
        /// </summary>
        protected override Expression VisitChildren(ExpressionVisitor visitor)
        {
            var newNullCheck = visitor.Visit(OuterKeyNullCheck);
            var newLeft = visitor.Visit(EqualExpression.Left);
            var newRight = visitor.Visit(EqualExpression.Right);

            if (newLeft.Type != newRight.Type
                && newLeft.Type.UnwrapNullableType() == newRight.Type.UnwrapNullableType())
            {
                if (!newLeft.Type.IsNullableType())
                {
                    newLeft = Convert(newLeft, newRight.Type);
                }
                else
                {
                    newRight = Convert(newRight, newLeft.Type);
                }
            }

            return newNullCheck != OuterKeyNullCheck
                   || EqualExpression.Left != newLeft
                   || EqualExpression.Right != newRight
                ? new NullSafeEqualExpression(newNullCheck, Equal(newLeft, newRight))
                : this;
        }

    }
}
