using System;
using System.Collections;

namespace MerchKit.Models
{
    /// <summary>
    /// Represents a quote from the shipping provider
    /// </summary>
    public class ShipMethodQuote
    {
        public Guid Key { get; set; }
        public string ShippingMethodName { get; set; }
        public decimal Rate { get; set; }
    }
}