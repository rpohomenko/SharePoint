using JetBrains.Annotations;
using Remotion.Linq;
using Remotion.Linq.Clauses;
using Remotion.Linq.Clauses.Expressions;
using Remotion.Linq.Clauses.ResultOperators;
using SP.Client.Caml;
using SP.Client.Linq.Query.Expressions;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Linq.Expressions;

namespace SP.Client.Linq.Query.ExpressionVisitors
{
    internal class SpGeneratorQueryModelVisitor<TContext> : QueryModelVisitorBase
     where TContext : ISpDataContext
    {
        private readonly SpQueryArgs<TContext> _args;
        private readonly View _spView;

        internal SpGeneratorQueryModelVisitor([NotNull] SpQueryArgs<TContext> args, View spView)
        {
            _args = args;
            _spView = spView;
        }

        public override void VisitGroupJoinClause(GroupJoinClause groupJoinClause, QueryModel queryModel, int index)
        {
        }

        public override void VisitJoinClause(JoinClause joinClause, QueryModel queryModel, int index)
        {
        }

        public override void VisitQueryModel(QueryModel queryModel)
        {
            queryModel.SelectClause.Accept(this, queryModel);
            queryModel.MainFromClause.Accept(this, queryModel);
            VisitBodyClauses(queryModel.BodyClauses, queryModel);
            VisitResultOperators(queryModel.ResultOperators, queryModel);
        }

        public override void VisitMainFromClause(MainFromClause fromClause, QueryModel queryModel)
        {
            if (fromClause.FromExpression is SubQueryExpression)
            {
                this.VisitQueryModel((fromClause.FromExpression as SubQueryExpression).QueryModel);
            }
            else if (fromClause.FromExpression is IncludeExpression<TContext>)
            {
                VisitIncludeClause(fromClause.FromExpression as IncludeExpression<TContext>, queryModel);
            }
            else if (fromClause.FromExpression is GroupByExpression<TContext>)
            {
                VisitGroupByClause(fromClause.FromExpression as GroupByExpression<TContext>, queryModel);
            }
            else
            {
                base.VisitMainFromClause(fromClause, queryModel);
            }
        }

        public virtual void VisitIncludeClause(IncludeExpression<TContext> expression, QueryModel queryModel)
        {
            var visitor = new IncludeExpressionVisitor<TContext>(_args);
            visitor.Visit(expression);
            _spView.ViewFields = visitor.ViewFields;
        }

        public virtual void VisitGroupByClause(GroupByExpression<TContext> expression, QueryModel queryModel)
        {
            var visitor = new GroupByExpressionVisitor<TContext>(_args);
            visitor.Visit(expression);
            _spView.Query.GroupBy = visitor.Clause;
        }

        public override void VisitWhereClause(WhereClause whereClause, QueryModel queryModel, int index)
        {
            var where = new WhereClauseExpressionTreeVisitor<TContext>(_args);
            where.Visit(whereClause.Predicate);
            if (_spView.Query.Where == null)
            {
                _spView.Query.Where = where.Clause;
            }
            else
            {
                if (where.Clause != null)
                {
                    _spView.Query.Where = index > 0
                        ? CamlExtensions.And(_spView.Query.Where, where.Clause)
                        : CamlExtensions.Or(_spView.Query.Where, where.Clause);
                }
            }
            base.VisitWhereClause(whereClause, queryModel, index);
        }

        public override void VisitResultOperator(ResultOperatorBase resultOperator, QueryModel queryModel, int index)
        {
            if (resultOperator is TakeResultOperator)
            {
                var take = resultOperator as TakeResultOperator;
                _spView.Limit = Convert.ToInt32(take.Count.ToString());
            }
            else if (resultOperator is CountResultOperator)
            {

            }
            else if (resultOperator is LongCountResultOperator)
            {

            }
            else if (resultOperator is FirstResultOperator)
            {
                _spView.Limit = 1;
            }

            //Not supported result operators
            else if (resultOperator is SkipResultOperator)
                throw new NotSupportedException("Method Skip() is not supported in LinqToSp.");
            else if (resultOperator is ContainsResultOperator)
                throw new NotSupportedException("Method Contains() is not supported in LinqToSp.");
            else if (resultOperator is DefaultIfEmptyResultOperator)
                throw new NotSupportedException("Method DefaultIfEmpty() is not supported in LinqToSp.");
            else if (resultOperator is ExceptResultOperator)
                throw new NotSupportedException("Method Except() is not supported in LinqToSp.");
            //else if (resultOperator is GroupResultOperator)
            //    throw new NotSupportedException("Method Group() is not supported in LinqToSp.");
            else if (resultOperator is IntersectResultOperator)
                throw new NotSupportedException("Method Intersect() is not supported in LinqToSp.");
            else if (resultOperator is OfTypeResultOperator)
                throw new NotSupportedException("Method OfType() is not supported in LinqToSp.");
            else if (resultOperator is SingleResultOperator)
                throw new NotSupportedException("Method Single() is not supported in LinqToSp. Use First() method instead.");
            else if (resultOperator is UnionResultOperator)
                throw new NotSupportedException("Method Union() is not supported in LinqToSp.");
            else if (resultOperator is AverageResultOperator)
                throw new NotSupportedException("Method Average() is not supported in LinqToSp.");
            else if (resultOperator is MinResultOperator)
                throw new NotSupportedException("Method Min() is not supported in LinqToSp.");
            else if (resultOperator is MaxResultOperator)
                throw new NotSupportedException("Method Max() is not supported in LinqToSp.");
            else if (resultOperator is SumResultOperator)
                throw new NotSupportedException("Method Sum() is not supported in LinqToSp.");
            else if (resultOperator is DistinctResultOperator)
                throw new NotSupportedException("Method Distinct() is not supported in LinqToSp.");
            else if (resultOperator is ConcatResultOperator)
            {
                var source = (resultOperator as ConcatResultOperator).Source2 as SubQueryExpression;
                if (source != null)
                {
                    this.VisitQueryModel(source.QueryModel);
                }
                else if ((resultOperator as ConcatResultOperator).Source2 is ConstantExpression)
                {
                }
                else
                {
                    throw new NotSupportedException("Method Concat() is not supported in LinqToSp.");
                }
            }
            base.VisitResultOperator(resultOperator, queryModel, index);
        }

        public override void VisitAdditionalFromClause(AdditionalFromClause fromClause, QueryModel queryModel, int index)
        {
            base.VisitAdditionalFromClause(fromClause, queryModel, index);
        }

        protected override void VisitBodyClauses(ObservableCollection<IBodyClause> bodyClauses, QueryModel queryModel)
        {
            if (_args == null) return;

            if (_spView.Query.OrderBy == null)
            {
                _spView.Query.OrderBy = new Caml.Clauses.CamlOrderBy();
            }
            foreach (var orderClause in bodyClauses.OfType<OrderByClause>())
            {
                if (orderClause != null)
                {
                    foreach (var ordering in orderClause.Orderings)
                    {
                        var exp = ordering.Expression;
                        if (exp is MemberExpression)
                        {
                            string fieldName = (exp as MemberExpression).Member.Name;
                            if (_args.FieldMappings.ContainsKey(fieldName))
                            {
                                var fieldMap = _args.FieldMappings[fieldName];
                                _spView.Query.OrderBy.Add(fieldMap.Name, ordering.OrderingDirection == OrderingDirection.Asc ? (bool?)null : false);
                            }
                        }
                        else if (exp is MethodCallExpression)
                        {

                        }
                    }
                }

            }
            base.VisitBodyClauses(bodyClauses, queryModel);
        }

    }
}
