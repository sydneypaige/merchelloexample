using System.Collections.Generic;

namespace MerchKit.Models
{
    public class LinkTier : Link, ILinkTier
    {
        public LinkTier() { Children = new List<ILinkTier>(); }
        public List<ILinkTier> Children { get; set; }
    }
}