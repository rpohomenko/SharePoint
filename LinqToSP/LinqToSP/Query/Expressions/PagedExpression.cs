using Microsoft.SharePoint.Client;
using System;
using System.Linq.Expressions;

namespace SP.Client.Linq.Query.Expressions
{
    internal class PagedExpression<TContext/*, TEntity*/> : Expression
         where TContext : class, ISpEntryDataContext
         //where TEntity : class, IListItemEntity, new()
    {
        public PagedExpression(Expression entityExpression, SpQueryArgs<TContext> args, /*TEntity entity,*/ ListItem item, bool isPrev)
        {
            Expression = entityExpression;
            Type = Expression.Type;
            //Entity = entity;
            Item = item;
            IsPrev = isPrev;
            Args = args;
        }

        public virtual Expression Expression { get; set; }

        public sealed override ExpressionType NodeType => ExpressionType.Extension;
        public override Type Type { get; }
        //public TEntity Entity { get; }
        public ListItem Item { get; }
        public bool IsPrev { get; }
        public SpQueryArgs<TContext> Args { get; }

        public override bool CanReduce => false;

        protected override Expression VisitChildren(ExpressionVisitor visitor)
        {
            var result = visitor.Visit(Expression);
            if (result != Expression)
                return new PagedExpression<TContext/*, TEntity*/>(result, Args, /*Entity,*/ Item, IsPrev);
            return this;
        }

        protected override Expression Accept(ExpressionVisitor visitor)
        {
            return base.Accept(visitor);
        }

        public override string ToString()
        {
            //if (Entity != null)
            //{
            //    return IsPrev ? $"Previous({Entity.Id})" : $"Next({Entity.Id})";
            //}
            if (Item != null)
            {
                return IsPrev ? $"Previous({Item.Id})" : $"Next({Item.Id})";
            }
            return base.ToString();
        }
    }
}
