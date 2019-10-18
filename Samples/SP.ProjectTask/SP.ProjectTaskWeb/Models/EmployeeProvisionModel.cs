using Microsoft.SharePoint.Client;
using SP.Client.Linq;
using SP.Client.Linq.Provisioning;

namespace SP.ProjectTaskWeb.Models
{
    public class EmployeeProvisionModel<TContext> : SpProvisionModel<TContext, Employee>
          where TContext : class, ISpEntryDataContext
    {
        public EmployeeProvisionModel(TContext context)
           : base(context)
        {
        }

        public override void Provision(bool forceOverwrite = false, ProvisionLevel level = ProvisionLevel.Default)
        {
            var model = Context.CreateModel<Department>();
            model.Provision(forceOverwrite, level);

            base.Provision(forceOverwrite, level);
        }

        public override void UnProvision(bool ignoreErrors = false, ProvisionLevel level = ProvisionLevel.Default)
        {
            base.UnProvision(ignoreErrors, level);

            var model = Context.CreateModel<Department>();
            model.UnProvision(ignoreErrors, level);
        }

        protected override void ListHandler_OnProvisioning(ListProvisionHandler<TContext, Employee> handler, List list)
        {
            base.ListHandler_OnProvisioning(handler, list);
        }

        protected override void ContentTypeHandler_OnProvisioning(ContentTypeProvisionHandler<TContext, Employee> handler, ContentType contentType)
        {
            base.ContentTypeHandler_OnProvisioning(handler, contentType);
        }

        protected override void FieldHandler_OnProvisioning(FieldProvisionHandler<TContext, Employee> handler, Field field)
        {
            base.FieldHandler_OnProvisioning(handler, field);
        }

    }
}
