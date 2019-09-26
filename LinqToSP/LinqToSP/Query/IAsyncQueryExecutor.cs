using Remotion.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SP.Client.Linq.Query
{
    public interface IAsyncQueryExecutor: IQueryExecutor
    {
        Task<IEnumerable<T>> ExecuteCollectionAsync<T>(QueryModel queryModel);
        Task<T> ExecuteScalarAsync<T>(QueryModel queryModel);
        Task<T> ExecuteSingleAsync<T>(QueryModel queryModel, bool returnDefaultWhenEmpty);
    }
}
