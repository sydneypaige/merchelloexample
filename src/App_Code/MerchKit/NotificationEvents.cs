using Umbraco.Core;
using Umbraco.Core.Logging;

namespace MerchKit
{
    /// <summary>
    /// 
    /// </summary>
    public class NotificationEvents : ApplicationEventHandler
    {
        protected override void ApplicationStarted(UmbracoApplicationBase umbracoApplication, ApplicationContext applicationContext)
        {
            base.ApplicationStarted(umbracoApplication, applicationContext);

            // We will be extending Merchello to do this sort of thing after install ... just have not added the functionality as of yet
            LogHelper.Info<NotificationEvents>("Initializing example site notifications");


        }
    }
}