using System;

namespace MerchKit.Models
{
    /// <summary>
    /// Model to fill in Basket().SalePreparation()
    /// </summary>
    public class SalesPreparationModel
    {
        public AddressModel ShippingAddress { get; set; } 

        public AddressModel BillingAddress { get; set; }

        public Guid PaymentMethodKey { get; set; }

        public Guid ShipMethodKey { get; set; }
       
    }
}