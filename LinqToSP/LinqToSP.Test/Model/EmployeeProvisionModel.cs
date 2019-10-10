using Microsoft.SharePoint.Client;
using SP.Client.Linq;
using SP.Client.Linq.Provisioning;

namespace LinqToSP.Test.Model
{
    internal class EmployeeProvisionModel<TContext> : SpProvisionModel<TContext, Employee>
          where TContext : class, ISpEntryDataContext
    {
        public EmployeeProvisionModel(TContext context)
           : base(context)
        {

        }

        public override void Provision(bool forceOverwrite = false)
        {
            var model = (Context as SpDataContext).CreateModel<Department>();
            model.Provision(forceOverwrite);

            base.Provision(forceOverwrite);
        }

        public override void UnProvision(bool ignoreErrors = false)
        {
            base.UnProvision(ignoreErrors);

            var model = (Context as SpDataContext).CreateModel<Department>();
            model.UnProvision(ignoreErrors);
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
