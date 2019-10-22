using Microsoft.SharePoint.Client;
using SharePoint.Authentication;
using SharePoint.Authentication.Owin.Extensions;
using SP.Client.Linq;
using SP.ProjectTaskWeb.Models;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using System.Linq.Dynamic.Core;

namespace SP.ProjectTaskWeb.Controllers
{
#if !DEBUG
  [Authorize]
#endif
  [RoutePrefix("api/web")]
  public class WebController : ApiController
  {

    private readonly LowTrustTokenHelper _tokenHelper;

    public WebController(LowTrustTokenHelper lowTrustTokenHelper)
    {
      _tokenHelper = lowTrustTokenHelper;
    }

    [Route("tasks/{id}")]
    [HttpGet]
    public IHttpActionResult GetProjectTask(int id)
    {
      ProjectTask item = GetItem<ProjectTask>(id);
      return Json(item);
    }

    [Route("tasks")]
    [HttpGet]
    public IHttpActionResult GetProjectTasks([FromUri] string where = null, [FromUri] int count = 0, [FromUri] string sortBy = null, [FromUri] bool sortDesc = false)
    {
      IEnumerable<ProjectTask> items = GetItems<ProjectTask>(where, count, sortBy, sortDesc);
      return Json(items);
    }

    [Route("projects/{id}")]
    [HttpGet]
    public IHttpActionResult GetProject(int id)
    {
      Project item = GetItem<Project>(id);
      return Json(item);
    }

    [Route("projects")]
    [HttpGet]
    public IHttpActionResult GetProjects([FromUri] string where = null, [FromUri] int count = 0, [FromUri] string sortBy = null, [FromUri] bool sortDesc = false)
    {
      IEnumerable<Project> items = GetItems<Project>(where, count, sortBy, sortDesc);
      return Json(items);
    }

    [Route("employees/{id}")]
    [HttpGet]
    public IHttpActionResult GetEmployee(int id)
    {
      Employee item = GetItem<Employee>(id);
      return Json(item);
    }

    [Route("employees")]
    [HttpGet]
    public IHttpActionResult GetEmployees([FromUri] string where = null, [FromUri] int count = 0, [FromUri] string sortBy = null, [FromUri] bool sortDesc = false)
    {
      IEnumerable<Employee> items = GetItems<Employee>(where, count, sortBy, sortDesc);
      return Json(items);
    }

    [Route("departments/{id}")]
    [HttpGet]
    public IHttpActionResult GetDepartment(int id)
    {
      Department item = GetItem<Department>(id);
      return Json(item);
    }

    [Route("departments")]
    [HttpGet]
    public IHttpActionResult GetDepartments([FromUri] string where = null, [FromUri] int count = 0, [FromUri] string sortBy = null, [FromUri] bool sortDesc = false)
    {
      IEnumerable<Department> items = GetItems<Department>(where, count, sortBy, sortDesc);
      return Json(items);
    }

    private TEntity GetItem<TEntity>(int id) where TEntity : ListItemEntity, new()
    {
      using (ClientContext context = new Authentication.LowTrustTokenHelper(_tokenHelper).GetUserClientContext())
      {
        ProjectTaskContext projectTaskContext = new ProjectTaskContext(context);
        return (id > 0) ? projectTaskContext.List<TEntity>().FirstOrDefault((TEntity item) => item.Id == id) : null;
      }
    }

    private IEnumerable<TEntity> GetItems<TEntity>(string where = null, int count = 0, string sortBy = null, bool sortDesc = false) where TEntity : ListItemEntity, new()
    {
      using (ClientContext context = new Authentication.LowTrustTokenHelper(_tokenHelper).GetUserClientContext())
      {
        ProjectTaskContext projectTaskContext = new ProjectTaskContext(context);
        IQueryable<TEntity> source = projectTaskContext.List<TEntity>();
        if (!string.IsNullOrWhiteSpace(where))
        {
          source = source.Where(where);
        }
        if (!string.IsNullOrWhiteSpace(sortBy))
        {
          source = source.OrderBy(sortDesc ? (sortBy + " DESC") : sortBy);
        }
        if (count <= 0 || count > 10000)
        {
          count = 100;
        }
        source = source.Take(count);
        return source.ToArray();
      }
    }

    [Route("deploy")]
    [HttpPost]
    public void Deploy()
    {
      using (ClientContext context = _tokenHelper.CreateClientContext())
      {
        ProjectTaskContext projectTaskContext = new ProjectTaskContext(context);
        ProjectTaskProvisionModel<SpDataContext> projectTaskProvisionModel = projectTaskContext.CreateModel();
        projectTaskProvisionModel.UnProvision();
        projectTaskProvisionModel.Provision();
      }
    }
  }
}