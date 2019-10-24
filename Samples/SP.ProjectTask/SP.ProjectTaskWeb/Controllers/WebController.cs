using Microsoft.SharePoint.Client;
using SharePoint.Authentication;
using SharePoint.Authentication.Owin.Extensions;
using SP.Client.Linq;
using SP.ProjectTaskWeb.Models;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using System.Linq.Dynamic.Core;
using System.Runtime.Serialization;
using System;
using System.Net;
using System.Web.Http.Results;
using System.Net.Http;
using System.Threading.Tasks;
using System.Threading;
using System.Text;
using Newtonsoft.Json;

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
      return GetItemResult<ProjectTask>(id);
    }

    [Route("tasks")]
    [HttpGet]
    public IHttpActionResult GetProjectTasks([FromUri] string where = null, [FromUri] int count = 0, [FromUri] string sortBy = null, [FromUri] bool sortDesc = false, [FromUri] string pagingToken = null)
    {
      return GetDataResult<ProjectTask>(where, count, sortBy, sortDesc, pagingToken);
    }

    [Route("projects/{id}")]
    [HttpGet]
    public IHttpActionResult GetProject(int id)
    {
      return GetItemResult<Project>(id);
    }

    [Route("projects")]
    [HttpGet]
    public IHttpActionResult GetProjects([FromUri] string where = null, [FromUri] int count = 0, [FromUri] string sortBy = null, [FromUri] bool sortDesc = false, [FromUri] string pagingToken = null)
    {
      return GetDataResult<Project>(where, count, sortBy, sortDesc, pagingToken);
    }

    [Route("employees/{id}")]
    [HttpGet]
    public IHttpActionResult GetEmployee(int id)
    {
      return GetItemResult<Employee>(id);
    }

    [Route("employees")]
    [HttpGet]
    public IHttpActionResult GetEmployees([FromUri] string where = null, [FromUri] int count = 0, [FromUri] string sortBy = null, [FromUri] bool sortDesc = false, [FromUri] string pagingToken = null)
    {
      return GetDataResult<Employee>(where, count, sortBy, sortDesc, pagingToken);
    }

    [Route("departments/{id}")]
    [HttpGet]
    public IHttpActionResult GetDepartment(int id)
    {
      return GetItemResult<Department>(id);
    }

    [Route("departments")]
    [HttpGet]
    public IHttpActionResult GetDepartments([FromUri] string where = null, [FromUri] int count = 0, [FromUri] string sortBy = null, [FromUri] bool sortDesc = false, [FromUri] string pagingToken = null)
    {
      return GetDataResult<Department>(where, count, sortBy, sortDesc, pagingToken);
    }

    private IHttpActionResult GetItemResult<TEntity>(int id) where TEntity : ListItemEntity, new()
    {
      try
      {
        using (ClientContext context = new Authentication.LowTrustTokenHelper(_tokenHelper).GetUserClientContext())
        {
          ProjectTaskContext projectTaskContext = new ProjectTaskContext(context);
          return Json((id > 0) ? projectTaskContext.List<TEntity>().FirstOrDefault((TEntity item) => item.Id == id) : null);
        }
      }
      catch (Exception ex)
      {
        return new JsonErrorResult(ex);
      }
    }

    private IHttpActionResult GetDataResult<TEntity>(string where, int count, string sortBy, bool sortDesc, string pagingToken)
      where TEntity : ListItemEntity, new()
    {
      try
      {
        using (ClientContext context = new Authentication.LowTrustTokenHelper(_tokenHelper).GetUserClientContext())
        {
          var result = new DataResult<TEntity>();
          result.Load(context, where, count, sortBy, sortDesc, pagingToken);
          return Json(result);
        }
      }
      catch (Exception ex)
      {
        return new JsonErrorResult(ex);
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

    [DataContract(Name = "data")]
    internal class DataResult<TEntity>
      where TEntity : ListItemEntity, new()
    {
      [DataMember(Name = "items")]
      public ICollection<TEntity> Items { get; set; }
      [DataMember(Name = "_nextPageToken")]
      public string NextToken { get; set; }

      private TEntity[] GetItems(ClientContext context, string where, int count, string sortBy, bool sortDesc, string pagingToken, out string nextPageToken)
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

        if (!string.IsNullOrEmpty(pagingToken))
        {
          source = source.Paged(pagingToken, count);
        }
        else
        {
          source = source.Take(count);
        }

        string pageToken = null;
        source = source.WithEvent(null, nextToken =>
        {
          pageToken = nextToken;
        });

        var result = source.ToArray();
        nextPageToken = pageToken;
        return result;
      }

      public void Load(ClientContext context, string where = null, int count = 0, string sortBy = null, bool sortDesc = false, string pagingToken = null)
      {
        string nextToken;
        Items = GetItems(context, where, count, sortBy, sortDesc, pagingToken, out nextToken);
        NextToken = nextToken;
      }
    }
  }

  public class JsonErrorResult : IHttpActionResult
  {
    private Exception _exception;

    public JsonErrorResult(Exception exception)
    {
      this._exception = exception;
    }

    public Task<HttpResponseMessage> ExecuteAsync(CancellationToken cancellationToken)
    {
      var response = new HttpResponseMessage(HttpStatusCode.BadRequest);
      var content = new StringContent(JsonConvert.SerializeObject(
        new { message = _exception.Message, stackTrace = _exception.StackTrace }),
        Encoding.UTF8, "application/json");
      response.Content = content;
      return Task.FromResult(response);
    }
  }
}