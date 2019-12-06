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
            if (web.AllProperties.FieldValues.ContainsKey(Constants.Installed_WEB_PROP))
            {
                return System.Convert.ToBoolean(web.AllProperties[Constants.Installed_WEB_PROP]);
            }
            return false;
        }

        public static void SetAppInstalled(ClientContext context, bool installed)
        {
            var web = context.Web;
            web.AllProperties[Constants.Installed_WEB_PROP] = installed;
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