using System.Linq;
using Merchello.Web.Mvc;
using Umbraco.Core;
using Umbraco.Core.Cache;
using Umbraco.Core.Models;
using Umbraco.Web;
using System;

namespace MerchKit.Mvc
{
    public abstract class MerchKitTemplatePage : MerchelloTemplatePage
    {
        private readonly IRuntimeCacheProvider _runtimeCache = ApplicationContext.Current.ApplicationCache.RuntimeCache;

        /// <summary>
        /// Exposes the reference to the starter kit's home page where many of the configurations are stored
        /// </summary>
        public IPublishedContent HomePage
        {
            get
            {
                return (IPublishedContent)_runtimeCache
                    .GetCacheItem(Caching.CacheKeys.HomePageCacheKey,
                    () => Model.Content.AncestorOrSelf(1));
            }

        }

        /// <summary>
        /// Exposes the reference to the starter kit's cart or basket page 
        /// </summary>
        public IPublishedContent CartPage
        {
            get
            {
                return (IPublishedContent)_runtimeCache
                    .GetCacheItem(Caching.CacheKeys.CartPageCacheKey,
                    () => HomePage.Children.FirstOrDefault(x => x.GetTemplateAlias() == "merchCartPage"));
            }
        }

        public static Random NoWhammyStop = new Random();
    }
}