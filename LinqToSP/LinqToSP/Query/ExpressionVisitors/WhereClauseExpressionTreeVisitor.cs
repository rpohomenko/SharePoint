namespace SP.Client.Linq.Query.ExpressionVisitors
{
    internal class WhereClauseExpressionTreeVisitor<TContext> : SpExpressionVisitor<TContext>
        where TContext : ISpDataContext
    {
    private readonly Caml.Query _query = new Caml.Query();

    public WhereClauseExpressionTreeVisitor(SpQueryArgs<TContext> args): base(args)
    {
    }

    public Caml.Clauses.CamlWhere Clause
    {
      get
      {
        if (Operator != null)
        {
          _query.Where = new Caml.Clauses.CamlWhere(Operator);
        }
        return _query.Where;
      }
    }
  }
}
