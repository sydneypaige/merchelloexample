namespace MerchKit.Models
{
    public class Link : ILink
    {
        #region ILink Members

        public int ContentId { get; set; }

        public string Title { get; set; }

        public string Url { get; set; }

        public string Target { get; set; }

        public string ElementId { get; set; }

        public string CssClass { get; set; }

        #endregion
    }
}