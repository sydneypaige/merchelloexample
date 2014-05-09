// ngMerchkitApp.js | requires AngularJs | created by Kyle Weems
// created March 11, 2014 | last updated March 13, 2014
//
// The merchkit AngularJS app.

// The Angular App declaration & namespacing

(function () {
    angular.module("merchkitApp", []);
}());

(function (merchkit, undefined) {

    // global namepsaces
    merchkit.API = {};
    merchkit.Models = {};
    merchkit.Tools = {}

}(window.merchkit = window.merchkit || {}));

// CONTROLLERS

// The Checkout Controller


(function (app) {

    var checkoutController = function ($scope, addressService, contactInfoService, countryService, paymentMethodService, orderService, provinceService, shippingMethodService) {

        // Variables
        $scope.completed = {
            contactInfo: false,
            shipping: false,
            shippingMethod: false,
            payment: false
        };
        $scope.options = {
            billingCountries: [
                { id: -1, name: "Country" }
            ],
            paymentMethods: [
                { id: -1, name: "Choose your payment method" }
            ],
            shippingCountries: [
                { id: -1, name: "Country" }
            ],
            shippingMethods: [
                { id: -1, name: "Choose your shipping method" }
            ],
            billingRegions: [
                { id: -1, name: "State/Province" }
            ],
            shippingRegions: [
                { id: -1, name: "State/Province" }
            ]
        };
        $scope.filters = {
            billingCountry: $scope.options.shippingCountries[0],
            billingRegion: $scope.options.shippingRegions[0],
            paymentMethod: $scope.options.paymentMethods[0],
            shippingCountry: $scope.options.shippingCountries[0],
            shippingMethod: $scope.options.shippingMethods[0],
            shippingRegion: $scope.options.shippingRegions[0]
        };
        $scope.visible = {
            errors: {
                contactInfo: false,
                shipping: false
            },
            panels: {
                hideBillingAddress: true
            },
            results: {
                contactInfo: false,
                shipping: false,
                shippingMethod: false,
                payment: false
            }
        };
        $scope.customerGuid = "";
        $scope.contactInfo = contactInfoService.newContactInfo();
        $scope.countries = [];
        $scope.provinces = [];
        $scope.billingCountries = [];
        $scope.billingProvinces = [];
        $scope.quotes = [];
        $scope.shippingAddress = addressService.newAddress();
        $scope.billingAddress = addressService.newAddress();
        $scope.paymentMethod = "";
        $scope.paymentMethodKey = "";
        $scope.readyToComplete = function () {
            var result = false;
            if ($scope.completed.contactInfo && $scope.completed.shipping && $scope.completed.shippingMethod && $scope.completed.payment) {
                result = true;
            }
            return result;
        };
        $scope.shippingCost = 0;
        $scope.shippingMethod = false;
        $scope.shipMethodKey = "";
        $scope.subtotal = 0;
        $scope.summary = false;
        $scope.taxes = function () {
            if ($scope.summary) {
                return $scope.summary.taxTotal.toFixed(2);
            } else {
                return (0).toFixed(2);
            }

        };
        $scope.totalPrice = function () {
            var result = 0;
            result += $scope.subtotal * 1;
            result += $scope.shippingCost * 1;
            result += $scope.taxes() * 1;
            return (result * 1).toFixed(2);
        };

        $scope.bindBlurFocus = function () {
            //$(document).on('focus', 'form select', function () {

            //});
            //$("form :input").focus(function () {
            //    $("label[for='" + this.id + "']").addClass("labelfocus");
            //}).blur(function () {
            //    $("label").removeClass("labelfocus");
            //});
        };


        // Validate and complete the Contact Info step
        $scope.completeContactInfo = function () {
            var validated = false;
            if ($scope.checkout.contactFirst.$valid && $scope.checkout.contactLast.$valid && $scope.checkout.contactEmail.$valid) {
                validated = true;
            }
            if (validated) {
                $scope.completed.contactInfo = true;
                $scope.visible.errors.contactInfo = false;
                $scope.visible.results.contactInfo = true;
            } else {
                $scope.visible.errors.contactInfo = true;
            }
        };

        // Validate and complete the Shipping step
        $scope.completeShipping = function () {
            var validated = false;
            if ($scope.checkout.shippingFirst.$valid && $scope.checkout.shippingLast.$valid && $scope.checkout.shippingAddress1.$valid && $scope.checkout.shippingCity.$valid && $scope.filters.shippingRegion.id != -1 && $scope.checkout.shippingPostalCode.$valid && $scope.filters.shippingCountry.id != -1) {
                validated = true;
            }
            if (validated) {
                $scope.completed.shipping = true;
                $scope.visible.errors.shipping = false;
                $scope.visible.results.shipping = true;
                $scope.getQuotes();
                $scope.getSummary();
            } else {
                $scope.visible.errors.shipping = true;
            }
        };

        // Validate and complete the Shipping Method step
        $scope.completeShippingMethod = function () {
            var validated = false;
            if ($scope.filters.shippingMethod.id != -1) {
                validated = true;
            }
            if (validated) {
                $scope.completed.shippingMethod = true;
                $scope.visible.errors.shippingMethod = false;
                $scope.visible.results.shippingMethod = true;
                $scope.getSummary();
            } else {
                $scope.visible.errors.shippingMethod = true;
            }
        };

        // Complete and Validate the Payment Step
        $scope.completePayment = function () {
            var validated = false;
            if ($scope.checkout.billingFirst.$valid && $scope.checkout.billingLast.$valid && $scope.checkout.billingAddress1.$valid && $scope.checkout.billingCity.$valid && $scope.checkout.billingPostalCode.$valid && $scope.filters.paymentMethod.id != -1) {
                validated = true;
                if (!$scope.visible.panels.hideBillingAddress && $scope.filters.billingRegion.id != -1 && $scope.filters.billingCountry.id != -1) {
                    validate = false;
                }
            }
            if (validated) {
                $scope.completed.payment = true;
                $scope.visible.errors.payment = false;
                $scope.visible.results.payment = true;
            } else {
                $scope.visible.errors.payment = true;
            }
        };

        // Complete the order.
        $scope.completeOrder = function () {
            var email = $scope.contactInfo.email;
            var guid = $scope.customerGuid;
            var shipMethodKey = $scope.shipMethodKey;
            var paymentMethodKey = $scope.paymentMethodKey;
            if (shipMethodKey) {
                var shippingAddress = $scope.shippingAddress;
                if ($scope.visible.panels.hideBillingAddress) {
                    var billingAddress = $scope.shippingAddress;
                } else {
                    var billingAddress = $scope.billingAddress;
                }
                var shipMethodKey = $scope.shipMethodKey;
                var iShippingAddress = addressService.convertToIAddress(guid, shippingAddress);
                var iBillingAddress = addressService.convertToIAddress(guid, billingAddress);
                iShippingAddress.email = email;
                iBillingAddress.email = email;
                orderService.completeOrder(iShippingAddress, iBillingAddress, shipMethodKey, paymentMethodKey).then(function (response) {
                    if (response.redirect) {
                        window.location = response.redirect;
                    } else {
                        if (response.error) {
                            console.info(error);
                        }
                    }

                });
            }
        };

        // As shipping address is being changed, must reset the shipping methods to avoid conflict.
        $scope.editShipping = function () {
            $scope.visible.results.shipping = false;
            $scope.completed.shipping = false;
            $scope.completed.shippingMethod = false;
            $scope.visible.results.shippingMethod = false;
            $scope.shippingMethod = false;
            $scope.shipMethodKey = "";
            $scope.shippingCost = 0;
            $scope.filters.shippingMethod = $scope.options.shippingMethods[0];
            for (var i = 0; i < ($scope.options.shippingMethods.length - 1) ; i++) {
                $scope.options.shippingMethods.pop();
            };
        };

        // Get all the countries via API.
        $scope.getCountries = function () {
            countryService.getCountries().then(function (countries) {
                $scope.countries = countries;
                for (var i = 0; i < countries.length; i++) {
                    var newCountry = {
                        id: i,
                        name: countries[i].name
                    };
                    $scope.options.shippingCountries.push(newCountry);
                };
            });
        };

        $scope.getAllCountries = function () {
            countryService.getAllCountries().then(function (countries) {
                $scope.billingCountries = countries;
                for (var i = 0; i < countries.length; i++) {
                    var newCountry = {
                        id: i,
                        name: countries[i].name
                    };
                    $scope.options.billingCountries.push(newCountry);
                };
            });
        };

        // Get all the payment methods via API.
        $scope.getPaymentMethods = function () {
            paymentMethodService.getPaymentMethods().then(function (methods) {
                $scope.methods = methods;
                for (var i = 0; i < methods.length; i++) {
                    var newMethod = {
                        id: i,
                        name: methods[i].name
                    };
                    $scope.options.paymentMethods.push(newMethod);
                }
            });
        };

        // Get all the provinces via API.
        $scope.getProvinces = function () {
            provinceService.getProvinces().then(function (provinces) {
                $scope.provinces = provinces;
                for (var i = 0; i < provinces.length; i++) {
                    var newProvince = {
                        id: i,
                        name: provinces[i].name
                    };
                    $scope.options.shippingRegions.push(newProvince);
                };
            });
        };

        // Get all the provinces via API.
        $scope.getAllProvinces = function () {
            provinceService.getAllProvinces().then(function (provinces) {
                $scope.billingProvinces = provinces;
                for (var i = 0; i < provinces.length; i++) {
                    var newProvince = {
                        id: i,
                        name: provinces[i].name
                    };
                    $scope.options.billingRegions.push(newProvince);
                };
            });
        };

        // Get the shipping quotes for the customer based on their cart and shipping address.
        $scope.getQuotes = function () {
            var guid = $scope.customerGuid;
            var email = $scope.contactInfo.email;
            var iAddress = addressService.convertToIAddress(guid, $scope.shippingAddress);
            iAddress.email = email;
            shippingMethodService.getQuotes(iAddress).then(function (quotes) {
                $scope.quotes = quotes;
                for (var i = 0; i < ($scope.options.shippingMethods.length - 1) ; i++) {
                    $scope.options.shippingMethods.pop();
                };
                for (var i = 0; i < quotes.length; i++) {
                    var newQuote = {
                        id: i,
                        name: quotes[i].shippingMethodName + " ($" + quotes[i].rate.toFixed(2) + ")"
                    };
                    $scope.options.shippingMethods.push(newQuote);
                };
            });
        };

        // Get the preSaleSummary via API.
        $scope.getSummary = function () {
            var guid = $scope.customerGuid;
            var shipMethodKey = $scope.shipMethodKey;
            var paymentMethodKey = $scope.paymentMethodKey;
            if (shipMethodKey) {
                var shippingAddress = $scope.shippingAddress;
                if ($scope.visible.panels.hideBillingAddress) {
                    var billingAddress = $scope.shippingAddress;
                } else {
                    var billingAddress = $scope.billingAddress;
                }
                var shipMethodKey = $scope.shipMethodKey;
                var iShippingAddress = addressService.convertToIAddress(guid, shippingAddress);
                var iBillingAddress = addressService.convertToIAddress(guid, billingAddress);
                orderService.getSummary(iShippingAddress, iBillingAddress, shipMethodKey, paymentMethodKey).then(function (summary) {
                    $scope.summary = summary;
                });
            }
        }

        // Called when controller is loaded.
        $scope.init = function () {
            $scope.getCountries();
            $scope.getPaymentMethods();
            $scope.getProvinces();
            $scope.getAllCountries();
            $scope.getAllProvinces();
            $scope.bindBlurFocus();
        };

        // Update the applicable binding associaetd with the filter after a dropdown is used.
        $scope.updateFilterBinding = function (value, key) {
            switch (key) {
                case "billingCountry":
                    if (value > -1) {
                        $scope.billingAddress.countryCode = $scope.billingCountries[value * 1].countryCode;
                    }
                    break;
                case "billingRegion":
                    if (value > -1) {
                        $scope.billingAddress.region = $scope.billingProvinces[value * 1].provinceCode;
                    }
                    break;
                case "paymentMethod":
                    $scope.paymentMethod = $scope.methods[value * 1].name;
                    $scope.paymentMethodKey = $scope.methods[value * 1].key;
                    break;
                case "shippingCountry":
                    if (value > -1) {
                        $scope.shippingAddress.countryCode = $scope.countries[value * 1].countryCode;
                    }
                    break;
                case "shippingMethod":
                    if (value > -1) {
                        $scope.shippingMethod = $scope.quotes[value * 1].shippingMethodName;
                        $scope.shipMethodKey = $scope.quotes[value * 1].key;
                        $scope.shippingCost = $scope.quotes[value * 1].rate.toFixed(2);
                    }
                    break;
                case "shippingRegion":
                    if (value > -1) {
                        $scope.shippingAddress.region = $scope.provinces[value * 1].provinceCode;
                    }
                    break;
            };
        };

        // Load the init function.
        $scope.init();

    };

    app.controller("checkoutController", ["$scope", "addressService", "contactInfoService", "countryService", "paymentMethodService", "orderService", "provinceService", "shippingMethodService", checkoutController]);

}(angular.module("merchkitApp")));

// API ////////////////////////////////////////////////////////////////////////

(function (API, undefined) {

    // URL Constants
    API.URL_CONSTANTS = {
        COUNTRIES: {
            GET: "/umbraco/MerchKit/MerchKitApi/GetCountries",
            GET_ALL: "/umbraco/MerchKit/MerchKitApi/GetAllCountries"
        },
        ORDER: {
            PLACE: "/umbraco/MerchKit/MerchKitApi/PlaceOrder",
            GET_SUMMARY: "/umbraco/MerchKit/MerchKitApi/PrepareSale"
        },
        PAYMENT_METHODS: {
            GET: "/umbraco/MerchKit/MerchKitApi/GetPaymentMethods"
        },
        PROVINCES: {
            GET: "/umbraco/MerchKit/MerchKitApi/GetProvinces",
            GET_ALL: "/umbraco/MerchKit/MerchKitApi/GetAllProvinces"
        },
        SHIPPING_METHODS: {
            GET_QUOTES: "/umbraco/MerchKit/MerchKitApi/GetShippingMethodQuotes"
        }
    };

    // Countries
    API.Countries = function () {

        var self = this;

        // Get a list of countries that are shipped to.
        this.get = function () {
            var url = merchkit.API.URL_CONSTANTS.COUNTRIES.GET;
            var request = {};
            var response = function (response) {
                if (response) {
                    var output = response;
                } else {
                    var output = false;
                }
                return output;
            };
            var apiCall = {
                url: url,
                request: request,
                response: response
            };
            return apiCall;
        };

        // Get a list of all countries.
        this.getAll = function () {
            var url = merchkit.API.URL_CONSTANTS.COUNTRIES.GET_ALL;
            var request = {};
            var response = function (response) {
                if (response) {
                    var output = response;
                } else {
                    var output = false;
                }
                return output;
            };
            var apiCall = {
                url: url,
                request: request,
                response: response
            };
            return apiCall;
        };

    };

    // Order
    API.Order = function () {

        var self = this;

        // Get a pre-sale summary for the pending order with the provided addresses, shipping method, and payment method.
        this.getSummary = function (shippingAddress, billingAddress, shipMethodKey, paymentMethodKey) {
            var url = merchkit.API.URL_CONSTANTS.ORDER.GET_SUMMARY;
            var request = {
                shippingAddress: shippingAddress,
                billingAddress: billingAddress,
                shipMethodKey: shipMethodKey,
                paymentMethodKey: paymentMethodKey
            };
            var response = function (response) {
                if (response) {
                    var output = response;
                } else {
                    var output = false;
                }
                return output;
            };
            var apiCall = {
                url: url,
                request: request,
                response: response
            };
            return apiCall;
        };

        // Complete the order with the provided shipping and billing addresses, as well as the shipping method and payment method keys.
        this.completeOrder = function (shippingAddress, billingAddress, shipMethodKey, paymentMethodKey) {
            var url = merchkit.API.URL_CONSTANTS.ORDER.PLACE;
            var request = {
                shippingAddress: shippingAddress,
                billingAddress: billingAddress,
                shipMethodKey: shipMethodKey,
                paymentMethodKey: paymentMethodKey
            };
            var response = function (response) {
                if (response) {
                    var output = response;
                } else {
                    var output = false;
                }
                return output;
            };
            var apiCall = {
                url: url,
                request: request,
                response: response
            };
            return apiCall;
        };

    };

    //PaymentMethods
    API.PaymentMethods = function () {

        var self = this;

        // Get a list of payment methods.
        this.get = function () {
            var url = merchkit.API.URL_CONSTANTS.PAYMENT_METHODS.GET;
            var request = {};
            var response = function (response) {
                if (response) {
                    var output = response;
                } else {
                    var output = false;
                }
                return output;
            };
            var apiCall = {
                url: url,
                request: request,
                response: response
            };
            return apiCall;
        };
    };

    // Provinces
    API.Provinces = function () {

        var self = this;

        // Get a list of provinces.
        this.get = function () {
            var url = merchkit.API.URL_CONSTANTS.PROVINCES.GET;
            var request = {};
            var response = function (response) {
                if (response) {
                    var output = response;
                } else {
                    var output = false;
                }
                return output;
            };
            var apiCall = {
                url: url,
                request: request,
                response: response
            };
            return apiCall;
        };

        // Get a list of provinces.
        this.getAll = function () {
            var url = merchkit.API.URL_CONSTANTS.PROVINCES.GET_ALL;
            var request = {};
            var response = function (response) {
                if (response) {
                    var output = response;
                } else {
                    var output = false;
                }
                return output;
            };
            var apiCall = {
                url: url,
                request: request,
                response: response
            };
            return apiCall;
        };

    };

    // Shipping Methods
    API.ShippingMethods = function () {
    
        var self = this;

        // Get shipping method quotes with provided address.
        this.getQuotes = function (iAddress) {
            var url = merchkit.API.URL_CONSTANTS.SHIPPING_METHODS.GET_QUOTES;
            var request = iAddress;
            var response = function (response) {
                if (response) {
                    var output = response;
                } else {
                    var output = false;
                }
                return output;
            };
            var apiCall = {
                url: url,
                request: request,
                response: response
            };
            return apiCall;
        };
    };




}(window.merchkit.API = window.merchkit.API || {}));

// MODELS /////////////////////////////////////////////////////////////////////

(function (models, undefined) {

    // Address
    models.Address = function (addressSource) {

        var self = this;

        if (addressSource === undefined) {
            self.firstName = "";
            self.lastName = "";
            self.address1 = "";
            self.address2 = "";
            self.locality = "";
            self.region = "";
            self.postalCode = "";
            self.countryCode = "";
        } else {
            self.firstName = addressSource.firstName;
            self.lastName = addressSource.lastName;
            self.address1 = addressSource.address1;
            self.address2 = addressSource.address2;
            self.locality = addressSource.locality;
            self.region = addressSource.region;
            self.postalCode = addressSource.postalCode;
            self.countryCode = addressSource.countryCode;
        };

    };

    // Contact Info
    models.ContactInfo = function (contactInfoSource) {

        var self = this;

        if (contactInfoSource === undefined) {
            self.firstName = "";
            self.lastName = "";
            self.email = "";
        } else {
            self.firstName = contactInfoSource.firstName;
            self.lastName = contactInfoSource.lastName;
            self.email = contactInfoSource.email;
        }

    };

}(window.merchkit.Models = window.merchkit.Models || {}));

// SERVICES ///////////////////////////////////////////////////////////////////

(function (app) {

    // addressService
    var addressService = function () {

        var addressFactory = {};

        // Creates a new address object.
        addressFactory.newAddress = function (addressSource) {
            if (addressSource === undefined) {
                var address = new merchkit.Models.Address();
            } else {
                var address = new merchkit.Models.Address(addressSource);
            }
            return address;
        };

        // Converts the provided address to an iAddress object (for use with API calls).
        addressFactory.convertToIAddress = function (customerKey, addressSource) {
            if (addressSource === undefined) {
                var address = "";
            } else {
                var address = {
                    customerKey: customerKey,
                    address1: addressSource.address1,
                    address2: addressSource.address2,
                    countryCode: addressSource.countryCode,
                    email: "",
                    isCommercial: false,
                    locality: addressSource.locality,
                    name: addressSource.firstName + " " + addressSource.lastName,
                    organization: "",
                    phone: "",
                    postalCode: addressSource.postalCode,
                    region: addressSource.region
                };
            }
            return address;
        };

        return addressFactory;
    };

    app.factory("addressService", addressService);

    // contactInfoService
    var contactInfoService = function () {

        var contactInfoFactory = {};

        // Creates a new Contact Info object.
        contactInfoFactory.newContactInfo = function (contactInfoSource) {
            if (contactInfoSource === undefined) {
                var contactInfo = new merchkit.Models.ContactInfo();
            } else {
                var contactInfo = new merchkit.Models.ContactInfo(contactInfoSource);
            }
            return contactInfo;
        };

        return contactInfoFactory;
    };

    app.factory("contactInfoService", contactInfoService);

    // countryService
    var countryService = function ($http) {

        var countryFactory = {};

        // Gets just the countries that can be shipped to (via API).
        countryFactory.getCountries = function () {
            var countryAPI = new merchkit.API.Countries();
            var api = countryAPI.get();
            return $http.get(api.url, api.request).then(function (response) {
                return api.response(response.data);
            });
        };

        // Gets all the countries (via API).
        countryFactory.getAllCountries = function () {
            var countryAPI = new merchkit.API.Countries();
            var api = countryAPI.getAll();
            return $http.get(api.url, api.request).then(function (response) {
                return api.response(response.data);
            });
        };

        return countryFactory;
    };

    app.factory("countryService", countryService);

    // orderService
    var orderService = function ($http) {

        var orderFactory = {};

        // Gets the pre-sale summary (via API).
        orderFactory.getSummary = function (shippingAddress, billingAddress, shipMethodKey, paymentMethodKey) {
            var OrderAPI = new merchkit.API.Order();
            var api = OrderAPI.getSummary(shippingAddress, billingAddress, shipMethodKey, paymentMethodKey);
            return $http.post(api.url, api.request).then(function (response) {
                return api.response(response.data);
            });
        };

        // Completes the order (via API).
        orderFactory.completeOrder = function (shippingAddress, billingAddress, shipMethodKey, paymentMethodKey) {
            var OrderAPI = new merchkit.API.Order();
            var api = OrderAPI.completeOrder(shippingAddress, billingAddress, shipMethodKey, paymentMethodKey);
            return $http.post(api.url, api.request).then(function (response) {
                return api.response(response.data);
            });
        };

        return orderFactory;
    };

    app.factory("orderService", orderService);


    // paymentMethodService
    var paymentMethodService = function ($http) {

        var paymentMethodFactory = {};

        // Gets the payment methods available (via API).
        paymentMethodFactory.getPaymentMethods = function () {
            var paymentMethodAPI = new merchkit.API.PaymentMethods();
            var api = paymentMethodAPI.get();
            return $http.get(api.url, api.request).then(function (response) {
                return api.response(response.data);
            });
        };

        return paymentMethodFactory;
    };

    app.factory("paymentMethodService", paymentMethodService);

    // provinceService
    var provinceService = function ($http) {

        var provinceFactory = {};

        // Gets a list of shipping provinces (via API).
        provinceFactory.getProvinces = function () {
            var provinceAPI = new merchkit.API.Provinces();
            var api = provinceAPI.get();
            return $http.get(api.url, api.request).then(function (response) {
                return api.response(response.data);
            });
        };

        // Gets a list of all provinces (via API).
        provinceFactory.getAllProvinces = function () {
            var provinceAPI = new merchkit.API.Provinces();
            var api = provinceAPI.getAll();
            return $http.get(api.url, api.request).then(function (response) {
                return api.response(response.data);
            });
        };

        return provinceFactory;
    };

    app.factory("provinceService", provinceService);


    // shippingMethodService
    var shippingMethodService = function ($http) {

        var shippingMethodFactory = {};

        // Gets a list of shipping method quotes for the shipping address (via API).
        shippingMethodFactory.getQuotes = function (iAddress) {
            var shippingMethodAPI = new merchkit.API.ShippingMethods();
            var api = shippingMethodAPI.getQuotes(iAddress);
            return $http.post(api.url, api.request).then(function (response) {
                return api.response(response.data.quotes);
            });
        };

        return shippingMethodFactory;
    };

    app.factory("shippingMethodService", shippingMethodService);


}(angular.module("merchkitApp")));