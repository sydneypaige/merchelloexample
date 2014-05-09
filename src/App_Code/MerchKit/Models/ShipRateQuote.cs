using System;

namespace MerchKit.Models
{
    public class ShipRateQuote
    {
        public Guid Key { get; set; }
        public string ShipMethodName { get; set; }
        public decimal Rate { get; set; }
    }
}