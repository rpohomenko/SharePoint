using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Serialization;
using System.Web.Http;

namespace SP.ProjectTaskWeb
{
  public static class WebApiConfig
  {
    public static void Register(HttpConfiguration config)
    {
      // Web API configuration and services

      config.Formatters.JsonFormatter.SerializerSettings.Formatting = Formatting.Indented;
      config.Formatters.JsonFormatter.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();
      config.Formatters.JsonFormatter.SerializerSettings.Converters.Add(new StringEnumConverter() { NamingStrategy = new CamelCaseNamingStrategy(), AllowIntegerValues = true });
      //config.Formatters.JsonFormatter.UseDataContractJsonSerializer = true;
      //config.Formatters.JsonFormatter.SerializerSettings.Converters.Add(
      //  new IsoDateTimeConverter
      //  {
      //    DateTimeStyles = DateTimeStyles.AdjustToUniversal,
      //    DateTimeFormat = "yyyy'-'MM'-'dd'T'HH':'mm':'ssK"
      //  });

#if DEBUG
      config.IncludeErrorDetailPolicy = IncludeErrorDetailPolicy.Always;
#endif

      // Web API routes
      config.MapHttpAttributeRoutes();

      config.Routes.MapHttpRoute(
          name: "DefaultApi",
          routeTemplate: "api/{controller}/{id}",
          defaults: new { id = RouteParameter.Optional }
      );


    }
  }
}