using System;
using System.Linq;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using JetBrains.Annotations;
using Remotion.Linq;
using Remotion.Linq.Parsing.Structure;

namespace SP.Client.Linq.Query
{
    public class AsyncQueryProvider<TEntity, TContext> : QueryProvider<TEntity, TContext>, IAsyncQueryProvider<TEntity>
      where TEntity : class, IListItemEntity
      where TContext : ISpDataContext
    {
        public AsyncQueryProvider(Type queryableType, [NotNull] IQueryParser queryParser, [NotNull] IAsyncQueryExecutor executor) : base(queryableType, queryParser, executor)
        {
        }

        public virtual async Task<IQueryable<TEntity>> ExecuteAsync(Expression expression, CancellationToken cancellationToken)
        {
            if (cancellationToken.IsCancellationRequested)
            {
                return await Task.FromCanceled<IQueryable<TEntity>>(cancellationToken);
            }
            try
            {
                QueryModel queryModel = this.GenerateQueryModel(expression);
                return (IQueryable<TEntity>)await Task.FromResult(queryModel.Execute(this.Executor).Value);
            }
            catch (Exception ex)
            {
                return await Task.FromException<IQueryable<TEntity>>(ex);
            }
        }
    }
}
