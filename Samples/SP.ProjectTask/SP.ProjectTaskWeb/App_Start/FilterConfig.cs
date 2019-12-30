using SP.ProjectTaskWeb.Filters;
using System.Web.Mvc;

namespace SP.ProjectTaskWeb
{
  public class FilterConfig
  {
    public static void RegisterGlobalFilters(GlobalFilterCollection filters)
    {
      //filters.Add(new AuthorizeAttribute());
      filters.Add(new AuthorizeFilterAttribute());
      filters.Add(new HandleErrorAttribute());
    }
  }
}
