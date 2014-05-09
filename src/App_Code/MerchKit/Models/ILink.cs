namespace MerchKit.Models
{
    /// <summary>
    /// Defines a link
    /// </summary>
    public interface ILink
    {
        /// <summary>
        /// The Umbraco content id if applicable
        /// </summary>
        int ContentId { get; set; }

        /// <summary>
        /// The title of the link
        /// </summary>
        string Title { get; set; }

        /// <summary>
        /// The Url of the link
        /// </summary>
        string Url { get; set; }

        /// <summary>
        /// The Target of the link
        /// </summary>
        string Target { get; set; }

        /// <summary>
        /// The id attribute for the link
        /// </summary>
        string ElementId { get; set; }

        /// <summary>
        /// The CSS class of the link
        /// </summary>
        string CssClass { get; set; }
    }
}