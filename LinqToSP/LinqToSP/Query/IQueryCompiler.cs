using JetBrains.Annotations;
using System.Linq.Expressions;
using System.Threading;

namespace SP.Client.Linq.Query
{
    public interface IAsyncQueryCompiler : IQueryCompiler
    {
        TResult ExecuteAsync<TResult>([NotNull] Expression query, CancellationToken cancellationToken);
    }

    public interface IQueryCompiler
    {
        TResult Execute<TResult>([NotNull] Expression query);
    }
}
