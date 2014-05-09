using System.Collections.Generic;

namespace MerchKit.Models
{
    /// <summary>
    /// Model for filling a Ship Rate Quote drop down
    /// </summary>
    public class ShippingMethodQuote
    {
        public ShippingMethodQuote()
        {

            Quotes = new List<ShipMethodQuote>();
        }

        public ShippingMethodQuote(IEnumerable<ShipMethodQuote> quotes)
        {
            Quotes = quotes;
        }

        public IEnumerable<ShipMethodQuote> Quotes { get; private set; } 
        
        public string Status { get; set; }
    }

    public enum ShipQuoteStatus
    {
        Ok,
        NoShippableItems,
        Error
    }
}