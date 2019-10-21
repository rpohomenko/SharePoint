using System;
using Microsoft.SharePoint.Client;

namespace SP.ProjectTaskWeb.Authentication
{
    internal class TokenHelper
    {
        private readonly SharePoint.Authentication.TokenHelper _tokenHelper;

        public TokenHelper(SharePoint.Authentication.TokenHelper tokenHelper)
        {
            _tokenHelper = tokenHelper;
        }
        public ClientContext GetAppOnlyClienContext(string spHostUrl)
        {
            if (_tokenHelper == null) return null;
            if (string.IsNullOrEmpty(spHostUrl)) return null;
            var targetUrl = new Uri(spHostUrl);
            string realm = _tokenHelper.GetRealmFromTargetUrl(targetUrl);
            var token = _tokenHelper.GetAppOnlyAccessToken(SharePoint.Authentication.TokenHelper.SharePointPrincipal, targetUrl.Authority, realm).AccessToken;
            return _tokenHelper.GetClientContextWithAccessToken(spHostUrl, token);
        }
    }
}