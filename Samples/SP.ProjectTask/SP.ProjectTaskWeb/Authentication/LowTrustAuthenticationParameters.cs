using System;
using System.Configuration;

namespace SP.ProjectTaskWeb.Authentication
{
  public class LowTrustAuthenticationParameters : SharePoint.Authentication.LowTrustAuthenticationParameters
  {
    public sealed override string ClientId { get; set; }

    public sealed override string ClientSecret { get; set; }

    public int CacheSessionDurationInMinutes { get; set; }

    public LowTrustAuthenticationParameters()
    {
      ClientId = ConfigurationManager.AppSettings["app:LowTrustClientId"];
      ClientSecret = ConfigurationManager.AppSettings["app:LowTrustClientSecret"];
      CacheSessionDurationInMinutes = Convert.ToInt32(ConfigurationManager.AppSettings["app:CacheSessionDurationInMinutes"]);
    }
  }
}