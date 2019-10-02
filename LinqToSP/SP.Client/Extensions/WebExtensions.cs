using Microsoft.SharePoint.Client;
using System;

namespace SP.Client.Extensions
{
  public static class WebExtensions
  {
    public static List GetListByUrl(this Web web, string listUrl)
    {
      Check.NotNull(web, nameof(web));
      Check.NotNull(listUrl, nameof(listUrl));

      var context = web.Context;

      List list = null;
      Folder folder;

      var scope = new ExceptionHandlingScope(context);

      using (scope.StartScope())
      {
        using (scope.StartTry())
        {
          folder = web.GetFolderByServerRelativeUrl(listUrl);
          context.Load(folder);
        }

        using (scope.StartCatch())
        {

        }
      }

      context.ExecuteQuery();

      if (!scope.HasException && folder != null && folder.ServerObjectIsNull != true)
      {
        folder = web.GetFolderByServerRelativeUrl(listUrl);

        context.Load(folder.Properties);
        context.ExecuteQuery();
        if (folder.Properties["vti_listname"] != null)
        {
          var listId = new Guid(folder.Properties["vti_listname"].ToString());
          list = web.Lists.GetById(listId);
          context.Load(list);
          context.ExecuteQuery();
        }
      }

      return list;
    }
  }
}
