using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Dependencies;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using Microsoft.Owin;
using Owin;
using SharePoint.Authentication.Owin;

[assembly: OwinStartup(typeof(SP.ProjectTaskWeb.Startup))]

namespace SP.ProjectTaskWeb
{
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            var config = new HttpConfiguration();
            var dependencyResolver = new Unity.AspNet.WebApi.UnityDependencyResolver(UnityConfig.Container);
            config.DependencyResolver = dependencyResolver;
            WebApiConfig.Register(config);

            ConfigureAuth(app, dependencyResolver);
            app.UseWebApi(config);

            FilterProviders.Providers.Remove(FilterProviders.Providers.OfType<FilterAttributeFilterProvider>().First());
            FilterProviders.Providers.Add(new Unity.AspNet.Mvc.UnityFilterAttributeFilterProvider(UnityConfig.Container));
            DependencyResolver.SetResolver(new Unity.AspNet.Mvc.UnityDependencyResolver(UnityConfig.Container));


            FilterProviders.Providers.Remove(FilterProviders.Providers.OfType<FilterAttributeFilterProvider>().First());

            AreaRegistration.RegisterAllAreas();
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
        }

        private void ConfigureAuth(IAppBuilder app, System.Web.Http.Dependencies.IDependencyResolver dependencyResolver)
        {
            var sharePointAuthenticationOptions = new SharePointAuthenticationOptions()
            {
                DependencyResolver = dependencyResolver,
                TokenCacheDurationInMinutes = 10,
                AllowNonBrowserRequests = false,
                InjectCredentialsForHighTrust = true,
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateIssuerSigningKeys = true,
                ClockSkew = TimeSpan.Zero,
            };
            sharePointAuthenticationOptions.OnAuthenticationHandlerPostAuthenticate += OnAuthenticationHandlerPostAuthenticate;
            app.Use<SharePointAuthenticationMiddleware>(sharePointAuthenticationOptions);
        }

        private Task OnAuthenticationHandlerPostAuthenticate(IOwinContext owinContext, IDependencyScope dependencyScope, ClaimsPrincipal principal)
        {
            return Task.FromResult(false);
        }
    }
}