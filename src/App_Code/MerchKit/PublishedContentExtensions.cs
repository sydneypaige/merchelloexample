using System.Collections.Generic;
using System.Linq;
using System.Xml.Linq;
using MerchKit.Models;
using Newtonsoft.Json;
using Umbraco.Core.Models;
using Umbraco.Web;

namespace MerchKit
{
    public static class PublishedContentExtensions
    {

        /// <summary>
        /// Builds a collection of links from values saved by the Umbraco RelatedLinks DataType
        /// </summary>
        public static IEnumerable<ILink> RelatedLinksToLinkList(this IPublishedContent source, UmbracoContext context, string propertyAlias)
        {

            var links = new List<ILink>();

            if (!source.WillWork(propertyAlias)) return links;

            var relatedLinks =
                JsonConvert.DeserializeObject<IEnumerable<RelatedLink>>(
                    source.GetProperty(propertyAlias).Value.ToString());          

            var umbraco = new UmbracoHelper(context);

            foreach (var relatedLink in relatedLinks)
            {
                var rl = new Link()
                {
                    Title = relatedLink.Title,
                    Target = relatedLink.NewWindow ? "_blank" : "_self"
                };

                // internal or external link
                if (relatedLink.IsInternal)
                {
                    var content = umbraco.Content(relatedLink.Internal);
                    rl.Url = content.Url;
                }
                else
                {
                    rl.Url = relatedLink.Link;
                }

                links.Add(rl);
            }

            return links;
        }

                /// <summary>
        /// Builds a list of text based on values saved by an Umbraco MultiTextString DataType
        /// </summary>
        public static IEnumerable<string> MultiLineTextStringToList(this IPublishedContent source, string propertyAlias)
        {

            return (!source.WillWork(propertyAlias)) ? new string[] {} : source.GetProperty(propertyAlias).DataValue.ToString().Split('\n');

        }

        /// <summary>
        /// Creates a list of either content or media based on values saved by an Umbraco MultiNodeTreePicker DataType
        /// </summary>
        public static IEnumerable<IPublishedContent> MntpToPublishedContentList(this IPublishedContent source, UmbracoContext context, string propertyAlias, bool isMedia = false)
        {
            if (!source.WillWork(propertyAlias)) return new List<IPublishedContent>();

            var ids = source.GetProperty(propertyAlias).Value.ToString().StartsWith("<MultiNodePicker")
                ? source.MntpXmlValuesToArray(propertyAlias)
                : source.MntpCsvValuesToArray(propertyAlias);

            var umbraco = new UmbracoHelper(context);

            return isMedia ? umbraco.Media(ids) : umbraco.Content(ids);
        }

        /// <summary>
        /// Returns an array of Ids saved in Xml format by an Umbraco MultiNodeTreePicker DataType
        /// </summary>        
        public static int[] MntpXmlValuesToArray(this IPublishedContent source, string propertyAlias)
        {
            if (!source.WillWork(propertyAlias)) return new int[] { };

            return (XDocument.Parse(source.GetProperty(propertyAlias).Value.ToString()).Descendants().Where(x => x.Name == "nodeId")).Select(x => int.Parse(x.Value)).ToArray();
        }

        /// <summary>
        /// Returns an array of Ids saved in Xml format by an Umbraco MultiNodeTreePicker DataType
        /// </summary> 
        public static int[] MntpCsvValuesToArray(this IPublishedContent source, string propertyAlias)
        {
            if (!source.WillWork(propertyAlias)) return new int[] { };

            return source.GetProperty(propertyAlias).Value.ToString().Split(',').Select(int.Parse).ToArray();
        }


        /// <summary>
        /// Asserts that a property exists and has a value
        /// </summary>
        /// <param name="source">The <see cref="IPublishedContent"/> source containing the property</param>
        /// <param name="propertyAlias">The alias or name of the property</param>
        /// <returns>True of false indicating whether or not the property exists and has a value</returns>
        public static bool WillWork(this IPublishedContent source, string propertyAlias)
        {
            return source.HasProperty(propertyAlias) && source.HasValue(propertyAlias);
        }

    }

}