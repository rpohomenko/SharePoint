using Microsoft.SharePoint.Client;
using SharePoint.Authentication;
using SharePoint.Authentication.Owin;
using SharePoint.Authentication.Owin.Controllers;
using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Web.Http;

namespace SP.ProjectTaskWeb.Controllers
{
  [RoutePrefix("login")]
  [AllowAnonymous]
  public class LoginController : SharePointLoginController
  {
    private readonly LowTrustTokenHelper _lowTrustTokenHelper;
    private readonly HighTrustTokenHelper _highTrustTokenHelper;
    private readonly ISharePointSessionProvider _sharePointSessionProvider;
    private readonly HighTrustAuthenticationParameters _highTrustAuthenticationParameters;

    public override string LowTrustLandingPageUrl { get; } = "/";

    public LoginController(ISharePointSessionProvider sharePointSessionProvider, LowTrustTokenHelper lowTrustTokenHelper, HighTrustTokenHelper highTrustTokenHelper, HighTrustAuthenticationParameters highTrustAuthenticationParameters) : base(sharePointSessionProvider, lowTrustTokenHelper, highTrustTokenHelper, highTrustAuthenticationParameters)
    {
      _sharePointSessionProvider = sharePointSessionProvider;
      _highTrustTokenHelper = highTrustTokenHelper;
      _highTrustAuthenticationParameters = highTrustAuthenticationParameters;
      _lowTrustTokenHelper = lowTrustTokenHelper;
    }

    [HttpGet]
    [HttpPost]
    [Route]
    public override Task<HttpResponseMessage> LowTrustLoginAsync()
    {
      return base.LowTrustLoginAsync();
    }

    public override Task LowTrustPostAuthenticationAsync(ClientContext clientContext)
    {
      return base.LowTrustPostAuthenticationAsync(clientContext);
    }

    public override CookieHeaderValue GetCookieHeader(string cookieName, string cookieValue, string domain, DateTimeOffset expires, bool secure, bool httpOnly)
    {
      return base.GetCookieHeader(cookieName, cookieValue, domain, expires, secure, httpOnly);
    }
  }
}