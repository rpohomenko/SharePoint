using System.Collections.Generic;
using System.Linq;

namespace SP.Client.Linq.Infrastructure
{
    public interface ISpRepository<TEntity>
        where TEntity : IListItemEntity
    {
        TEntity Find(int itemId);

        IQueryable<TEntity> FindAll(params int[] itemIds);

        /// <summary>
        /// Inserts a new entity into the repository.
        /// </summary>
        TEntity Add(TEntity entity);

        IEnumerable<TEntity> AddRange(IEnumerable<TEntity> entities);

        /// <summary>
        /// Removes an entity from the respository.
        /// </summary>
        /// <returns>False if the entity does not exist in the repository, or true if successfully deleted.</returns>
        int Delete(params int[] itemIds);

        bool Remove(TEntity entity);

        int RemoveRange(IEnumerable<TEntity> entities);
    }
}
