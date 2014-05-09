using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Merchello.Core;
using Merchello.Core.Models;
using Merchello.Web;
using Merchello.Web.Models.ContentEditing;
using Merchello.Web.WebApi;
using Merchello.Web.Workflow;
using MerchKit.Models;
using Umbraco.Core;
using Umbraco.Web.Mvc;
using Umbraco.Web.WebApi;

namespace MerchKit.Controllers
{
    /// <summary>
    /// Utility controller - assists with little lookups
    /// </summary>
    [PluginController("MerchKit")]
    [JsonCamelCaseFormatter]
    public class MerchKitApiController : UmbracoApiController
    {
        private readonly IMerchelloContext _merchelloContext;
        
        public MerchKitApiController()
            : this(MerchelloContext.Current)
        { }

        public MerchKitApiController(IMerchelloContext merchelloContext)
        {
            _merchelloContext = merchelloContext;
        }

        /// <summary>
        /// Utility method to change pricing on a Product template when a customer changes an option in the drop downs
        /// </summary>
        /// <param name="productKey">The <see cref="ProductDisplay"/> key</param>
        /// <param name="optionChoiceKeys">A collection of option choice keys from the drop down(s)</param>
        /// <returns></returns>
        [AcceptVerbs("GET")]
        public string GetProductVariantPrice(Guid productKey, string optionChoiceKeys)
        {
            var optionsArray = optionChoiceKeys.Split(',');

            var guidOptionChoiceKeys = new List<Guid>();
            foreach (var option in optionsArray)
            {
                if (!String.IsNullOrEmpty(option))
                {
                    guidOptionChoiceKeys.Add(new Guid(option));
                }
            }

            var product = _merchelloContext.Services.ProductService.GetByKey(productKey); 
            var variant = _merchelloContext.Services.ProductVariantService.GetProductVariantWithAttributes(product, guidOptionChoiceKeys.ToArray());

            return variant.Price.ToString("C");
        }

        /// <summary>
        /// Returns a collection of valid (remaining) product variant possiblities based on the currently selected choices
        /// </summary>
        /// <param name="productKey">The unique 'key' (Guid) for the <see cref="ProductDisplay"/></param>
        /// <param name="optionChoices">An array of value choices</param>
        [AcceptVerbs("GET")]
        public IEnumerable<ProductVariantDisplay> FilterOptionsBySelectedChoices(Guid productKey, string optionChoices)
        {
            var merchello = new MerchelloHelper();

            var optionsArray = optionChoices.Split(',');
            var guidOptionChoices = new List<Guid>();
            foreach (var option in optionsArray)
            {
                if (!String.IsNullOrEmpty(option))
                {
                    guidOptionChoices.Add(new Guid(option));
                }
            }

            var variants = merchello.GetValidProductVariants(productKey, guidOptionChoices.ToArray());
            return variants;
        }

        /// <summary>
        /// Returns a list of all countries Merchello can ship to - for the drop down in the merchCheckoutPage view
        /// </summary>
        [AcceptVerbs("GET")]
        public IEnumerable<CountryModel> GetCountries()
        {
            return AllowableShipCounties
                .OrderBy(x => x.Name).Select(x => new CountryModel() { CountryCode = x.CountryCode, Name = x.Name});
        }

        /// <summary>
        /// Returns a list of all countries
        /// </summary>
        /// <returns></returns>
        [AcceptVerbs("GET")]
        public IEnumerable<CountryModel> GetAllCountries()
        {
            return
                AllCountries.Select(x => new CountryModel() {CountryCode = x.CountryCode, Name = x.Name});
        }

        /// <summary>
        /// Gets a collection of all provinces for the shipping drop down in the merchCheckoutPage view
        /// </summary>
        [AcceptVerbs("GET")]
        public IEnumerable<ProvinceModel> GetProvinces()
        {
            return BuildProvinceCollection(AllowableShipCounties.Where(x => x.Provinces.Any()));      
        }

        /// <summary>
        /// Gets a collection of all provinces for the payment drop down
        /// </summary>
        [AcceptVerbs("GET")]
        public IEnumerable<ProvinceModel> GetAllProvinces()
        {
            return BuildProvinceCollection(AllCountries.Where(x => x.Provinces.Any()));
        }


        /// <summary>
        /// Gets shipment rate quotes for the drop down in the merchCheckoutPage view
        /// </summary>
        /// <param name="address"></param>
        /// <returns></returns>
        [AcceptVerbs("POST","GET")]
        public ShippingMethodQuote GetShippingMethodQuotes(AddressModel address)
        {
            var customer = _merchelloContext.Services.CustomerService.GetAnyByKey(address.CustomerKey);

            if (customer == null) throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));

            var basket = Basket.GetBasket(customer);

            // for this version there is only ever a single shipment
            var shipment = basket.PackageBasket(address.ToAddress()).FirstOrDefault();

            if (shipment == null) return new ShippingMethodQuote() { Status = ShipQuoteStatus.NoShippableItems.ToString() };

            var providerQuotes = shipment.ShipmentRateQuotes();           

            return new ShippingMethodQuote(providerQuotes.ToShipMethodQuotes())
            {
                Status = ShipQuoteStatus.Ok.ToString()
            };
        }

        /// <summary>
        /// Gets the payment methods available
        /// </summary>
        [AcceptVerbs("GET")]
        public IEnumerable<object> GetPaymentMethods()
        {
            return _merchelloContext.Gateways.Payment.GetPaymentGatewayMethods().Select(x => new
            {
                x.PaymentMethod.Key, x.PaymentMethod.Name
            });
        }

        /// <summary>
        /// Prepares the sale
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        [AcceptVerbs("POST", "GET")]
        public ConfirmationPreSaleSummary PrepareSale(SalesPreparationModel model)
        {
            // This is sort of weird to have the customer key in the ShippingAddress ... but we repurposed an object 
            // to simplify the JS
            var customer = _merchelloContext.Services.CustomerService.GetAnyByKey(model.ShippingAddress.CustomerKey);

            if (customer == null) throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));

            var salesPrepartion = customer.Basket().SalePreparation();
           

            // save the shipping address
            salesPrepartion.SaveShipToAddress(model.ShippingAddress.ToAddress());

            //// The UI for this example makes allows for a little odd ball behavior as a user can go back and change their shipping
            //// after a shipment quote has been set.  In this case, we need to remove previously saved shipment quotes
            foreach (var shipQuote in salesPrepartion.ItemCache.Items.Where(x => x.LineItemType == LineItemType.Shipping))
            {
                salesPrepartion.ItemCache.Items.Remove(shipQuote);
            }

            // save the ship rate quote selected
            var shipments = customer.Basket().PackageBasket(model.ShippingAddress.ToAddress()).ToArray();
            if (shipments.Any() && model.ShipMethodKey != Guid.Empty)
            {
             
                // there will only be one shipment in version 1.  This quote is cached in 
                // the runtime cache so there should not be another trip to the provider (if it were carrier based)
                var approvedQuote = shipments.First().ShipmentRateQuoteByShipMethod(model.ShipMethodKey);

                salesPrepartion.SaveShipmentRateQuote(approvedQuote);
            }

            // we are just generating a summary invoice here ... it will not be persisted, so we are going to 
            // assume that the customer is going to bill to their shipping address.  However, if this would affect 
            // your tax computation, you would may need to alter the UI to include those fields first.

            // in this case we will overwrite the billing address (again) when we ask for payment information in the next step
            salesPrepartion.SaveBillToAddress(model.BillingAddress.ToAddress());

            var summary = new ConfirmationPreSaleSummary();
            if (salesPrepartion.IsReadyToInvoice())
            {
                var invoice = salesPrepartion.PrepareInvoice();
                
                // item total
                summary.ItemTotal = invoice.TotalItemPrice();

                // shipping total
                summary.ShippingTotal = invoice.TotalShipping();

                // tax total
                summary.TaxTotal = invoice.TotalTax();

                // invoice total
                summary.InvoiceTotal = invoice.Total;

            }

            return summary;
        }


        [AcceptVerbs("POST")]
        public object PlaceOrder(SalesPreparationModel model)
        {
            // This is an example using an Cash Payment provider - ie. you should not pass credit card information like this ;-)
          
            var customer = _merchelloContext.Services.CustomerService.GetAnyByKey(model.ShippingAddress.CustomerKey);

            if (customer == null) throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));

            var salesPreparation = customer.Basket().SalePreparation();
            salesPreparation.SaveBillToAddress(model.BillingAddress.ToAddress());

            if (!salesPreparation.IsReadyToInvoice()) return new {Error = "Not ready to invoice"};

            // this will do an Authorize payment only ... since it is a promise of a cash payment
            // salesPreparation
            var authorize = salesPreparation.AuthorizePayment(model.PaymentMethodKey);

            if (authorize.Payment.Success) return new { Redirect = string.Format("/receipt/?inv={0}", authorize.Invoice.Key.ToString().EncryptWithMachineKey()) };

            return new { Error = authorize.Payment.Exception.Message };
        }

        #region Lookups


        private IEnumerable<ICountry> _allowableCountries; 
        private IEnumerable<ICountry> AllowableShipCounties
        {
            get {
                return _allowableCountries ??
                       (_allowableCountries = _merchelloContext.Gateways.Shipping.GetAllowedShipmentDestinationCountries().OrderBy(x => x.Name));
            }
        }


        private IEnumerable<ICountry> _allCountries;
        private IEnumerable<ICountry> AllCountries
        {
            get
            {
                return _allCountries ??
                       (_allCountries = _merchelloContext.Services.StoreSettingService.GetAllCountries().OrderBy(x => x.Name));
            }
        }



        private static IEnumerable<ProvinceModel> BuildProvinceCollection(IEnumerable<ICountry> countries)
        {
            var models = new List<ProvinceModel>();
            foreach (var country in countries)
            {
                models.AddRange(country.Provinces.Select(p => new ProvinceModel() { ProvinceCode = p.Code, Name = p.Name }));
            }
            return models;
        }

        #endregion
    }

    



}
