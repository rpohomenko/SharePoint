using SP.Client.Linq.Query.Expressions;
using System.Linq.Expressions;

namespace SP.Client.Linq.Query.ExpressionVisitors
{
    internal class GroupByExpressionVisitor<TContext> : SpExpressionVisitor<TContext>
        where TContext : ISpDataContext
    {
        public GroupByExpressionVisitor(SpQueryArgs<TContext> args) : base(args)
        {
            Clause = new Caml.Clauses.CamlGroupBy();
        }

        public Caml.Clauses.CamlGroupBy Clause { get; }

        public override Expression Visit(Expression expression)
        {
            if (expression is IncludeExpression<TContext>)
            {
                foreach (var path in (expression as IncludeExpression<TContext>).Predicates)
                {
                    Visit(path);
                }
                return expression;
            }
            else if (expression is GroupByExpression<TContext>)
            {
                Clause.Limit = (expression as GroupByExpression<TContext>).Limit > 0 ?
                    (expression as GroupByExpression<TContext>).Limit
                    : (int?)null;

                foreach (var path in (expression as GroupByExpression<TContext>).Predicates)
                {
                    Visit(path);
                }
                return expression;
            }
            else
            {
                return base.Visit(expression);
            }
        }

        protected override Expression VisitMember(MemberExpression node)
        {
            string fieldName = node.Member.Name;
            if (SpQueryArgs != null)
            {
                if (SpQueryArgs.FieldMappings.ContainsKey(fieldName))
                {
                    var fieldMap = SpQueryArgs.FieldMappings[fieldName];
                    Clause.Add(fieldMap.Name);
                }
            }
            return node;
            //return base.VisitMember(node);
        }
    }
}
