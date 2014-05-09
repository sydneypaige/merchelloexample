using System.Web.Mvc;
using MerchKit.Caching;
using MerchKit.Helpers;
using Umbraco.Core.Models;
using Umbraco.Web.Models;
using Umbraco.Web.Mvc;

namespace MerchKit.Controllers
{
    [PluginController("MerchKit")]
    public class NavigationController : SurfaceController
    {
        /// <summary>
        /// Renders the main navigation
        /// </summary>      
        [ChildActionOnly]
        public ActionResult NavigationMain(
            string[] excludeDocumentTypes = null,
            int maxLevels = 0, int parentId = 0,
            bool includeContentWithoutTemplate = false,
            string viewName = "")
        {
            var current = Umbraco.Content(UmbracoContext.PageId);

            DynamicPublishedContent start = null;
            if (parentId > 0)
            {
                start = Umbraco.Content(parentId);
            }

            if (start == null)
            {
                var home = (IPublishedContent)ApplicationContext.ApplicationCache.RuntimeCache.GetCacheItem(CacheKeys.HomePageCacheKey, () => current.AncestorOrSelf(1));
                start = Umbraco.Content(home.Id);
            }

            var helper = new NavigationHelper();

            var linkTier = helper.BuildLinkTier(start, current, excludeDocumentTypes, start.Level, maxLevels, includeContentWithoutTemplate);

            if (string.IsNullOrEmpty(viewName))
                viewName = "merchNavigationMain";


            return PartialView(viewName, linkTier);

        }

        /// <summary>
        /// Renders a bread crumb navigation
        /// </summary>
        /// <param name="stopLevel">top level for the recursion</param>
        /// <param name="viewName">optional alternate view name</param>
        /// <returns></returns>
        [ChildActionOnly]
        public ActionResult BreadCrumbMenu(int stopLevel = 1, string viewName = "")
        {
            var current = Umbraco.Content(UmbracoContext.PageId);

            var service = new NavigationHelper();

            var breadcrumb = service.BuildBreadCrumb(stopLevel, current);

            if (string.IsNullOrEmpty(viewName))
                viewName = "merchBreadCrumbMenu";

            return PartialView(viewName, breadcrumb);
        }
    }
}