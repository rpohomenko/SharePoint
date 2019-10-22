using System;
using System.Configuration;
using Microsoft.SharePoint.Client;
using SharePoint.Authentication.Owin.Extensions;

namespace SP.ProjectTaskWeb.Authentication
{
  internal class LowTrustTokenHelper
  {
    private readonly SharePoint.Authentication.LowTrustTokenHelper _tokenHelper;
    private static readonly string SPHostUrl = ConfigurationManager.AppSettings["auth:SPHostUrl"];

    public LowTrustTokenHelper(SharePoint.Authentication.LowTrustTokenHelper tokenHelper)
    {
      _tokenHelper = tokenHelper;
    }

    public ClientContext GetUserClientContext()
    {
#if DEBUG
      try
      {
        return _tokenHelper.CreateClientContext();
      }
      catch (SharePoint.Authentication.Exceptions.SharePointAuthenticationException)
      {
        if (!string.IsNullOrEmpty(SPHostUrl))
        {
          return GetAppOnlyClienContext(SPHostUrl);
        }
        throw;
      }
#else
      return _tokenHelper.CreateClientContext();
#endif
    }

    public ClientContext GetAppOnlyClienContext(string spHostUrl)
    {
      if (_tokenHelper == null) return null;
      if (string.IsNullOrEmpty(spHostUrl)) return null;
      var targetUrl = new Uri(spHostUrl);
      string realm = _tokenHelper.GetRealmFromTargetUrl(targetUrl);
      var token = _tokenHelper.GetAppOnlyAccessToken(SharePoint.Authentication.TokenHelper.SharePointPrincipal, targetUrl.Authority, realm).AccessToken;
      return _tokenHelper.GetClientContextWithAccessToken(spHostUrl, token);
    }
  }
}