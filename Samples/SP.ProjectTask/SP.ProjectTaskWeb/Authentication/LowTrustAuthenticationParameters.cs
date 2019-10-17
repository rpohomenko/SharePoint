using System.Configuration;

namespace SP.ProjectTaskWeb.Authentication
{
    public class LowTrustAuthenticationParameters : SharePoint.Authentication.LowTrustAuthenticationParameters
    {
        public sealed override string ClientId { get; set; }

        public sealed override string ClientSecret { get; set; }

        public LowTrustAuthenticationParameters()
        {
            ClientId = ConfigurationManager.AppSettings["auth:LowTrustClientId"];
            ClientSecret = ConfigurationManager.AppSettings["auth:LowTrustClientSecret"];
        }
    }
}