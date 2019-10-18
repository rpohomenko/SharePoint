using Microsoft.SharePoint.Client;
using SP.Client.Linq;
using SP.Client.Linq.Provisioning;

namespace SP.ProjectTaskWeb.Models
{
    public class ProjectTaskProvisionModel<TContext> : SpProvisionModel<TContext, ProjectTask>
          where TContext : class, ISpEntryDataContext
    {
        public ProjectTaskProvisionModel(TContext context)
           : base(context)
        {

        }

        public override void Provision(bool forceOverwrite = false, ProvisionLevel level = ProvisionLevel.Default)
        {
            var model = new ProjectProvisionModel<TContext>(Context);
            model.Provision(forceOverwrite, level);

            base.Provision(forceOverwrite, level);
        }

        public override void UnProvision(bool ignoreErrors = false, ProvisionLevel level = ProvisionLevel.Default)
        {
            base.UnProvision(ignoreErrors, level);

            var model = new ProjectProvisionModel<TContext>(Context);
            model.UnProvision(ignoreErrors, level);
        }

        protected override void ListHandler_OnProvisioning(ListProvisionHandler<TContext, ProjectTask> handler, List list)
        {
            base.ListHandler_OnProvisioning(handler, list);
        }

        protected override void ContentTypeHandler_OnProvisioning(ContentTypeProvisionHandler<TContext, ProjectTask> handler, ContentType contentType)
        {
            base.ContentTypeHandler_OnProvisioning(handler, contentType);
        }

        protected override void FieldHandler_OnProvisioning(FieldProvisionHandler<TContext, ProjectTask> handler, Field field)
        {
            base.FieldHandler_OnProvisioning(handler, field);
        }

    }
}
