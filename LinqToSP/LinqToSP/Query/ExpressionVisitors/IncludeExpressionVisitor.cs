using SP.Client.Linq.Query.Expressions;
using System.Linq.Expressions;

namespace SP.Client.Linq.Query.ExpressionVisitors
{
    internal class IncludeExpressionVisitor<TContext> : SpExpressionVisitor<TContext>
         where TContext : class, ISpEntryDataContext
    {
        public IncludeExpressionVisitor(SpQueryArgs<TContext> args) : base(args)
        {
            ViewFields = new Caml.ViewFieldsCamlElement();
        }

        public Caml.ViewFieldsCamlElement ViewFields { get; }

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
                    ViewFields.Add(fieldMap.Name);
                }
            }
            return node;
            //return base.VisitMember(node);
        }
    }
}
