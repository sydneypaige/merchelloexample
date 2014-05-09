// merch-functions.js | requires jQuery 1.10.1+, masonry.js, imagesloaded.pkgd.js | created by mindfly
// Created on December 9, 2013 | last updated December 23, 2013

var merch = {
    flag: [],
	init: function() {
		$(document).ready(function() {
		    merch.masonry.init();
		    merch.map.init();
		    merch.menu.init();
		    merch.productDescription.init();
		    merch.pseudoDropdown.init();
		    merch.scroll.init();
		    merch.search.init();
		    merch.merchProducts.init();
		});
	},
	geocode: function (location, format, callback) {
	    if ((typeof format) == "function") {
	        callback = format;
	        format = "latlng";
	    }
	    var originalFormat = "address";
	    switch ((typeof location)) {
	        case "string":
	            var originalSource = location;
	            break;
	        case "object":
	            if (location instanceof L.LatLng) {
	                originalFormat = "latlng";
	                var originalSource = location;
	            } else if (location instanceof L.Marker) {
	                originalFormat = "latlng";
	                var originalSource = location.getLatLng();
	            } else if (location instanceof jQuery) {
	                if (location.hasClass('vcard')) {
	                    originalFormat = "address";
	                    var originalSource = location.find('.street-address').text();
	                    originalSource += ' ' + location.find('.locality').text();
	                    originalSource += ', ' + location.find('.region').text();
	                    originalSource += ' ' + location.find('.postal-code').text();
	                } else if (location.hasClass('geo')) {
	                    originalFormat = "latlng";
	                    var originalSource = new L.LatLng(location.find('.latitude').text() * 1, location.find('.longitude').text() * 1);
	                }
	            } else if (location instanceof Array) {
	                originalFormat = "latlng";
	                var originalSource = new L.LatLng(location[0], location[1]);
	            }
	            break;
	    }
	    switch (format) {
	        case "latlng":
	            if (originalFormat == "latlng") {
	                callback(originalSource);
	            } else {
	                address = originalSource.replace(/ /gi, "+");
	                $.getJSON('http://nominatim.openstreetmap.org/search?format=json&q=' + address, function (data) {
	                    var coord = new L.LatLng(data[0].lat * 1, data[0].lon * 1);
	                    callback(coord);
	                });
	            }
	            break;
	        case "address":
	            if (originalFormat == "address") {
	                callback(originalSource);
	            } else {
	                var lat = originalSource.lat;
	                var lng = originalSource.lng;
	                $.getJSON('http://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&zoom=18&lat=' + lat + '&lon=' + lng, function (data) {
	                    if (data.length > 1) {
	                        callback(data[0].display_name);
	                    } else {
	                        callback(data.display_name);
	                    }
	                });
	            }
	            break;
	        case "geo":
	            if (originalFormat == "latlng") {
	                callback("<span class='geo'><span class='latitude'>" + originalSource.lat + "</span>, <span class='longitude'>" + originalSource.lng + "</span></span>");
	            } else {
	                address = originalSource.replace(/ /gi, "+");
	                $.getJSON('http://nominatim.openstreetmap.org/search?format=json&q=' + address, function (data) {
	                    var coord = new L.LatLng(data[0].lat * 1, data[0].lon * 1);
	                    callback("<span class='geo'><span class='latitude'>" + coord.lat + "</span>, <span class='longitude'>" + coord.lng + "</span></span>");
	                });
	            }
	            break;
	        default:
	            break;
	    }
	},
	map: {
	    init: function () {
	        if ($('#map').length) {
	            merch.geocode("114 W Magnolia Street, Bellingham WA, 98225", function (coord) {
	                var map = merch.map.loadView({ coord: coord, zoom: 15 });
	                merch.map.createMarker(map, coord);
	            });
	        };
	    },
	    createMarker: function (map, coord) {
	        var marker = L.marker(coord).addTo(map);
	        //marker.bindPopup("<strong>Come visit us!</strong><br><a href='http://goo.gl/maps/zDjow' target='_blank'>Get Directions</a>").openPopup();
	    },
	    loadView: function (view) {
	        var map = L.map('map').setView(view.coord, view.zoom);
	        L.tileLayer('http://{s}.tile.cloudmade.com/001412f68ffd4f2aa16358d6e33f6e7a/116932/256/{z}/{x}/{y}.png', {
	            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
	            maxZoom: 18
	        }).addTo(map);
	        return map;
	    }
	},
	masonry: {
	    init: function () {
	        if ($('.product-list').length) {
	            // Wait for all the images to load before using Masonry to avoid tile overlap.
	            $('.product-list').imagesLoaded(function () {
	                merch.masonry.load();
	            });
	        }
	    },
	    load: function () {
	        causeRepaintsOn = $("h1, h2, h3, p, blockquote");

	        $(window).resize(function () {
	            causeRepaintsOn.css("z-index", 1);
	        });

	        $('.product-list').masonry({
	            itemSelector: 'li',
	            columnWidth: '.product-list li'
	        });
	    }
	},
	math: {
	    units: {
	        toEm: function (px) {
	            if (!px) {
	                px = $(document).width();
	            }
	            px = parseInt(px, 10);
	            var scopeTest = jQuery('<div style="display: none; font-size: 1em; margin: 0; padding:0; height: auto; line-height: 1; border:0;">&nbsp;</div>').appendTo('body');
	            var scopeVal = scopeTest.height();
	            scopeTest.remove();
	            return (px / scopeVal).toFixed(8);
	        },
	        toPx: function (em) {
	            em = parseFloat(em);
	            var scopeTest = jQuery('<div style="display: none; font-size: 1em; margin: 0; padding:0; height: auto; line-height: 1; border:0;">&nbsp;</div>').appendTo('body');
	            var scopeVal = scopeTest.height();
	            scopeTest.remove();
	            return Math.round(em * scopeVal);
	        }
	    }
	},
	menu: {
	    init: function () {
	        if ($('nav#main').length) {
	            merch.menu.build();
	            merch.menu.bind();
	        }
	    },
	    bind: function() {
	        $(document).on('click', '.nav-toggle', function () {
	            if ($(this).find('i').hasClass('fa-angle-down')) {
	                $(this).find('i').addClass('fa-angle-up').removeClass('fa-angle-down');
	            } else {
	                $(this).find('i').addClass('fa-angle-down').removeClass('fa-angle-up');
	            }
	            $('nav#main').slideToggle();
	        });
	    },
	    build: function () {
	        $('header h1').after('<a class="nav-toggle"><i class="fa fa-angle-down"></i></a>');
	    }
	},
	productDescription: {
	    init: function () {
	        if ($('button.toggle').length) {
	            merch.productDescription.setHeights();
	            merch.productDescription.bind();
	        }
	    },
	    bind: function () {
	        $(document).on('click', 'button.toggle', function () {
	            merch.productDescription.toggle($(this));
	        });
	    },
	    getFullHeight: function() {
	        return merch.flag["descriptionFullHeight"];
	    },
	    getOriginalHeight: function () {
	        return merch.flag["descriptionOriginalHeight"];
	    },
	    setHeights: function () {
	        if (!merch.flag["descriptionOriginalHeight"]) {
	            merch.flag["descriptionOriginalHeight"] = $('.description').height();
	        }
	        if (!merch.flag["descriptionFullHeight"]) {
	            $('.description').css({ height: 'auto', opacity: '0', position: 'absolute' });
	            $('h1 + form').css({ marginBottom: '345px' });
	            merch.flag["descriptionFullHeight"] = $('.description').height();
	            $('.description, h1 + form').attr('style', '');
	        }
	        $('.description').removeClass('closed').css({ height: +merch.productDescription.getOriginalHeight() + 'px' });
	    },
	    toggle: function (elem) {
	        var description = elem.siblings('.description');
	        if (elem.text() == "More") {
	            elem.text("Less");
	            description.animate({ height: merch.productDescription.getFullHeight() + 'px' });
	        } else {
	            elem.text("More");
	            description.animate({ height: merch.productDescription.getOriginalHeight() + 'px' });
	        }
	    }
	},
	pseudoDropdown: {
	    init: function () {
	        if ($('.pseudo.dropdown').length) {
	            //merch.pseudoDropdown.insertDefault();
	            merch.pseudoDropdown.bind();
	        }
	    },
	    assignValue: function (elem) {
	        var value = elem.find('option:selected').html();
	        var fakeInput = elem.siblings('span.value');
	        fakeInput.text(value);
	    },
	    bind: function () {
	        $(document).on('change', '.pseudo.dropdown select', function () {
	            merch.pseudoDropdown.assignValue($(this));
	        });
	    },
	    //insertDefault: function () {
	    //    $('.pseudo.dropdown select').each(function () {
	    //        $(this).prepend('<option value="0">Select Value</option>');
	    //        $(this).val('default');
	    //    });
	    //}
	},
	scroll: {
	    init: function () {
	        merch.scroll.bind();
	    },
	    bind: function () {
	        merch.scroll.link('#quick-links');
	        merch.scroll.link('#top');
	    },
	    link: function (selector) {
	        $(document).on('click', 'a[href="' + selector + '"]', function () {
	            merch.scroll.to(selector);
	            return false;
	        });
	    },
	    to: function (selector) {
	        $('html, body').animate({ scrollTop: $(selector).offset().top }, 1000);
	    }
	},
	search: {
	    init: function () {
	        if ($('.search').length) {
	            merch.search.build();
	            merch.search.bind();
	        }
	    },
	    bind: function () {
	        $(document).on('click', 'a.search', function () {
	            if (!$('.search-box').hasClass('open')) {
	                merch.search.toggleView();
	            } else {
	                if ($('#search').val() != "") {
	                    merch.search.submit($('#search').val());
	                } else {
	                    merch.search.toggleView(false);
	                }
	            }
	        });
	        $(document).on('keypress', '#search', function (e) {
	            var code = e.keyCode || e.which;
	            if (code == 13) {
	                if ($('#search').val() != "") {
	                    merch.search.submit($('#search').val());
	                } else {
	                    merch.search.toggleView(false);
	                }
	            }
	        });
	    },
	    boxWidth: function(value) {
	        if (!value) {
	            return merch.flag['searchBoxWidth'];
	        } else {
	            merch.flag['searchBoxWidth'] = value;
	        }
	    },
	    build: function () {
	        var searchBoxMarkup = '<li class="search-box"><input type="text" id="search" placeholder="search for..." /></li>';
	        $('ul.social').prepend(searchBoxMarkup);
	        $('li.search-box, li.search-box + li').addClass('keep-open');
	        merch.search.socialIconWidth($('.social li:not(.keep-open):eq(0)').width());
	        merch.search.boxWidth($('.social').width() - ($('.search-box + li').width() + 28));
	    },
	    socialIconWidth: function(value) {
	        if (!value) {
	            return merch.flag['socialIconOriginalWidth'];
	        } else {
	            merch.flag['socialIconOriginalWidth'] = value;
	        }
	    },
	    submit: function (value) {
	        // Note from Kyle: Fire the appropriate search function here.
	        console.info('Searching for "' + value + '" (if the search was actually wired up. Which it isn\'t.)');
	    },
	    toggleView: function (show) {
	        if ((typeof show) == "undefined") {
	            if ($('.search-box').hasClass('open')) {
	                show = false;
	            } else {
	                show = true;
	            }
	        }
	        if (show) {
	            $('.search-box').addClass('open');
	            $('.search-box input').css({ width: merch.search.boxWidth() + 'px' });
	            $('.social li:not(.keep-open)').animate({ width: '0px' }, function () {
	                $(this).css({ display: 'none' });
	            });
	        } else {
	            $('.search-box').removeClass('open');
	            $('.search-box input').css({ width: '0px' });
	            $('.social li:not(.keep-open)').css({ display: 'inline-block' }).animate({ width: merch.flag['socialIconOriginalWidth'] + 'px' });
            }
	    }
	},
	merchProducts: {
	    init: function () {
	        merch.merchProducts.getVariantPrice();
	    },

	    updateAddToCartVariants: function (variants, changedElement) {
	        var allVariants = [];

	        $.each(variants, function (index, variant) {
	            $.each(variant.attributes, function (i, el) {
	                if (el.optionKey != changedElement.id) {
	                    allVariants.push(el.key);
	                }
	            });
	        });

	        var uniqueVariants = $.unique(allVariants);

	        $.each($(".ProductVariants"), function (i, productVariant) {
	            $.each(productVariant.options, function (j, option) {
	                if (productVariant.id != changedElement.id) {
	                    if ($.inArray(option.value, uniqueVariants) >= 0) {
	                        $(option).show();
	                    }
	                    else {
	                        $(option).hide();
	                    }
	                }
	            });
	        });
	    },
        getVariantPrice: function () {
            var options = "";
            $.each($(".ProductVariants"), function(index, element) {
                options = options + element.selectedOptions[0].value + ",";
            });

            var variantOptions = {};
            variantOptions.productKey = $("#ProductKey")[0].value;
            variantOptions.optionChoiceKeys = options;
            
            $.ajax({
                type: "GET",
                url: "/umbraco/MerchKit/MerchKitApi/GetProductVariantPrice",
                data: variantOptions,
                success: function(price) {
                    $("#ProductPrice").text(price);
                },
                dataType: "json",
                traditional: true
            }).fail(function (ex) {
                $.error(ex);
            });
        },
        getUpdatedVariants: function (variant) {

            var options = variant.selectedOptions[0].value;

            var variantOptions = {};
            variantOptions.productKey = $("#ProductKey")[0].value;
            variantOptions.optionChoices = options;

            $.ajax({
                type: "GET",
                url: "/umbraco/MerchKit/MerchKitApi/FilterOptionsBySelectedChoices",
                data: variantOptions,
                success: function(variants){
                    merch.merchProducts.updateAddToCartVariants(variants, variant);
                    merch.merchProducts.getVariantPrice();
                },
                dataType: "json",
                traditional: true
            }).fail(function (ex) {
                $.error(ex);
            });
        }
    }
};
merch.init();