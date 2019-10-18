using SharePoint.Authentication;
using SharePoint.Authentication.Owin.Extensions;
using SP.ProjectTaskWeb.Models;
using System.Linq;
using System.Web.Http;

namespace SP.ProjectTaskWeb.Controllers
{
    [System.Web.Mvc.Authorize]
    [RoutePrefix("api/web")]
    public class WebController : ApiController
    {
        private readonly LowTrustTokenHelper _tokenHelper;

        public WebController(LowTrustTokenHelper lowTrustTokenHelper)
        {
            _tokenHelper = lowTrustTokenHelper;
        }

        // GET api/web/tasks/{id}
        [Route("tasks/{id}")]
        [HttpGet]
        public ProjectTask GetProjectTask(int id)
        {
            using (var context = _tokenHelper.CreateClientContext())
            {
                var ctx = new ProjectTaskContext(context);
                return id > 0 ? ctx.List<ProjectTask>().FirstOrDefault(item => item.Id == id) : null;
            }
        }

        // POST api/web/deploy
        [Route("deploy")]
        //[HttpGet]
        [HttpPost]
        public void Deploy()
        {
            using (var context = _tokenHelper.CreateClientContext())
            {
                var ctx = new ProjectTaskContext(context);
                var model = ctx.CreateModel();
                model.UnProvision();
                model.Provision();
            }
        }
    }
}