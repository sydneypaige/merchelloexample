using System;

namespace MerchKit.Models
{
    public class BasketViewLineItem
    {
        public Guid Key { get; set; }
        public int ContentId { get; set; }
        public string Name { get; set; }
        public string Attributes { get; set; }
        public string Sku { get; set; }
        public decimal Price { get; set; }
        public int Quantity { get; set; }
    }
}