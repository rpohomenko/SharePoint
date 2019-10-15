namespace SP.Client.Linq.Provisioning
{
    public abstract class SpProvisionHandler<TContext, TEntity>
        where TContext : class, ISpEntryDataContext
        where TEntity : class, IListItemEntity, new()
    {
        protected SpProvisionHandler(SpProvisionModel<TContext, TEntity> model)
        {
            Model = model;
        }

        public SpProvisionModel<TContext, TEntity> Model { get; }

        public abstract void Provision(bool forceOverwrite, ProvisionLevel level);

        public abstract void UnProvision(ProvisionLevel level);

    }
}
