using System.Web;
using System.Web.Optimization;

namespace SP.ProjectTaskWeb
{
  public class BundleConfig
  {
    // For more information on bundling, visit https://go.microsoft.com/fwlink/?LinkId=301862
    public static void RegisterBundles(BundleCollection bundles)
    {
      string min =
#if DEBUG
        "";
#else
      ".min";
#endif

      bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                  "~/Scripts/jquery-3.4.1" + min + ".js"));

      //bundles.Add(new ScriptBundle("~/bundles/jqueryval").Include(
      //            $"~/Scripts/jquery.validate*"));

      // Use the development version of Modernizr to develop with and learn from. Then, when you're
      // ready for production, use the build tool at https://modernizr.com to pick only the tests you need.
      bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
                  "~/Scripts/modernizr-*"));

      bundles.Add(new ScriptBundle("~/bundles/bootstrap").Include(
                $"~/Scripts/bootstrap{min}.js"));

      bundles.Add(new ScriptBundle("~/bundles/spcontext").Include(
                  "~/Scripts/spcontext.js"));

      bundles.Add(new /*Script*/Bundle("~/bundles/main").Include(
                        $"~/Scripts/sp-react/dist/js/main.bundle{min}.js"));
      bundles.Add(new ScriptBundle("~/bundles/vendor").Include(
                       $"~/Scripts/sp-react/dist/js/vendor.bundle{min}.js"));

      bundles.Add(new StyleBundle("~/Content/css").Include(
                      $"~/Content/bootstrap{min}.css",
                      $"~/Scripts/sp-react/dist/css/main{min}.css",
                      "~/Content/site.css"));
     
    }
  }
}
