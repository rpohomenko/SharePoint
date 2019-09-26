using System.Threading;
using System.Threading.Tasks;

namespace System.Collections.Generic
{
  /// <summary>Exposes an enumerator that provides asynchronous iteration over values of a specified type.</summary>
  /// <typeparam name="T">The type of values to enumerate.</typeparam>
  public interface IAsyncEnumerable<T>
  {
    /// <summary>Returns an enumerator that iterates asynchronously through the collection.</summary>
    /// <param name="cancellationToken">A <see cref="CancellationToken"/> that may be used to cancel the asynchronous iteration.</param>
    /// <returns>An enumerator that can be used to iterate asynchronously through the collection.</returns>
    Task<IEnumerator<T>> GetAsyncEnumerator(CancellationToken cancellationToken = default);
  }

  //public interface IAsyncEnumerator<T> : IDisposable
  //{
  //  /// <summary>
  //  /// Advances the enumerator to the next element in the sequence, returning the result asynchronously.
  //  /// </summary>
  //  /// <param name="cancellationToken">Cancellation token that can be used to cancel the operation.</param>
  //  /// <returns>
  //  /// Task containing the result of the operation: true if the enumerator was successfully advanced 
  //  /// to the next element; false if the enumerator has passed the end of the sequence.
  //  /// </returns>
  //  Task<bool> MoveNext(CancellationToken cancellationToken);

  //  /// <summary>
  //  /// Gets the current element in the iteration.
  //  /// </summary>
  //  T Current { get; }
  //}
}
