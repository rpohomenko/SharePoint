using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace SP.ProjectTaskWeb.Filters
{
  public class AuthorizeFilterAttribute : AuthorizeAttribute
  {
    protected override bool AuthorizeCore(HttpContextBase httpContext)
    {
      return httpContext.Request.IsAuthenticated;
    }

    protected override void HandleUnauthorizedRequest(AuthorizationContext filterContext)
    {
      if (filterContext.HttpContext.Request.RequestType == "POST")
      {
        filterContext.Result = new RedirectResult($"~/login?{filterContext.HttpContext.Request.QueryString}", true);
      }
      else
      {
        //base.HandleUnauthorizedRequest(filterContext);
      }
    }
  }
}