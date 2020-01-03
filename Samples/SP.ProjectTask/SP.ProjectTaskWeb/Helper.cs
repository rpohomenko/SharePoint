using Microsoft.SharePoint.Client;
using System;
using System.Threading.Tasks;

namespace SP.ProjectTaskWeb
{
    internal static class Helper
    {
        public static async Task<bool> IsAppInstalled(ClientContext context)
        {
            var web = context.Web;
            context.Load(web, w => w.AllProperties);
            await context.ExecuteQueryAsync();
            if (web.AllProperties.FieldValues.ContainsKey(Constants.Installed_PROP))
            {
                return Convert.ToBoolean(web.AllProperties[Constants.Installed_PROP]);
            }
            return false;
        }

        public static async Task<bool> IsAppInstalled(List list)
        {
            var context = list.Context;
            context.Load(list.RootFolder.Properties);
            try
            {
                await context.ExecuteQueryAsync();
                if (list.RootFolder.Properties.FieldValues.ContainsKey(Constants.Installed_PROP))
                {
                    return Convert.ToBoolean(list.RootFolder.Properties[Constants.Installed_PROP]);
                }
            }
            catch { }
            return false;
        }

        public static void SetAppInstalled(List list, bool installed)
        {
            var context = list.Context;
            list.RootFolder.Properties[Constants.Installed_PROP] = installed;
            list.RootFolder.Update();
            context.ExecuteQuery();
        }

        public static void SetAppInstalled(ClientContext context, bool installed)
        {
            var web = context.Web;
            web.AllProperties[Constants.Installed_PROP] = installed;
            web.Update();
            context.ExecuteQuery();
        }

        public static string GetAccessToken(ClientRuntimeContext clientContext)
        {
            string accessToken = null;
            EventHandler<WebRequestEventArgs> handler = (s, e) =>
            {
                string authorization = e.WebRequestExecutor.RequestHeaders["Authorization"];
                if (!string.IsNullOrEmpty(authorization))
                {
                    accessToken = authorization.Replace("Bearer ", string.Empty);
                }
            };
            // Issue a dummy request to get it from the Authorization header
            clientContext.ExecutingWebRequest += handler;
            clientContext.ExecuteQuery();
            clientContext.ExecutingWebRequest -= handler;

            return accessToken;
        }

    }
}