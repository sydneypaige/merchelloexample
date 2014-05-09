namespace MerchKit.Models
{
    /// <summary>
    /// Model for returns total amounts for the sale before invoiced and payment
    /// </summary>
    public class ConfirmationPreSaleSummary
    {
        public decimal ItemTotal { get; set; }
        public decimal ShippingTotal { get; set; }
        public decimal TaxTotal { get; set; }
        public decimal InvoiceTotal { get; set;  }
    }
}