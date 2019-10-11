using JetBrains.Annotations;
using Remotion.Linq;
using Remotion.Linq.Parsing.Structure;
using SP.Client.Linq.Query.Expressions;
using System;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;

namespace SP.Client.Linq.Query
{
    public class QueryProvider<TEntity, TContext> : QueryProviderBase
    where TEntity : class, IListItemEntity, new()
    where TContext : ISpDataContext
    {
        /// <summary>
        /// Gets the type of queryable created by this provider. This is the generic type definition of an implementation of <see cref="T:System.Linq.IQueryable`1" />
        /// (usually a subclass of <see cref="T:Remotion.Linq.QueryableBase`1" />) with exactly one type argument.
        /// </summary>
        public Type QueryableType { get; }

        /// <summary>
        /// Initializes a new instance of <see cref="T:Remotion.Linq.DefaultQueryProvider" /> using a custom <see cref="T:Remotion.Linq.Parsing.Structure.IQueryParser" />.
        /// </summary>
        /// <param name="queryableType">
        ///   A type implementing <see cref="T:System.Linq.IQueryable`1" />. This type is used to construct the chain of query operators. Must be a generic type
        ///   definition.
        /// </param>
        /// <param name="queryParser">The <see cref="T:Remotion.Linq.Parsing.Structure.IQueryParser" /> used to parse queries. Specify an instance of 
        ///   <see cref="T:Remotion.Linq.Parsing.Structure.QueryParser" /> for default behavior. See also <see cref="M:Remotion.Linq.Parsing.Structure.QueryParser.CreateDefault" />.</param>
        /// <param name="executor">The <see cref="T:Remotion.Linq.IQueryExecutor" /> used to execute queries against a specific query backend.</param>
        public QueryProvider(Type queryableType, [NotNull] IQueryParser queryParser, [NotNull] IQueryExecutor executor) : base(queryParser, executor)
        {
            this.CheckQueryableType(queryableType);
            this.QueryableType = queryableType;
        }

        private void CheckQueryableType(Type queryableType)
        {
            TypeInfo typeInfo = queryableType.GetTypeInfo();
            if (!typeInfo.IsGenericTypeDefinition)
            {
                string message = string.Format("Expected the generic type definition of an implementation of IQueryable<T>, but was '{0}'.", queryableType);
                throw new ArgumentException(message, "queryableType");
            }
            int num = typeInfo.GenericTypeParameters.Length;
            if (num > 2)
            {
                string message2 = string.Format("Expected the generic type definition of an implementation of IQueryable<T> with exactly one type argument, but found {0} arguments on '{1}.", num, queryableType);
                throw new ArgumentException(message2, "queryableType");
            }
        }

        /// <summary>
        /// Creates a new <see cref="T:System.Linq.IQueryable" /> (of type <see cref="P:Remotion.Linq.DefaultQueryProvider.QueryableType" /> with <typeparamref name="T" /> as its generic argument) that
        /// represents the query defined by <paramref name="expression" /> and is able to enumerate its results.
        /// </summary>
        /// <param name="expression">An expression representing the query for which a <see cref="T:System.Linq.IQueryable`1" /> should be created.</param>
        /// <returns>An <see cref="T:System.Linq.IQueryable`1" /> that represents the query defined by <paramref name="expression" />.</returns>
        internal new IQueryable<TEntity> CreateQuery(Expression expression)
        {
            return (IQueryable<TEntity>)Activator.CreateInstance(this.QueryableType.MakeGenericType(new Type[]
            {
                typeof(TEntity),
                typeof(TContext)
            }), new object[]
            {
                this,
                expression
            });
        }

        public override IQueryable<T> CreateQuery<T>(Expression expression)
        {
            return (IQueryable<T>)CreateQuery(expression);
        }
    }
}
