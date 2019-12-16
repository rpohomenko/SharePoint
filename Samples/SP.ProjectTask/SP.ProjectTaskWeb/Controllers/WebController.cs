using Microsoft.SharePoint.Client;
using SharePoint.Authentication;
using SP.Client.Linq;
using SP.ProjectTaskWeb.Models;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using System.Linq.Dynamic.Core;
using System.Runtime.Serialization;
using System;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Threading;
using System.Text;
using Newtonsoft.Json;
using System.Net.Http.Headers;
using Microsoft.SharePoint.Client.Utilities;
using System.Linq.Expressions;
using System.Linq.Dynamic.Core.CustomTypeProviders;

namespace SP.ProjectTaskWeb.Controllers
{
  public class CustomTypeProvider : DefaultDynamicLinqCustomTypeProvider
  {
    public override HashSet<Type> GetCustomTypes() => new[] { typeof(Extensions) }.ToHashSet();
  }

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
      var config = ParsingConfig.Default;
      config.DateTimeIsParsedAsUTC = true;
      config.CustomTypeProvider = new CustomTypeProvider();
    }

    [Route("tasks/{id}")]
    [HttpGet]
    public IHttpActionResult GetProjectTask(int id)
    {
      return GetItemResult<ProjectTask>(id);
    }

    [Route("tasks")]
    [HttpGet]
    public IHttpActionResult GetProjectTasks([FromUri] string where = null, [FromUri] int count = 0, [FromUri] string sortBy = null, [FromUri] bool sortDesc = false, [FromUri] string pagingToken = null, [FromUri] string[] fields = null)
    {
      return GetDataResult<ProjectTask>(where, count, sortBy, sortDesc, pagingToken, fields);
    }

    [Route("tasks")]
    [HttpPost]
    public IHttpActionResult CreateTask([FromBody]ProjectTask task)
    {
      return AddEntity(task);
    }

    [Route("tasks")]
    [HttpPut]
    public IHttpActionResult UpdateTask([FromBody] ProjectTask task)
    {
      return UpdateEntity(task);
    }

    [Route("tasks")]
    [HttpDelete]
    public IHttpActionResult DeleteTask([FromUri] string ids)
    {
      var itemIds = ids.Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries).Select(id => Convert.ToInt32(id));
      return Delete<ProjectTask>(itemIds);
    }

    [Route("projects/{id}")]
    [HttpGet]
    public IHttpActionResult GetProject(int id)
    {
      return GetItemResult<Project>(id);
    }

    [Route("projects")]
    [HttpGet]
    public IHttpActionResult GetProjects([FromUri] string where = null, [FromUri] int count = 0, [FromUri] string sortBy = null, [FromUri] bool sortDesc = false, [FromUri] string pagingToken = null, [FromUri] string[] fields = null)
    {
      return GetDataResult<Project>(where, count, sortBy, sortDesc, pagingToken, fields);
    }

    [Route("projects")]
    [HttpPost]
    public IHttpActionResult CreateProject([FromBody]Project project)
    {
      return AddEntity(project);
    }

    [Route("projects")]
    [HttpPut]
    public IHttpActionResult UpdateProject([FromBody] Project project)
    {
      return UpdateEntity(project);
    }

    [Route("projects")]
    [HttpDelete]
    public IHttpActionResult DeleteProject([FromUri] string ids)
    {
      var itemIds = ids.Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries).Select(id => Convert.ToInt32(id));
      return Delete<Project>(itemIds);
    }

    [Route("employees/{id}")]
    [HttpGet]
    public IHttpActionResult GetEmployee(int id)
    {
      return GetItemResult<Employee>(id);
    }

    [Route("employees")]
    [HttpGet]
    public IHttpActionResult GetEmployees([FromUri] string where = null, [FromUri] int count = 0, [FromUri] string sortBy = null, [FromUri] bool sortDesc = false, [FromUri] string pagingToken = null, [FromUri] string[] fields = null)
    {
      return GetDataResult<Employee>(where, count, sortBy, sortDesc, pagingToken, fields);
    }

    [Route("employees")]
    [HttpPost]
    public IHttpActionResult CreateEmployee([FromBody]Employee employee)
    {
      return AddEntity(employee);
    }

    [Route("employees")]
    [HttpPut]
    public IHttpActionResult UpdateEmployee([FromBody] Employee employee)
    {
      return UpdateEntity(employee);
    }

    [Route("employees")]
    [HttpDelete]
    public IHttpActionResult DeleteEmployee([FromUri] string ids)
    {
      var itemIds = ids.Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries).Select(id => Convert.ToInt32(id));
      return Delete<Employee>(itemIds);
    }

    [Route("departments/{id}")]
    [HttpGet]
    public IHttpActionResult GetDepartment(int id)
    {
      return GetItemResult<Department>(id);
    }

    [Route("departments")]
    [HttpGet]
    public IHttpActionResult GetDepartments([FromUri] string where = null, [FromUri] int count = 0, [FromUri] string sortBy = null, [FromUri] bool sortDesc = false, [FromUri] string pagingToken = null, [FromUri] string[] fields = null)
    {
      return GetDataResult<Department>(where, count, sortBy, sortDesc, pagingToken, fields);
    }

    [Route("departments")]
    [HttpPost]
    public IHttpActionResult CreateDepartment([FromBody]Department department)
    {
      return AddEntity(department);
    }

    [Route("departments")]
    [HttpPut]
    public IHttpActionResult UpdateDepartment([FromBody] Department department)
    {
      return UpdateEntity(department);
    }

    [Route("departments")]
    [HttpDelete]
    public IHttpActionResult DeleteDepartment([FromUri] string ids)
    {
      var itemIds = ids.Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries).Select(id => Convert.ToInt32(id));
      return Delete<Department>(itemIds);
    }

    [Route("users")]
    [HttpGet]
    public IHttpActionResult GetAllUsers()
    {
      try
      {
        var users = GetSiteUsers().Select(user => new SPUserInformation(user));
        return Json(users);
      }
      catch (Exception ex)
      {
        return new JsonErrorResult(ex);
      }
    }

    [Route("users/{searchTerm}/{limit}")]
    [HttpGet]
    public IHttpActionResult GetUsers(string searchTerm, int limit = 10)
    {
      try
      {
        if (!string.IsNullOrEmpty(searchTerm))
        {
          //var result = this.GetSiteUsers()
          //.Where(user => user.Title.ToUpper().Contains(searchTerm.ToUpper()) || user.LoginName.ToUpper().Contains(searchTerm.ToUpper()))
          //.Select(user => new SPUserInformation(user));
          var result = this.GetUserPrincipals(searchTerm, limit).Select(principal => new SPUserInformation(principal));
          return Json(result);
        }
        return Json(new string[0]);
      }
      catch (Exception ex)
      {
        return new JsonErrorResult(ex);
      }
    }

    [HttpGet]
    [Route("users/photo/{accountName}/{size}")]
    public HttpResponseMessage GetUserPhoto(string accountName, string size = "M")
    {
      using (var client = new WebClient())
      {
        //client.Headers.Add("X-FORMS_BASED_AUTH_ACCEPTED", "f");
        using (ClientContext context = new Authentication.LowTrustTokenHelper(_tokenHelper).GetUserClientContext())
        {
          string accessToken = Helper.GetAccessToken(context);
          if (!string.IsNullOrEmpty(accessToken))
          {
            client.Headers.Add(HttpRequestHeader.Authorization, new AuthenticationHeaderValue("Bearer", accessToken).ToString());
          }
          string pictureUrl = null;
          string userPhotoUrl = $"{context.Url.TrimEnd('/')}/_layouts/15/userphoto.aspx?accountname={System.Web.HttpUtility.UrlEncode(accountName)}&size={size}&url={System.Web.HttpUtility.UrlEncode(pictureUrl)}";
          //$"{context.Url.TrimEnd('/')}/_vti_bin/DelveApi.ashx/people/profileimage?userId={System.Web.HttpUtility.UrlEncode(accountName)}&size={size}"
          var userPhoto = client.DownloadData(userPhotoUrl);
          var response = new HttpResponseMessage(HttpStatusCode.OK)
          {
            Content = new ByteArrayContent(userPhoto) //new StringContent($"data:image/png;base64,{Convert.ToBase64String(userPhoto)}")
          };

          response.Content.Headers.ContentType = new MediaTypeHeaderValue("image/png");
          return response;
        }
      }
    }

    [Route("deploy")]
    [HttpPost]
    public IHttpActionResult Deploy()
    {
      try
      {
        using (ClientContext context = new Authentication.LowTrustTokenHelper(_tokenHelper).GetUserClientContext())
        {
          ProjectTaskContext projectTaskContext = new ProjectTaskContext(context);
          ProjectTaskProvisionModel<SpDataContext> projectTaskProvisionModel = projectTaskContext.CreateModel();
          projectTaskProvisionModel.UnProvision(true);
          projectTaskProvisionModel.Provision();
          Helper.SetAppInstalled(context, true);
          return Json(new { ok = true });
        }
      }

      catch (Exception ex)
      {
        return new JsonErrorResult(ex);
      }
    }

    [Route("retract")]
    [HttpPost]
    public IHttpActionResult Retract()
    {
      try
      {
        using (ClientContext context = new Authentication.LowTrustTokenHelper(_tokenHelper).GetUserClientContext())
        {
          ProjectTaskContext projectTaskContext = new ProjectTaskContext(context);
          ProjectTaskProvisionModel<SpDataContext> projectTaskProvisionModel = projectTaskContext.CreateModel();
          projectTaskProvisionModel.UnProvision();
          Helper.SetAppInstalled(context, false);
          return Json(new { ok = true });
        }
      }
      catch (Exception ex)
      {
        return new JsonErrorResult(ex);
      }
    }

    private UserCollection GetSiteUsers()
    {
      using (ClientContext context = new Authentication.LowTrustTokenHelper(_tokenHelper).GetUserClientContext())
      {
        var users = context.Web.SiteUsers;
        context.Load(users, user => user.Include(u => u.Title, u => u.LoginName, u => u.Email, u => u.UserPrincipalName, u => u.Id));
        context.ExecuteQuery();
        return users;
      }
    }

    private IList<PrincipalInfo> GetUserPrincipals(string input, int limit)
    {
      using (ClientContext context = new Authentication.LowTrustTokenHelper(_tokenHelper).GetUserClientContext())
      {
        var users = Utility.SearchPrincipals(context, context.Web, input, PrincipalType.User, PrincipalSource.UserInfoList, context.Web.SiteUsers, limit);
        context.ExecuteQuery();
        return users;
      }
    }

    private IHttpActionResult GetItemResult<TEntity>(int id) where TEntity : ListItemEntity, new()
    {
      try
      {
        using (ClientContext context = new Authentication.LowTrustTokenHelper(_tokenHelper).GetUserClientContext())
        {
          var projectTaskContext = new ProjectTaskContext(context);
          var result = (id > 0) ? projectTaskContext.List<TEntity>().WithPermissions().FirstOrDefault((TEntity item) => item.Id == id) : null;
          if (result == null)
          {
            throw new Exception($"Item with Id={id} not found.");
          }
          return Json(result);
        }
      }
      catch (Exception ex)
      {
        return new JsonErrorResult(ex);
      }
    }

    private IHttpActionResult GetDataResult<TEntity>(string where, int count, string sortBy, bool sortDesc, string pagingToken, string[] fields = null)
      where TEntity : ListItemEntity, new()
    {
      try
      {
        using (ClientContext context = new Authentication.LowTrustTokenHelper(_tokenHelper).GetUserClientContext())
        {
          var result = new DataResult<TEntity>();
          result.Load(context, where, count, sortBy, sortDesc, pagingToken, fields);
          return Json(result);
        }
      }
      catch (Exception ex)
      {
        return new JsonErrorResult(ex);
      }
    }

    private IHttpActionResult AddEntity<TEntity>(TEntity entity)
        where TEntity : ListItemEntity, new()
    {
      try
      {
        if (entity == null)
        {
          throw new ArgumentNullException(nameof(entity));
        }
        using (ClientContext context = new Authentication.LowTrustTokenHelper(_tokenHelper).GetUserClientContext())
        {
          var projectTaskContext = new ProjectTaskContext(context);
          var entry = projectTaskContext.List<TEntity>().AddOrUpdate(entity, 0);
          projectTaskContext.SaveChanges();
          return Json(entry.Entity);
        }
      }
      catch (Exception ex)
      {
        return new JsonErrorResult(ex);
      }
    }

    private IHttpActionResult UpdateEntity<TEntity>(TEntity entity)
       where TEntity : ListItemEntity, new()
    {
      try
      {
        if (entity == null)
        {
          throw new ArgumentNullException(nameof(entity));
        }
        using (ClientContext context = new Authentication.LowTrustTokenHelper(_tokenHelper).GetUserClientContext())
        {
          var projectTaskContext = new ProjectTaskContext(context);
          if (entity.Id > 0)
          {
            var entry = projectTaskContext.List<TEntity>().WithPermissions().AddOrUpdate(entity);
            projectTaskContext.SaveChanges();
            return Json(entry.Entity);
          }
          else
          {
            throw new Exception($"Cannot update the item with ID={entity.Id}.");
          }
        }
      }
      catch (Exception ex)
      {
        return new JsonErrorResult(ex);
      }
    }

    private IHttpActionResult Delete<TEntity>(IEnumerable<int> itemIds)
        where TEntity : ListItemEntity, new()
    {
      try
      {
        if (itemIds == null)
        {
          throw new ArgumentNullException(nameof(itemIds));
        }
        using (ClientContext context = new Authentication.LowTrustTokenHelper(_tokenHelper).GetUserClientContext())
        {
          var projectTaskContext = new ProjectTaskContext(context);
          bool result = projectTaskContext.List<TEntity>().Delete(itemIds.ToArray());
          projectTaskContext.SaveChanges();
          return Json(result);
        }
      }
      catch (Exception ex)
      {
        return new JsonErrorResult(ex);
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

      [DataMember(Name = "_canAddListItems")]
      public bool CanAddListItems
      {
        get; private set;
      }

      private TEntity[] GetItems(ClientContext context, string where, int count, string sortBy, bool sortDesc, string pagingToken, string[] fields, out string nextPageToken, out bool canCreate)
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

        if (fields != null && fields.Length > 0)
        {
          var param = Expression.Parameter(typeof(TEntity), "entity");
          var props = fields.Select(field => Expression.PropertyOrField(param, field));
          var predicates = props.Select(prop => Expression.Lambda<Func<TEntity, object>>(Expression.Convert(prop, typeof(object)), param));
          source = source.Include(predicates.ToArray());
        }

        string pageToken = null;
        source = source.WithEvent(null, nextToken =>
        {
          pageToken = nextToken;
        });

        source = source.WithPermissions();
        var result = source.ToArray();
        nextPageToken = pageToken;
        canCreate = source.HasPermission(PermissionKind.AddListItems);
        return result;
      }

      public void Load(ClientContext context, string where = null, int count = 0, string sortBy = null, bool sortDesc = false, string pagingToken = null, string[] fields = null)
      {
        string nextToken;
        bool canCreate;
        Items = GetItems(context, where, count, sortBy, sortDesc, pagingToken, fields, out nextToken, out canCreate);
        NextToken = nextToken;
        CanAddListItems = canCreate;
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