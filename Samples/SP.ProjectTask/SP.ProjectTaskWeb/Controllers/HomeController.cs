using Microsoft.SharePoint.Client;
using SharePoint.Authentication;
using SP.ProjectTaskWeb.Filters;
using SP.ProjectTaskWeb.Models;
using System.Globalization;
using System.Threading.Tasks;
using System.Web.Mvc;

namespace SP.ProjectTaskWeb.Controllers
{
  //[Authorize]
  [AuthorizeFilter]
  public class HomeController : Controller
  {
    private readonly LowTrustTokenHelper _lowTrustTokenHelper;
    public HomeController(LowTrustTokenHelper lowTrustTokenHelper)
    {
      _lowTrustTokenHelper = lowTrustTokenHelper;
    }

    private async Task LoadData(ClientContext context)
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

      //ViewBag.FormDigest = context.GetFormDigestDirect().DigestValue;
      SPPageContextInfo pageContextInfo = new SPPageContextInfo(site, web, false);
      ViewBag.PageContextInfo = pageContextInfo;

      CultureInfo webCulture = new CultureInfo((int)pageContextInfo.RegionalInfo.LocaleId);
      CultureInfo.DefaultThreadCurrentCulture = webCulture;
      CultureInfo.DefaultThreadCurrentUICulture = webCulture;
      CultureInfo.CurrentCulture = webCulture;
      ViewBag.CurrentCulture = new CultureInformation(CultureInfo.CurrentCulture);
    }

    public async Task<ActionResult> Index()
    {
      using (ClientContext userContext = new Authentication.LowTrustTokenHelper(_lowTrustTokenHelper).GetUserClientContext())
      {
        using (ClientContext context = new Authentication.LowTrustTokenHelper(_lowTrustTokenHelper).GetAppOnlyClienContext(userContext.Url))
        {
          ViewBag.IsAppInstalled = true;
          await LoadData(userContext);
          return View();
          //if (await Helper.IsAppInstalled(context))
          //{
          //    ViewBag.IsAppInstalled = true;
          //    await LoadData(userContext);
          //    return View();
          //}
          //else
          //{
          //    await Task.FromResult(0);
          //    return RedirectToAction("Admin");
          //}
        }
      }
    }

    public async Task<ActionResult> Admin()
    {
      using (ClientContext context = new Authentication.LowTrustTokenHelper(_lowTrustTokenHelper).GetUserClientContext())
      {
        await LoadData(context);
        ViewBag.IsAppInstalled = await Helper.IsAppInstalled(context);
        return View();
      }
    }
  }
}
