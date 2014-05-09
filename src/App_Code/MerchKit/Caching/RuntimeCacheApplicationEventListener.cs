using Umbraco.Core;
using Umbraco.Core.Events;
using Umbraco.Core.Models;
using Umbraco.Core.Publishing;

namespace MerchKit.Caching
{
    public sealed class RuntimeCacheApplicationEventListener : IApplicationEventHandler
    {
        public void OnApplicationInitialized(UmbracoApplicationBase umbracoApplication, ApplicationContext applicationContext)
        {
            if(applicationContext == null) return;

            // We have cached the starter kit home page and the cart page in the MerchelloKitTemplatePage so we need
            // refresh the cache if these are saved
            PublishingStrategy.Published += delegate(IPublishingStrategy sender, PublishEventArgs<IContent> args)
            {
                foreach (var item in args.PublishedEntities)
                {
                    switch (item.ContentType.Alias)
                    {
                        case "merchHomePage":
                            
                            applicationContext.ApplicationCache.RuntimeCache.ClearCacheItem(CacheKeys.HomePageCacheKey);

                            break;

                        case "merchCheckoutPage" :

                            if (item.Template.Alias == "merchCartPage")
                                applicationContext.ApplicationCache.RuntimeCache.ClearCacheItem(CacheKeys.CartPageCacheKey);

                            break;
                    }
                }
            };
        }

        public void OnApplicationStarting(UmbracoApplicationBase umbracoApplication, ApplicationContext applicationContext)
        { }

        public void OnApplicationStarted(UmbracoApplicationBase umbracoApplication, ApplicationContext applicationContext)
        { }
    }
}