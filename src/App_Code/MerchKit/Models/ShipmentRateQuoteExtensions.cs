using System.Collections.Generic;
using System.Linq;
using Merchello.Core.Gateways.Shipping;

namespace MerchKit.Models
{
    /// <summary>
    /// Utility method for site specific conversion of Merchello's IShipmentRateQuote
    /// </summary>
    public static class ShipmentRateQuoteExtensions
    {
        public static IEnumerable<ShipMethodQuote> ToShipMethodQuotes(this IEnumerable<IShipmentRateQuote> shipmentRateQuotes)
        {
            return shipmentRateQuotes.Select(quote => new ShipMethodQuote()
            {
                Key = quote.ShipMethod.Key,
                ShippingMethodName = quote.ShipMethod.Name,
                Rate = quote.Rate
            });
        }
    }
}