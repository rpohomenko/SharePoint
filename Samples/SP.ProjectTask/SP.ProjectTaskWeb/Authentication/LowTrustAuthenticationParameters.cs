﻿using System;
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
      ClientId = ConfigurationManager.AppSettings["auth:LowTrustClientId"];
      ClientSecret = ConfigurationManager.AppSettings["auth:LowTrustClientSecret"];
      CacheSessionDurationInMinutes = ConfigurationManager.AppSettings["auth:TokenCacheDurationInMinutes"] == null ? 10
        : Convert.ToInt32(ConfigurationManager.AppSettings["auth:CacheSessionDurationInMinutes"]);
    }
  }
}