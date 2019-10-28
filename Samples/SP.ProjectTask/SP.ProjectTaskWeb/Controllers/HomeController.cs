using Microsoft.SharePoint.Client;
using SharePoint.Authentication;
using SP.ProjectTaskWeb.Models;
using System.Threading.Tasks;
using System.Web.Mvc;

namespace SP.ProjectTaskWeb.Controllers
{
    [Authorize]
  public class HomeController : Controller
  {
    private readonly LowTrustTokenHelper _lowTrustTokenHelper;
    public HomeController(LowTrustTokenHelper lowTrustTokenHelper)
    {
      _lowTrustTokenHelper = lowTrustTokenHelper;
    }

    public async Task<ActionResult> Index()
    {
      using (ClientContext context = new Authentication.LowTrustTokenHelper(_lowTrustTokenHelper).GetUserClientContext())
      {
        var web = context.Web;
        var user = context.Web.CurrentUser;
        Site site = context.Site;
        context.Load(site);
        context.Load(web);
        context.Load(user);
        context.Load(web, w => w.EffectiveBasePermissions);
        context.Load(web.RegionalSettings);
        context.Load(web.RegionalSettings.TimeZone);
        await context.ExecuteQueryAsync();

        ViewBag.User = new SPUserInformation(user);
        ViewBag.FormDigest = context.GetFormDigestDirect().DigestValue;
        SPPageContextInfo pageContextInfo = new SPPageContextInfo(site, web, false);
        ViewBag.PageContextInfo = pageContextInfo;
      }

      return View();
    }
  }
}
