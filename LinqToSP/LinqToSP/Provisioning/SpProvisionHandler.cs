namespace SP.Client.Linq.Provisioning
{
    public abstract class SpProvisionHandler<TContext, TEntity>
        where TContext : class, ISpEntryDataContext
        where TEntity : class, IListItemEntity
    {
        protected SpProvisionHandler(SpProvisionModel<TContext, TEntity> model)
        {
            Model = model;
        }

        public SpProvisionModel<TContext, TEntity> Model { get; }

        public abstract void Provision(bool forceOverwrite);

        public abstract void UnProvision();

    }
}
