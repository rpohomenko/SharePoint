using SharePoint.Authentication;
using SharePoint.Authentication.Owin.Extensions;
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
            using (var context = _lowTrustTokenHelper.CreateClientContext())
            {
                var web = context.Web;
                var user = context.Web.CurrentUser;

                context.Load(web, w => w.Title);
                context.Load(user, u => u.Title);

                await context.ExecuteQueryAsync();

                ViewBag.SiteTitle = web.Title;
                ViewBag.UserName = user.Title;
            }

            return View();
        }

        public ActionResult About()
        {
            ViewBag.Message = "Your application description page.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }
    }
}
