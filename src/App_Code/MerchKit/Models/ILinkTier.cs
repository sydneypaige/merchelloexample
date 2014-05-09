using System.Collections.Generic;

namespace MerchKit.Models
{

    /// <summary>
    /// Defines a link tier
    /// </summary>
    public interface ILinkTier : ILink
    {
        List<ILinkTier> Children { get; set; }
    }
}
