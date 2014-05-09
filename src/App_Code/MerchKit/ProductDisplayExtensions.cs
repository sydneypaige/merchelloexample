using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using Merchello.Web;
using Merchello.Web.Models.ContentEditing;
using Umbraco.Core.Models;

namespace MerchKit
{
    public static class ProductDisplayExtensions
    {
        public static bool IsProduct(this ProductDisplay productDisplay)
        {
            if (productDisplay == null) return false;
            return productDisplay.Key != Guid.Empty;
        }

        public static IEnumerable<SelectListItem> AsSelectListItems(this IEnumerable<ProductAttributeDisplay> choices)
        {
            return choices.Select(
                choice => new SelectListItem()
                {
                    Value = choice.Key.ToString(), Text = choice.Name
                }).ToList();
        }


        public static ProductDisplay GetProduct(this IPublishedContent source, string propertyAlias)
        {
            if (!source.WillWork(propertyAlias)) return new ProductDisplay() { Name = "Not Assigned" };
            var merchello = new MerchelloHelper();
            return merchello.Product(source.GetProperty(propertyAlias).Value.ToString());
        }
    }
}