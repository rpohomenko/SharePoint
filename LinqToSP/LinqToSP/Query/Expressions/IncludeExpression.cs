using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Linq;

namespace SP.Client.Linq.Query.Expressions
{
  internal class IncludeExpression<TContext> : Expression
       where TContext: ISpDataContext
  {
    public IncludeExpression(Expression entityExpression, IEnumerable<Expression> predicates)
    {
      Expression = entityExpression;
      Type = Expression.Type;
      Predicates = predicates;
    }

    public virtual Expression Expression { get; set; }

    public sealed override ExpressionType NodeType => ExpressionType.Extension;
    public override Type Type { get; }
    public IEnumerable<Expression> Predicates { get; }

    public override bool CanReduce => false;
     
    protected override Expression VisitChildren(ExpressionVisitor visitor)
    {
      var result = visitor.Visit(Expression);
      if (result != Expression)
        return new IncludeExpression<TContext>(result, Predicates);
      return this;
    }

    protected override Expression Accept(ExpressionVisitor visitor)
    {
      return base.Accept(visitor);
    }  

    public override string ToString()
    {
      if (Predicates != null)
      {
        return $"Include({string.Join(", ", Predicates.Select(p => p.ToString()).ToArray())})";
      }
      return base.ToString();
    }
  }
}
