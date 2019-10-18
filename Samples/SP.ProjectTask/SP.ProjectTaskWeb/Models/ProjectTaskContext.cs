using Microsoft.SharePoint.Client;
using SP.Client.Linq;

namespace SP.ProjectTaskWeb.Models
{
    public sealed class ProjectTaskContext : SpDataContext
    {
        public ProjectTaskContext(string siteUrl) : base(siteUrl)
        {

        }
        public ProjectTaskContext(ClientContext context) : base(context)
        {

        }
        public ProjectTaskProvisionModel<SpDataContext> CreateModel()
        {
            return new ProjectTaskProvisionModel<SpDataContext>(this);
        }
    }
}