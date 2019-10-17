using SharePoint.Authentication.Caching;
using SharePoint.Authentication.Owin;
using SharePoint.Authentication.Owin.Models;
using System;
using System.Threading.Tasks;

namespace SP.ProjectTaskWeb.Authentication
{
    public class SharePointSessionProvider : MemoryCacheProvider, ISharePointSessionProvider
    {
        public async Task SaveSharePointSession(Guid sessionId, SharePointSession sharePointSession)
        {
            await SetAsync(sessionId.ToString(), sharePointSession, 15);
        }

        public async Task<SharePointSession> GetSharePointSession(Guid sessionId)
        {
            return await GetAsync<SharePointSession>(sessionId.ToString(), null, 15);
        }

        public async Task SaveHighTrustCredentials(HighTrustCredentials highTrustCredentials)
        {
            await Task.FromException(new NotImplementedException());
        }

        public async Task<HighTrustCredentials> GetHighTrustCredentials(string spHostWebUrl)
        {
            var authenticationParameters = new LowTrustAuthenticationParameters();
            return await Task.Run(() => new HighTrustCredentials()
            {
                SharePointHostWebUrl = spHostWebUrl,
                ClientId = authenticationParameters.ClientId,
                ClientSecret = authenticationParameters.ClientSecret
            });
        }
    }
}