using Microsoft.SharePoint.Client;
using Newtonsoft.Json;

namespace SP.ProjectTaskWeb.Models
{
    public class SPPageContextInfo
    {
        internal SPPageContextInfo(Site site, Web web, bool isWebPart)
        {
            if (site != null)
            {
                if (site.IsPropertyAvailable("ServerRelativeUrl"))
                    this.SiteServerRelativeUrl = site.ServerRelativeUrl;
                if (site.IsPropertyAvailable("Url"))
                    this.SiteAbsoluteUrl = site.Url;
            }
            if (web != null)
            {
                if (web.IsPropertyAvailable("ServerRelativeUrl"))
                    this.WebServerRelativeUrl = web.ServerRelativeUrl;
                if (web.IsPropertyAvailable("Url"))
                    this.WebAbsoluteUrl = web.Url;
                if (web.IsPropertyAvailable("Language"))
                    this.WebLanguage = web.Language;
                if (web.IsPropertyAvailable("SiteLogoUrl"))
                    this.WebLogoUrl = web.SiteLogoUrl;
                if (web.IsPropertyAvailable("EffectiveBasePermissions"))
                {
                    this.WebPermMasks = new SPPermissionInfo(web.EffectiveBasePermissions);
                }
                if (web.IsPropertyAvailable("Title"))
                    this.WebTitle = web.Title;
                if (web.IsPropertyAvailable("UIVersion"))
                    this.WebUIVersion = web.UIVersion;

                User user = web.CurrentUser;
                UserInformation = new SPUserInformation(user);
                //if (user.IsPropertyAvailable("Id"))
                //    this.UserId = user.Id;
                //if (user.IsPropertyAvailable("LoginName"))
                //    this.UserLoginName = user.LoginName;

                this.RegionalInfo = new SPRegionalInfo(web.RegionalSettings);
            }
            IsWebPart = isWebPart;
        }

        [JsonProperty("webServerRelativeUrl")]
        public string WebServerRelativeUrl { get; private set; }

        [JsonProperty("webAbsoluteUrl")]
        public string WebAbsoluteUrl { get; private set; }

        [JsonProperty("siteServerRelativeUrl")]
        public string SiteServerRelativeUrl { get; private set; }

        [JsonProperty("siteAbsoluteUrl")]
        public string SiteAbsoluteUrl { get; private set; }

        [JsonProperty("layoutsUrl")]
        public string LayoutsUrl { get; private set; }

        [JsonProperty("webTitle")]
        public string WebTitle { get; private set; }

        [JsonProperty("webLogoUrl")]
        public string WebLogoUrl { get; private set; }

        [JsonProperty("webLanguage")]
        public uint WebLanguage { get; private set; }

        //[JsonProperty("userId")]
        //public int UserId { get; private set; }

        //[JsonProperty("userLoginName")]
        //public string UserLoginName { get; private set; }

        [JsonProperty("webPermMasks")]
        public SPPermissionInfo WebPermMasks { get; private set; }

        [JsonProperty("webUIVersion")]
        public int WebUIVersion { get; private set; }

        [JsonProperty("appWebUrl")]
        public string AppWebUrl { get; set; }

        [JsonProperty("isWebPart")]
        public bool IsWebPart { get; private set; }

        [JsonProperty("regionalSettings")]
        public SPRegionalInfo RegionalInfo { get; private set; }

        [JsonProperty("user")]
        public SPUserInformation UserInformation { get; private set; }
    }
}

