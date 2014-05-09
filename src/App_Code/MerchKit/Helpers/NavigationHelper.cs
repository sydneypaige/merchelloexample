using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using MerchKit.Models;
using Umbraco.Core.Models;
using Umbraco.Web;
using Umbraco.Web.Models;

namespace MerchKit.Helpers
{
    /// <summary>
    /// 
    /// </summary>
    public class NavigationHelper
    {


        #region Menu Methods

        /// <summary>
        /// 
        /// </summary>
        /// <param name="tierItem"></param>
        /// <param name="current"></param>
        /// <param name="excludeDocumentTypes"></param>
        /// <param name="tierLevel"></param>
        /// <param name="maxLevel"></param>
        /// <param name="includeContentWithoutTemplate"></param>
        /// <returns></returns>
        public ILinkTier BuildLinkTier(IPublishedContent tierItem,
          IPublishedContent current,
          string[] excludeDocumentTypes = null,
          int tierLevel = 0,
          int maxLevel = 0,
          bool includeContentWithoutTemplate = false)
        {
            var active = current.Path.Contains(tierItem.Id.ToString(CultureInfo.InvariantCulture));

            if (current.Level == tierItem.Level) active = current.Id == tierItem.Id;

            var tier = new LinkTier()
            {
                ContentId = tierItem.Id,
                Title = tierItem.Name,
                Url = ContentHasTemplate(tierItem) ? tierItem.Url : string.Empty,
                CssClass = active ? "active" : string.Empty
            };

            if (excludeDocumentTypes == null) excludeDocumentTypes = new string[] { };


            if ((tierLevel > maxLevel && maxLevel != 0)) return tier;

            foreach (var item in ((DynamicPublishedContent)tierItem).Children
                .Where<DynamicPublishedContent>(x => x.Visible && (ContentHasTemplate(x) || includeContentWithoutTemplate) && !excludeDocumentTypes.Contains(x.DocumentTypeAlias)))
            {
                tier.Children.Add(BuildLinkTier(item, current, excludeDocumentTypes, item.Level, maxLevel));
            }
            return tier;

        }


        /// <summary>
        /// Contructs a breadcrumb menu
        /// </summary>
        /// <param name="stopLevel">The "top" level at which the recursion should quit</param>
        /// <param name="current">The current content</param>
        /// <returns>List of <see cref="Link" /></returns>
        public IEnumerable<ILink> BuildBreadCrumb(int stopLevel, IPublishedContent current)
        {
            var link = new Link()
            {
                Title = current.Name,
                Target = "_self",
                Url = current.Url,
                ElementId = current.Id.ToString(CultureInfo.InvariantCulture)
            };

            var links = new List<ILink>();
            if (current.Level != stopLevel && current.Parent != null)
            {
                links.AddRange(BuildBreadCrumb(stopLevel, current.Parent));
            }
            links.Add(link);
            return links;
        }

        #endregion

        /// <summary>
        /// Quick fix to all for checking if a content item has a temlate
        /// </summary>
        /// <param name="content">IPublishedContent</param>
        /// <returns>true/false indicating whether or not the content has an associated template selected</returns>
        private static bool ContentHasTemplate(IPublishedContent content)
        {
            try
            {
                var template = content.GetTemplateAlias();
                return !string.IsNullOrEmpty(template);
            }
            catch (Exception)
            {
                return false;
            }
        }
    }

}