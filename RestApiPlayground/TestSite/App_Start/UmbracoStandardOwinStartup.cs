using System.Web.Cors;
using Microsoft.Owin;
using Owin;
using Umbraco.Web;
using TestSite;
using Umbraco.Core;
using Umbraco.RestApi;

//To use this startup class, change the appSetting value in the web.config called 
// "owin:appStartup" to be "UmbracoStandardOwinStartup"

[assembly: OwinStartup("UmbracoStandardOwinStartup", typeof(UmbracoStandardOwinStartup))]

namespace TestSite
{
    /// <summary>
    /// The standard way to configure OWIN for Umbraco
    /// </summary>
    /// <remarks>
    /// The startup type is specified in appSettings under owin:appStartup - change it to "StandardUmbracoStartup" to use this class
    /// </remarks>
    public class UmbracoStandardOwinStartup : UmbracoDefaultOwinStartup
    {
        public override void Configuration(IAppBuilder app)
        {
            // Ensure the default options are configured
            base.Configuration(app);

            // Configuring the Umbraco REST API options
            app.ConfigureUmbracoRestApi(new UmbracoRestApiOptions()
            {
                // Modify the CorsPolicy as required
                CorsPolicy = new CorsPolicy()
                {
                    AllowAnyHeader = true,
                    AllowAnyMethod = true,
                    AllowAnyOrigin = true
                }
            });

            // Enabling the authentication based on Umbraco back office cookie
            // Uncomment below line when testing the HAL Browser inside Umbraco webapp
            app.UseUmbracoCookieAuthenticationForRestApi(ApplicationContext.Current);

            // Enabling the usage of auth token retrieved by backoffice user / login
            // Uncomment below line when testing the PoC website
            app.UseUmbracoBackOfficeTokenAuth();
        }
    }
}
