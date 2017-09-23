webpackJsonp([0],{

/***/ 100:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });


/* harmony default export */ __webpack_exports__["default"] = (angular.module('currencySymbolService', [])

.factory('currencySymbolFactory', ['$http', '$q', function($http, $q) {
    return function getCurrencySymbol(country_code) {
        var myPromise = $q.defer();
        return $http.get("/static/sources/createMeal/currency.json").then(function(result_currency) {
            return $http.get("/static/sources/createMeal/currency_symbol.json").then(function(result_currency_symbol) {
                var currency = result_currency.data[country_code];
                myPromise.resolve(result_currency_symbol.data[currency].symbol_native);
                return myPromise.promise;
            });
        });
    };
}]));

/***/ }),

/***/ 101:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });


/* harmony default export */ __webpack_exports__["default"] = (angular.module('dateDropdownService', [])

.factory('rsmdateutils', function() {
    var that = this,
        dayRange = [1, 31],


        months = [{
            value: 0,
            name: 'January'
        }, {
            value: 1,
            name: 'February'
        }, {
            value: 2,
            name: 'March'
        }, {
            value: 3,
            name: 'April'
        }, {
            value: 4,
            name: 'May'
        }, {
            value: 5,
            name: 'June'
        }, {
            value: 6,
            name: 'July'
        }, {
            value: 7,
            name: 'August'
        }, {
            value: 8,
            name: 'September'
        }, {
            value: 9,
            name: 'October'
        }, {
            value: 10,
            name: 'November'
        }, {
            value: 11,
            name: 'December'
        }];

    function changeDate(date) {
        if (date.day > 28) {
            date.day--;
            return date;
        }
        else if (date.month > 11) {
            date.day = 31;
            date.month--;
            return date;
        }
    }

    return {
        checkDate: function(date) {
            var d;
            if (!date.day || !date.month || !date.year) return false;
            d = new Date(Date.UTC(date.year, date.month, date.day));

            if (d && (d.getMonth() === date.month && d.getDate() === Number(date.day))) {
                return d;
            }

            return this.checkDate(changeDate(date));
        },
        days: (function() {
            var days = [];
            while (dayRange[0] <= dayRange[1]) {
                days.push(dayRange[0]++);
            }
            return days;
        }()),
        months: (function() {

                return months;
            }())
            //months: (function () {
            //    var lst = [],
            //        mLen = months.length;

        //    while (mLen--) {
        //        lst.push({
        //            value: mLen,
        //            name: months[mLen]
        //        });
        //    }
        //    return lst;
        //}())
    };
})

.directive('datedropdowns', ['rsmdateutils', function(rsmdateutils) {
    return {
        restrict: 'A',
        replace: true,
        require: 'ngModel',
        scope: {
            model: '=ngModel'
        },
        controller: ['$scope', 'rsmdateutils', '$filter', function($scope, rsmDateUtils, $filter) {
            $scope.days = rsmDateUtils.days;
            $scope.months = rsmDateUtils.months;

            function checkIfExistBefore() {
                if ($scope.model == undefined) {
                    $scope.dateFields = {};
                }
                else {
                    var value = $scope.model.split("-");
                    if (value[1] == "0") {
                        var month = 0;
                    }
                    else {
                        var month = parseInt(value[1], 10) - 1;
                    }
                    $scope.dateFields = {
                        "year": parseInt(value[0], 10),
                        "month": month,
                        "day": parseInt(value[2].substring(0, 2), 10)
                    };
                }
            }

            checkIfExistBefore();


            $scope.$watch('model', function(newDate) {
                // if (newDate&&$scope.$parent.travel.program != null)
                if (newDate) {
                }
            });

            $scope.checkDate = function() {
                var date = rsmDateUtils.checkDate($scope.dateFields);
                if (date) {
                    $scope.model = date;
                }
            };
        }],
        template: '<div>' +
            '    <select name="dateFields.day" data-ng-model="dateFields.day"  class="form-control" ng-options="day for day in days" ng-change="checkDate()" ng-disabled="disableFields"></select>' +
            '    <select name="dateFields.month" data-ng-model="dateFields.month" class="form-control" ng-options="month.value as month.name for month in months" value="{{ dateField.month }}" ng-change="checkDate()" ng-disabled="disableFields" ></select>' +
            '    <select name="dateFields.year" data-ng-model="dateFields.year"  class="form-control" ng-options="year for year in years" ng-change="checkDate()" ng-disabled="disableFields"  ></select>' +
            '</div>',
        link: function(scope, element, attrs, ctrl) {
            var currentYear = parseInt(attrs.startingYear, 10) || new Date().getFullYear(),
                numYears = parseInt(attrs.numYears, 10) || 100,
                oldestYear = currentYear - numYears,
                overridable = [
                    'dayDivClass',
                    'dayClass',
                    'monthDivClass',
                    'monthClass',
                    'yearDivClass',
                    'yearClass'
                ],
                required;

            scope.years = [];
            scope.yearText = attrs.yearText ? true : false;

            if (attrs.ngDisabled) {
                scope.$parent.$watch(attrs.ngDisabled, function(newVal) {
                    scope.disableFields = newVal;
                });
            }

            //if (attrs.required) {
            //    required = attrs.required.split(' ');

            //    ctrl.$parsers.push(function (value) {
            //        angular.forEach(required, function (elem) {
            //            if (!angular.isNumber(elem)) {
            //                ctrl.$setValidity('required', false);
            //            }
            //        });
            //        ctrl.$setValidity('required', true);
            //    });
            //}

            for (var i = currentYear; i >= oldestYear; i--) {
                scope.years.push(i);
            }

            (function() {
                var oLen = overridable.length,
                    oCurrent,
                    childEle;
                while (oLen--) {
                    oCurrent = overridable[oLen];
                    childEle = element[0].children[Math.floor(oLen / 2)];

                    if (oLen % 2 && oLen != 2) {
                        childEle = childEle.children[0];
                    }

                    if (attrs[oCurrent]) {
                        angular.element(childEle).attr('class', attrs[oCurrent]);
                    }
                }
            }());
        }
    };
}]));

/***/ }),

/***/ 102:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });


/* harmony default export */ __webpack_exports__["default"] = (angular.module('facebookService', [])

.factory('getEventFacebook', ['$q', function($q) {
    return {
        getEvent: function(user_id) {
            var deferred = $q.defer();
            FB.api('/' + user_id + '/events', {
                fields: 'data'
            }, function(response) {
                if (!response || response.error) {
                    deferred.reject('Error occured');
                }
                else {
                    deferred.resolve(response);
                }
            });
            return deferred.promise;
        }
    };
}]));

/***/ }),

/***/ 103:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });


/* harmony default export */ __webpack_exports__["default"] = (angular.module('getReviewService', [])

.factory('getMealReviewServiceFactory', ['$http', function($http) {

    return function getReviews(mealId, userId) { //récupère les commentaires propres à un repas fait par un user specific
        return $http.get('/api/reviews?where={"mealAssociated": "' + mealId + '", "fromUser._id": "' + userId + '"}').then(function successCallback(result) {
            // this callback will be called asynchronously
            // when the response is available
            return result.data['_items'];
        }, function errorCallback(result) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            console.log("getUserInfo error", result);
        });
    };

}])

.factory('getUserReviewServiceFactory', ['$http', function($http) {

    return function getReviews(participantId) { //récupère les commentaires fait à un utiisateur en particulier
        return $http.get('/api/reviews?where={"forUser._id": "' + participantId + '"}').then(function successCallback(result) {
            // this callback will be called asynchronously
            // when the response is available
            return result.data['_items'];
        }, function errorCallback(result) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            console.log("getUserInfo error", result);
        });
    };

}]));

/***/ }),

/***/ 104:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });


/* harmony default export */ __webpack_exports__["default"] = (angular.module('userServices', [])

.factory('userServicesFactory', ['$http', function($http) {

    return function getUserInfo() {
        return $http.get('/api/users/private').then(function successCallback(result) {
            // this callback will be called asynchronously
            // when the response is available
            return result.data['_items'][0];
        }, function errorCallback(result) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            console.log("getUserInfo error", result);
        });
    };

}])

.factory('getSpecificUserFactory', ['$http', function($http) {

    return function getUserInfo(userId) {
        return $http.get('/api/users?where={"_id": "' + userId + '"}').then(function successCallback(result) {
            // this callback will be called asynchronously
            // when the response is available
            return result.data['_items'][0];
        }, function errorCallback(result) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            console.log("getUserInfo error", result);
        });
    };

}]));

/***/ }),

/***/ 62:
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),

/***/ 63:
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var stylesInDom = {};

var	memoize = function (fn) {
	var memo;

	return function () {
		if (typeof memo === "undefined") memo = fn.apply(this, arguments);
		return memo;
	};
};

var isOldIE = memoize(function () {
	// Test for IE <= 9 as proposed by Browserhacks
	// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
	// Tests for existence of standard globals is to allow style-loader
	// to operate correctly into non-standard environments
	// @see https://github.com/webpack-contrib/style-loader/issues/177
	return window && document && document.all && !window.atob;
});

var getElement = (function (fn) {
	var memo = {};

	return function(selector) {
		if (typeof memo[selector] === "undefined") {
			memo[selector] = fn.call(this, selector);
		}

		return memo[selector]
	};
})(function (target) {
	return document.querySelector(target)
});

var singleton = null;
var	singletonCounter = 0;
var	stylesInsertedAtTop = [];

var	fixUrls = __webpack_require__(64);

module.exports = function(list, options) {
	if (typeof DEBUG !== "undefined" && DEBUG) {
		if (typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};

	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (!options.singleton) options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
	if (!options.insertInto) options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (!options.insertAt) options.insertAt = "bottom";

	var styles = listToStyles(list, options);

	addStylesToDom(styles, options);

	return function update (newList) {
		var mayRemove = [];

		for (var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];

			domStyle.refs--;
			mayRemove.push(domStyle);
		}

		if(newList) {
			var newStyles = listToStyles(newList, options);
			addStylesToDom(newStyles, options);
		}

		for (var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];

			if(domStyle.refs === 0) {
				for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();

				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom (styles, options) {
	for (var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];

		if(domStyle) {
			domStyle.refs++;

			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}

			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];

			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}

			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles (list, options) {
	var styles = [];
	var newStyles = {};

	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = options.base ? item[0] + options.base : item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};

		if(!newStyles[id]) styles.push(newStyles[id] = {id: id, parts: [part]});
		else newStyles[id].parts.push(part);
	}

	return styles;
}

function insertStyleElement (options, style) {
	var target = getElement(options.insertInto)

	if (!target) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}

	var lastStyleElementInsertedAtTop = stylesInsertedAtTop[stylesInsertedAtTop.length - 1];

	if (options.insertAt === "top") {
		if (!lastStyleElementInsertedAtTop) {
			target.insertBefore(style, target.firstChild);
		} else if (lastStyleElementInsertedAtTop.nextSibling) {
			target.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			target.appendChild(style);
		}
		stylesInsertedAtTop.push(style);
	} else if (options.insertAt === "bottom") {
		target.appendChild(style);
	} else {
		throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
	}
}

function removeStyleElement (style) {
	if (style.parentNode === null) return false;
	style.parentNode.removeChild(style);

	var idx = stylesInsertedAtTop.indexOf(style);
	if(idx >= 0) {
		stylesInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement (options) {
	var style = document.createElement("style");

	options.attrs.type = "text/css";

	addAttrs(style, options.attrs);
	insertStyleElement(options, style);

	return style;
}

function createLinkElement (options) {
	var link = document.createElement("link");

	options.attrs.type = "text/css";
	options.attrs.rel = "stylesheet";

	addAttrs(link, options.attrs);
	insertStyleElement(options, link);

	return link;
}

function addAttrs (el, attrs) {
	Object.keys(attrs).forEach(function (key) {
		el.setAttribute(key, attrs[key]);
	});
}

function addStyle (obj, options) {
	var style, update, remove, result;

	// If a transform function was defined, run it on the css
	if (options.transform && obj.css) {
	    result = options.transform(obj.css);

	    if (result) {
	    	// If transform returns a value, use that instead of the original css.
	    	// This allows running runtime transformations on the css.
	    	obj.css = result;
	    } else {
	    	// If the transform function returns a falsy value, don't add this css.
	    	// This allows conditional loading of css
	    	return function() {
	    		// noop
	    	};
	    }
	}

	if (options.singleton) {
		var styleIndex = singletonCounter++;

		style = singleton || (singleton = createStyleElement(options));

		update = applyToSingletonTag.bind(null, style, styleIndex, false);
		remove = applyToSingletonTag.bind(null, style, styleIndex, true);

	} else if (
		obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function"
	) {
		style = createLinkElement(options);
		update = updateLink.bind(null, style, options);
		remove = function () {
			removeStyleElement(style);

			if(style.href) URL.revokeObjectURL(style.href);
		};
	} else {
		style = createStyleElement(options);
		update = applyToTag.bind(null, style);
		remove = function () {
			removeStyleElement(style);
		};
	}

	update(obj);

	return function updateStyle (newObj) {
		if (newObj) {
			if (
				newObj.css === obj.css &&
				newObj.media === obj.media &&
				newObj.sourceMap === obj.sourceMap
			) {
				return;
			}

			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;

		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag (style, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (style.styleSheet) {
		style.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = style.childNodes;

		if (childNodes[index]) style.removeChild(childNodes[index]);

		if (childNodes.length) {
			style.insertBefore(cssNode, childNodes[index]);
		} else {
			style.appendChild(cssNode);
		}
	}
}

function applyToTag (style, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		style.setAttribute("media", media)
	}

	if(style.styleSheet) {
		style.styleSheet.cssText = css;
	} else {
		while(style.firstChild) {
			style.removeChild(style.firstChild);
		}

		style.appendChild(document.createTextNode(css));
	}
}

function updateLink (link, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/*
		If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
		and there is no publicPath defined then lets turn convertToAbsoluteUrls
		on by default.  Otherwise default to the convertToAbsoluteUrls option
		directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls) {
		css = fixUrls(css);
	}

	if (sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = link.href;

	link.href = URL.createObjectURL(blob);

	if(oldSrc) URL.revokeObjectURL(oldSrc);
}


/***/ }),

/***/ 64:
/***/ (function(module, exports) {


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
  // get current location
  var location = typeof window !== "undefined" && window.location;

  if (!location) {
    throw new Error("fixUrls requires window.location");
  }

	// blank or null?
	if (!css || typeof css !== "string") {
	  return css;
  }

  var baseUrl = location.protocol + "//" + location.host;
  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
	This regular expression is just a way to recursively match brackets within
	a string.

	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
	   (  = Start a capturing group
	     (?:  = Start a non-capturing group
	         [^)(]  = Match anything that isn't a parentheses
	         |  = OR
	         \(  = Match a start parentheses
	             (?:  = Start another non-capturing groups
	                 [^)(]+  = Match anything that isn't a parentheses
	                 |  = OR
	                 \(  = Match a start parentheses
	                     [^)(]*  = Match anything that isn't a parentheses
	                 \)  = Match a end parentheses
	             )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
	 \)  = Match a close parens

	 /gi  = Get all matches, not the first.  Be case insensitive.
	 */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function(o, $1){ return $1; })
			.replace(/^'(.*)'$/, function(o, $1){ return $1; });

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(unquotedOrigUrl)) {
		  return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
		  	//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};


/***/ }),

/***/ 78:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const angular = __webpack_require__(9);
//css//
//require('./dist/bootstrap.bundle.js');
//require('./css/app.css');
__webpack_require__(80);
//require('./bower_components/font-awesome/css/font-awesome.min.css');
//controllers//
__webpack_require__(89);
__webpack_require__(90);
__webpack_require__(91);
__webpack_require__(92);
__webpack_require__(93);
__webpack_require__(94);
__webpack_require__(95);
__webpack_require__(96);
__webpack_require__(97);
__webpack_require__(98);
//components//
__webpack_require__(99);
__webpack_require__(100);
__webpack_require__(101);
__webpack_require__(102);
__webpack_require__(103);
__webpack_require__(104);
//bower-components//
/*require('./bower_components/angular/angular.min.js');
require('./bower_components/angular-sanitize/angular-sanitize.min.js');
require('./bower_components/angular-ui-router/release/angular-ui-router.min.js');
require('./bower_components/satellizer/satellizer.min.js');
require('./bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js');
require('./bower_components/angular-animate/angular-animate.min.js');
require('./bower_components/angular-svg-round-progressbar/build/roundProgress.min.js');
require('./bower_components/angular-filter/dist/angular-filter.min.js');
require('./bower_components/angular-loading-bar/build/loading-bar.js');
require('./bower_components/angular-easyfb/build/angular-easyfb.min.js');
require('./bower_components/ngAutocomplete/src/ngAutocomplete.js');
require('./bower_components/ngmap/build/scripts/ng-map.min.js');*/

var translationsEN = {
  "WELCOME": {
    "CREATE_A_MEAL": 'create a meal',
    "BROWSE_A_MEAL": 'browse a meal',
    "HOW_IT_WORKS": 'How it works',
    "PUBLICATION": {
      "TITLE": 'Publication',
      "PARAGRAPH": 'A member publishes a meal, choosing the number of participants and their roles.'
    },
    "SUBSCRIPTION": {
      "TITLE": 'Subscription',
      "PARAGRAPH": 'Others members subscribe, selecting the role they want to take.'
    },
    "PARTICIPATION": {
      "TITLE": 'Participation',
      "PARAGRAPH": 'Let’s enjoy, preparing together and eating together the meal.'
    },
    "DIFFERENT_ROLES": {
      "TITLE": '4 different roles',
      "HOST": {
        "NAME": 'Host',
        "DESCRIPTION": 'The Host is the one who organizes the meal and receives at home. He is in charge of the groceries.'
      },
      "HELP_COOKING": {
        "NAME": 'Help cooking',
        "DESCRIPTION": 'The Help cooking are helpers guests. They will arrive earlier in order to help the host to cook.'
      },
      "HELP_CLEANING": {
        "NAME": 'Help cleaning',
        "DESCRIPTION": 'The Help cleaning are helpers guests. They will help the host to clean the dishes and order.'
      },
      "SIMPLE_GUEST": {
        "NAME": 'Simple guest',
        "DESCRIPTION": 'The Simple guests are guests. They won’t help the host but they will pay a little bit more.'
      },
    },
    "WHAT_ABOUT_MONEY": {
      "TITLE": 'What about the money ?',
      "PARAGRAPH": 'The price of the groceries is shared between the participants.',
      "WITHOUT_SIMPLE_GUEST": {
        "TITLE": 'Without simple guests',
        "PARAGRAPH": 'Everybody pays the same.'
      },
      "WITH_SIMPLE_GUEST": {
        "TITLE": 'With simple guests',
        "PARAGRAPH": 'Simple guests pay a little bit more and this surplus is shared between the host and the helpers.'
      },
      "PARAGRAPH_2": 'You pay directly to the host who bought the groceries.',
      "PARAGRAPH_2_STRONG": 'THERE ARE NO WEBSITE FEES. Our service is completely free.'
    },
    "VALUES": {
      "TITLE": 'values',
      "MEETING": {
        "NAME": 'MEETING',
        "DESCRIPTION": 'Meet gorgeous people from all over the world'
      },
      "SHARING": {
        "NAME": 'SHARING',
        "DESCRIPTION": 'Share together the meal but also its preparation and the price of the groceries'
      },
      "AUTHENTICITY_SIMPLICITY": {
        "NAME_1": 'AUTHENTICITY',
        "NAME_2": '& SIMPLICITY',
        "DESCRIPTION": 'Enjoy homemade food. All level of cookers are welcomed to organize meals'
      },
      "FRIENDLINESS": {
        "NAME": 'FRIENDLINESS',
        "DESCRIPTION": 'Organize or participate to meals from three participants to many more'
      },
      "COMMUNITY": {
        "NAME": 'COMMUNITY',
        "DESCRIPTION": 'Join events where all the members of myCommuneaty are invited'
      },
      "NEW": {
        "NAME": 'NEW',
        "DESCRIPTION": 'Join us to start together this amazing adventure, launched in April 2017'
      }
    }
  },

  "CREATE_A_MEAL": {
    "TITLE": '- Create a new meal -',
    "FORM": {
      "PUBLIC_INFO": 'Public information',
      "MENU_TITLE": 'Title of your menu',
      "MENU_DESCRIPTION": 'Menu description (optional)',
      "SPECIAL_MEAL": {
        "TITLE": 'Special meal? ',
        "TOOLTIP": 'do not check if not'
      },
      "VEGETARIAN": 'Vegetarian',
      "VEGAN": 'Vegan',
      "KOSHER": 'Kosher',
      "HALAL": 'Halal',
      "DATE": 'Date',
      "TIMEPICKER_TITLE": 'Time of the meal',
      "PARTICIPANTS": 'Participants',
      "ARRIVAL_TIME": 'Arrival time',
      "HOST": {
        "NAME": 'Host (you)'
      },
      "HELP_COOKING": {
        "NAME": "@:WELCOME.DIFFERENT_ROLES.HELP_COOKING.NAME",
        "TOOLTIP": 'People will help you for cooking'
      },
      "HELP_CLEANING": {
        "NAME": "@:WELCOME.DIFFERENT_ROLES.HELP_CLEANING.NAME",
        "TOOLTIP": 'People will help you for cleaning'
      },
      "SIMPLE_GUEST": {
        "NAME": "@:WELCOME.DIFFERENT_ROLES.SIMPLE_GUEST.NAME",
        "TOOLTIP": 'People will help you for cleaning'
      },
      "GROCERIES_PRICE": 'Price of the groceries',
      "PRIVATE_INFO": 'Private information: displayed only to participants',
      "ADDRESS": 'Address',
      "ADDRESS_COMPLEMENT": 'Additional information (flat number, floor, ...)',
      "CELLPHONE": {
        "NAME": 'Cellphone',
        "TOOLTIP": 'Private information: displayed only for participants'
      },
      "ERROR": {
        "TITLE_1": 'Please fill the missing field',
        "TITLE_2": 's', //if there are more than 1 error field
        "TITLE_3": 'and try again: ',
        "MENU": 'Menu',
        "GROCERIES_PRICE": 'price of the groceries',
        "ADDRESS": 'Address',
        "ARRIVAL_TIME_HELP_COOKING": 'arrival time for help cooking',
        "CELLPHONE": 'phone number',
        "INCORRECT_CELLPHONE": 'Your phone number is incorrect.'
      },
      "NOTIFICATIONS": {
        "TITLE": 'Notifications',
        "AUTOMATIC_BOOKING": {
          "TITLE": 'Automatically approve bookings?',
          "NO": 'No, thanks. ',
          "NO_TOOLTIP": 'You approve each booking request yourself',
          "YES": 'Yes, sure !'
        },
        "MESSENGER_1": 'Do you want to receive updates about the meal on messenger?',
        "MESSENGER_2": '(highly recommended)',
        "MESSENGER_ALREADY": 'You already subscribed for receiving updates through messenger.',
      },
      "PUBLISH": 'Publish the meal',
      "PUBLISH_NOT_CONNECTED": 'Sign In with facebook and',
    }
  },
  "VIEW_MEALS": {
    "TITLE": '- Incoming meals -',
    "ORDER_BY": {
      "NAME": 'Order by',
      "POPOVER": 'Starting time'
    },
    "FILTERS": {
      "NAME": 'Filters',
      "FILTER_BY": 'Filter by',
      "CITY": {
        "TITLE": 'City',
        "PLACEHOLDER": 'City, Suburb...',
        "TITLE_MOBILE": 'Chose a city'
      },
      "DAY": {
        "TITLE": 'Day',
        "TITLE_MOBILE": 'Chose the days of the week',
      },
      "PERIOD": {
        "TITLE": 'Period',
        "TITLE_MOBILE": 'Chose a period',
        "PLACEHOLDER_FROM": 'From',
        "PLACEHOLDER_TO": 'To'
      },
      "PRICE": {
        "TITLE": 'Price',
        "TITLE_MOBILE": 'Chose a price range',
        "PLACEHOLDER_FROM": "From",
        "PLACEHOLDER_TO": "To"
      },
      "PREFERENCES": {
        "TITLE": 'Preferences',
        "TITLE_MOBILE": 'Meal preferences',
        "VEGETARIAN": "@:CREATE_A_MEAL.FORM.VEGETARIAN",
        "VEGAN": "@:CREATE_A_MEAL.FORM.VEGAN",
        "KOSHER": "@:CREATE_A_MEAL.FORM.KOSHER",
        "HALAL": "@:CREATE_A_MEAL.FORM.HALAL",
      },
      "HELP_TYPE": {
        "TITLE": 'Type of help',
        "HELP_COOKING": "@:WELCOME.DIFFERENT_ROLES.HELP_COOKING.NAME",
        "HELP_COOKING_MOBILE": "Cooking",
        "HELP_CLEANING": "@:WELCOME.DIFFERENT_ROLES.HELP_CLEANING.NAME",
        "HELP_CLEANING_MOBILE": "Cleaning",
        "SIMPLE_GUEST": "@:WELCOME.DIFFERENT_ROLES.SIMPLE_GUEST.NAME",
      },
      "VALIDATE": 'Validate',
      "REINITIALIZE": 'Reinitialize'
    },
    "MAP": 'Map',
    "LIST": 'List',
    "CHANGE_VIEW_MAP": 'See meals on a map',
    "CHANGE_VIEW_LIST": 'See the list of meals',
    "REQUEST_SUCCESS": "Your request has been sent to the host.",
    "NO_INCOMING_MEALS_1": 'There are no incoming meals but you can',
    "CREATE_YOUR_MEAL": 'Create your own meal',
    "NO_INCOMING_MEALS_2": 'and enjoy meeting new people from all over the world',
    "ATTENDING": 'Attending',
    "PENDING": 'Pending',
    "ATTENDED": 'Attended',
    "HOSTING": 'Hosting',
    "HOSTED": 'Hosted',
    "VEGETARIAN_MEAL": 'Vegetarian meal',
    "VEGAN_MEAL": 'Vegan meal',
    "HALAL_MEAL": 'Halal meal',
    "KOSHER_MEAL": 'Kosher meal',
    "HOST": 'The host',
    "ACTION_BUTTON": {
      "SEE_MEAL": 'See meal',
      "MEAL_FULL": 'The meal is already full!',
      "SIGN_IN_1": 'Please',
      "SIGN_IN_2": 'Sign In',
      "SIGN_IN_3": 'if you already subscribed.',
    }
  },
  "VIEW_MEALS_DTLD": {
    "DESCRIPTION": 'Description',
    "VEGETARIAN_MEAL": "@:VIEW_MEALS.VEGETARIAN_MEAL",
    "VEGAN_MEAL": "@:VIEW_MEALS.VEGAN_MEAL",
    "HALAL_MEAL": "@:VIEW_MEALS.HALAL_MEAL",
    "KOSHER_MEAL": "@:VIEW_MEALS.KOSHER_MEAL",
    "INSCRIPTION": {
      "TITLE": 'Inscription as :',
      "TOOLTIP": {
        "PARTICIPANTS": "@:CREATE_A_MEAL.PARTICIPANTS",
        "PRICE": "@:VIEW_MEALS.FILTERS.PRICE.TITLE",
        "ARRIVAL_TIME": "@:CREATE_A_MEAL.ARRIVAL_TIME"
      },
      "HELP_COOKING": {
        "NAME": "@:WELCOME.DIFFERENT_ROLES.HELP_COOKING.NAME",
        "DESCRIPTION_TIME_1": 'You have to arrive at',
        "DESCRIPTION_TIME_2": 'in order to help the host to prepare the meal.',
        "DESCRIPTION_PRICE_1": 'The price can vary',
        "DESCRIPTION_PRICE_2": "@: VIEW_MEALS.FILTERS.PRICE.PLACEHOLDER_FROM",
        "DESCRIPTION_PRICE_3": "@: VIEW_MEALS.FILTERS.PRICE.PLACEHOLDER_TO",
        "DESCRIPTION_PRICE_4": 'according to the inscriptions',
        "DESCRIPTION_PRICE_5": 'more info about pricing',
        "DESCRIPTION_PRICE_6": 'You will be informed before the dinner of the final price.',
      },
      "HELP_CLEANING": {
        "NAME": "@:WELCOME.DIFFERENT_ROLES.HELP_CLEANING.NAME",
        "DESCRIPTION_TIME_1": "@: VIEW_MEALS_DTLD.INSCRIPTION.HELP_COOKING.DESCRIPTION_TIME_1",
        "DESCRIPTION_TIME_2": 'in order to help for',
        "DESCRIPTION_TIME_3": 'You will help',
        "DESCRIPTION_TIME_4": 'ordering and cleaning what was used for the meal.',
        "DESCRIPTION_PRICE_1": "@: VIEW_MEALS_DTLD.INSCRIPTION.HELP_COOKING.DESCRIPTION_PRICE_1",
        "DESCRIPTION_PRICE_2": "@: VIEW_MEALS.FILTERS.PRICE.PLACEHOLDER_FROM",
        "DESCRIPTION_PRICE_3": "@: VIEW_MEALS.FILTERS.PRICE.PLACEHOLDER_TO",
        "DESCRIPTION_PRICE_4": "@: VIEW_MEALS_DTLD.INSCRIPTION.HELP_COOKING.DESCRIPTION_PRICE_4",
        "DESCRIPTION_PRICE_5": "@: VIEW_MEALS_DTLD.INSCRIPTION.HELP_COOKING.DESCRIPTION_PRICE_5",
        "DESCRIPTION_PRICE_6": "@: VIEW_MEALS_DTLD.INSCRIPTION.HELP_COOKING.DESCRIPTION_PRICE_6",
      },
      "SIMPLE_GUEST": {
        "NAME": "@:WELCOME.DIFFERENT_ROLES.SIMPLE_GUEST.NAME",
        "DESCRIPTION": 'You help by paying a little bit more : this money will be redistribuated between those who helped to organize the event'
      },
      "CELLPHONE": {
        "DESCRIPTION": 'Info required',
        "TOOLTIP": 'Private information displayed only between participants and host',
        "PLACEHOLDER": "@: CREATE_A_MEAL.FORM.CELLPHONE.NAME"
      }
    },
    "NOTIFICATIONS": 'Do you want to receive updates about the meal on messenger? (recommended)',
    "ACTION_BUTTON": {
      "SUBSCRIBE_NOT_CONNECTED_1": 'Sign In with facebook',
      "SUBSCRIBE_NOT_CONNECTED_2": 'to participate',
      "SUBSCRIBE": 'Participate',
      "SEE_MEAL": "@: VIEW_MEALS.ACTION_BUTTON.SEE_MEAL",
      "CANCEL": 'Cancel my request',
      "MEAL_FULL": "@: VIEW_MEALS.ACTION_BUTTON.MEAL_FULL",
      "SIGN_IN_1": "@: VIEW_MEALS.ACTION_BUTTON.SIGN_IN_1",
      "SIGN_IN_2": "@: VIEW_MEALS.ACTION_BUTTON.SIGN_IN_2",
      "SIGN_IN_3": "@: VIEW_MEALS.ACTION_BUTTON.SIGN_IN_3"
    },
    "PARTICIPANTS":{
      "AGE": "@: PROFILE.YEARS_OLD",
      "COUNTRY_OF_ORIGIN": 'From {{country_of_origin_name}}',
      "HOST": 'Your host:',
      "HELP_COOKING": 'Help cooking:',
      "HELP_CLEANING": 'Help cleaning:',
      "SIMPLE_GUEST": 'Simple guest:',
    }
  },
  "PROFILE": {
    "RECOMMENDATION": 'We recomend you to complete your profile. Someone with a complete profile is more trustworthy than someone without.',
    "ABOUT_ME": {
      "TITLE": 'About me',
      "BIRTHDATE": 'Birthdate:',
      "GENDER": {
        "NAME": 'Gender',
        "MALE": 'Male',
        "FEMALE": 'Female'
      },
      "EMAIL": 'Email',
      "CELLPHONE": "@:CREATE_A_MEAL.FORM.CELLPHONE.NAME",
      "COUNTRY_OF_ORIGIN": 'Native country',
      "SPOKEN_LANGUAGES": {
        "NAME": 'Spoken languages',
        "ADD": 'Add',
      },
      "PRESENTATION": 'Introduce yourself'
    },
    "NOTIFICATIONS": {
      "TITLE": 'Notifications',
      "PARAGRAPHE": 'Do you want to receive notifications through messenger about new meals?',
      "PARAGRAPHE_1": "@:CREATE_A_MEAL.FORM.NOTIFICATIONS.MESSENGER_2",
      "CITY_OF_INTEREST": {
        "TITLE": 'Select the cities of your interest:',
        "WARNING": 'Be aware that for some big cities (Melbourne, Santiago, ...) the name of the city refers only to the city center and not the neighbourhood suburbs.',
        "PLACEHOLDER": "@:VIEW_MEALS.FILTERS.CITY.PLACEHOLDER",
        "ADD": "@:PROFILE.ABOUT_ME.SPOKEN_LANGUAGES.ADD"
      },
      "DIATERY_PREFERENCES": {
        "TITLE": 'Dietary preferences:',
        "OMNIVOROUS": 'Omnivorous',
        "VEGETARIAN": "@:CREATE_A_MEAL.FORM.VEGETARIAN",
        "VEGAN": "@:CREATE_A_MEAL.FORM.VEGAN",
      }
    },
    "ACTUALIZE": {
      "ACTION": 'Actualize',
      "MESSAGE_SUCCESS": 'Your profile was actualized',
      "MESSAGE_ERROR": 'We had a problem actualizing your profile. Please, get in touch with',
      "MESSAGE_ERROR_CELLPHONE_EMAIL": 'Email and cellphone are required to participate'
    },
    "YEARS_OLD": 'Years old',
    "COUNTRY_OF_ORIGIN": 'From {{country_of_origin_name}}',
    "PUBLIC_PROFILE": 'Public profile',
    'MEMBERSHIP': 'Member since {{member_since}}',
    "REVIEWS": {
      "TITLE": 'Reviews',
      "NO_REVIEWS_YET": '{{user_first_name}} does not have any reviews yet.',
      "NO_COMMENT": '{{review_fromUser_datas_first_name}} had a {{review_forUser_rating}} experience with {{user_first_name}}.'
    },
    "MEALS": {
      "TITLE": 'Meals'
    }
  }
};









var translationsFR = {
  "WELCOME": {
    "CREATE_A_MEAL": 'create a meal',
    "BROWSE_A_MEAL": 'browse a meal',
    "HOW_IT_WORKS": 'How it works',
    "PUBLICATION": {
      "TITLE": 'Publication',
      "PARAGRAPH": 'A member publishes a meal, choosing the number of participants and their roles.'
    }
  },
  "CREATE_A_MEAL": {
    "TITLE": '- Create a new meal -',
    "FORM": {
      "PUBLIC_INFO": 'Public information',
      "MENU_TITLE": 'Title of your menu',
      "MENU_DESCRIPTION": 'Menu description (optional)',
      "SPECIAL_MEAL": {
        "TITLE": 'repas particulier? ',
        "TOOLTIP": 'ne pas chequer'
      }
    }
  }
};

var translationsES = {
  "WELCOME": {
    "CREATE_A_MEAL": 'create a meal',
    "BROWSE_A_MEAL": 'browse a meal',
    "HOW_IT_WORKS": 'How it works',
    "PUBLICATION": 'Publication'
  }
};

// Declare app level module which depends on views, and components
var app = angular.module('myApp', [
  'config',
  'angular-svg-round-progressbar',
  'ui.bootstrap',
  'ngAnimate',
  'ui.router',
  'satellizer',
  'myApp.viewCreateMeal',
  'myApp.viewMeals',
  'myApp.viewMyMeals',
  'myApp.viewLogin',
  'myApp.viewProfile',
  'myApp.welcome',
  'myApp.viewLeaveReviews',
  'myApp.viewManageRequests',
  'userServices',
  'angular-loading-bar',
  'ezfb',
  'getReviewService',
  'getAgeService',
  'angular.filter',
  'pascalprecht.translate'
]);

app.config(['$stateProvider', '$httpProvider', '$urlRouterProvider', '$authProvider', 'ENV', 'cfpLoadingBarProvider', 'ezfbProvider', '$translateProvider', function($stateProvider, $httpProvider, $urlRouterProvider, $authProvider, ENV, cfpLoadingBarProvider, ezfbProvider, $translateProvider) {

  if (!$httpProvider.defaults.headers.get) {
    $httpProvider.defaults.headers.common = {};
  }

  $httpProvider.defaults.headers.common["Cache-Control"] = "no-cache";
  $httpProvider.defaults.headers.common.Pragma = "no-cache"; // ajoute le header à chaque requête http pour que chrome n'utilse pas son cache pour sauvegarder les données (permet d'afficher correctement les pendings requests)

  //enlève le spinner de la loadingbar
  cfpLoadingBarProvider.includeSpinner = false;

  $stateProvider
    .state('welcome', {
      url: '/welcome',
      templateUrl: 'static/welcome/welcome.html',
      controller: 'WelcomeCtrl'
    });
  $stateProvider
    .state('login', {
      url: '/login',
      templateUrl: 'static/viewLogin/viewLogin.html',
      controller: 'ViewLoginCtrl'
    });
  $stateProvider
    .state('view_meals', {
      url: '/view_meals',
      templateUrl: 'static/viewMeals/viewMeals.html',
      controller: 'ViewMealsCtrl',
      resolve: {
        response: ['$http', function($http) {
          var date = new Date();
          var now = date.toISOString();
          return $http.get('/api/meals?where={"time": {"$gte": "' + now + '"}}').then(function successCallBack(response) {
            if (response.data['_items'].length > 0) {
              return response.data['_items'];
            }
            else {
              return $http.get('/api/meals').then(function successCallBack(responsewithoutfilter) {
                return responsewithoutfilter.data['_items'];
              }, function errorCallback(responsewithoutfilter) {
                console.log(responsewithoutfilter);
              });
            }
          }, function errorCallback(response) {
            console.log(response);
          });
        }]
      }
    });
  $stateProvider
    .state('view_meals.mealsMap', {
      views: {
        'mealsMap': {
          templateUrl: 'static/viewMeals/viewMealsContainer/mealsMap.html',
        }
      }
    })
    .state('view_meals.mealsList', {
      views: {
        'mealsList': {
          templateUrl: 'static/viewMeals/viewMealsContainer/mealsList.html',
        }
      }
    });
  $stateProvider
    .state('create_meal', {
      url: '/create_meal',
      templateUrl: 'static/viewCreateMeal/viewCreateMeal.html',
      controller: 'ViewCreateMealCtrl'
    });
  $stateProvider
    .state('my_meals', {
      url: '/my_meals',
      templateUrl: 'static/viewMyMeals/viewMyMeals.html',
      controller: 'ViewMyMealsCtrl',
      data: {
        requiredLogin: true
      },
      resolve: {
        response: ['$http', function($http) {
          return $http.get('/api/meals/private');
        }]
      }
    });
  $stateProvider
    .state('view_my_dtld_meals', {
      url: '/my_meals/:myMealId',
      templateUrl: 'static/viewMyMeals/viewMyMealsDtld/viewMyMealsDtld.html',
      controller: 'ViewMyMealsDtldCtrl',
      data: {
        requiredLogin: true
      },
      params: {
        successSubscribedMessage: null
      },
      resolve: {
        userResolve: ['userServicesFactory', function(userServicesFactory) {
          return userServicesFactory();
        }],
        meal: ['$http', '$stateParams', '$state', '$rootScope', function($http, $stateParams, $state, $rootScope) {
          return $http.get('/api/meals/private/' + $stateParams.myMealId).then(function successCallBack(response) {
            return response;
          }, function errorCallback() {
            $rootScope.toParamsMealId = {
              "myMealId": $stateParams.myMealId
            };
            $state.go("view_meals.mealsList", {
              reload: true,
              inherit: false,
              notify: false
            });
          });
        }]
      }
    });
  $stateProvider
    .state('footer_more_contact', {
      url: '/more/contact_us',
      templateUrl: 'static/footer/more/contact/contact_us.html',
    });
  $stateProvider
    .state('footer_information_team', {
      url: '/information/team',
      templateUrl: 'static/footer/information/team/team.html',
    });
  $stateProvider
    .state('footer_information_concept', {
      url: '/information/concept',
      templateUrl: 'static/footer/information/concept/concept.html'
    });
  $stateProvider
    .state('footer_information_FAQ', {
      url: '/information/FAQ',
      templateUrl: 'static/footer/information/FAQ/FAQ.html',
    });
  $stateProvider
    .state('footer_legal_terms_and_conditions', {
      url: '/legal/terms_and_conditions',
      templateUrl: 'static/footer/legal/termsAndConditions/terms_and_conditions.html'
    });
  $stateProvider
    .state('footer_legal_privacy_policy', {
      url: '/legal/privacy_policy',
      templateUrl: 'static/footer/legal/privacyPolicy/privacy_policy.html'
    });
  $stateProvider
    .state('footer_legal_general_policies', {
      url: '/legal/general_policies',
      templateUrl: 'static/footer/legal/generalPolicies/general_policies.html'
    });
  $stateProvider
    .state('footer_legal_guidelines', {
      url: '/legal/guidelines',
      templateUrl: 'static/footer/legal/guidelines/guidelines.html'
    });
  $stateProvider
    .state('footer_more_careers', {
      url: '/more/careers',
      templateUrl: 'static/footer/more/careers/careers.html',
    });
  $stateProvider
    .state('footer_more_photo_gallery', {
      url: '/more/photo_gallery',
      templateUrl: 'static/footer/more/photoGallery/photo_gallery.html',
    });
  $stateProvider
    .state('profile', {
      url: '/profile/:userId',
      templateUrl: 'static/profile/viewProfile.html',
      controller: 'ViewProfileCtrl',
      data: {
        requiredLogin: true
      },
      resolve: {
        userInfo: ['$http', '$stateParams', function($http, $stateParams) {
          return $http.get('/api/users/' + $stateParams.userId);
        }]
      }
    });
  $stateProvider.state('profile.mealsList', {
    views: {
      'mealsList': {
        templateUrl: 'static/viewMeals/viewMealsContainer/mealsList.html'
      }
    }
  });
  $stateProvider
    .state('manage_requests', {
      url: '/manage_requests',
      templateUrl: 'static/viewManageRequests/viewManageRequests.html',
      controller: 'ViewManageRequestsCtrl'
    });
  $stateProvider
    .state('leave_reviews', {
      url: '/leave_reviews',
      templateUrl: 'static/viewLeaveReviews/viewLeaveReviews.html',
      controller: 'ViewLeaveReviewsCtrl'
    });

  $urlRouterProvider.otherwise('welcome');

  $authProvider.facebook({
    clientId: ENV.fbClientID,
    redirectUri: ENV.fbRedirectURI,
    scope: ['email']
  });

  ezfbProvider.setInitParams({
    appId: ENV.appId,
    version: 'v2.6'
  });

  $translateProvider.useSanitizeValueStrategy('escape'); //change 'escape' to 'sanitize' when angular-translate v3 will be released
  $translateProvider.translations('en', translationsEN);
  $translateProvider.translations('fr', translationsFR);
  $translateProvider.translations('es', translationsES);
  $translateProvider.preferredLanguage('en');
  $translateProvider.fallbackLanguage('en');

}]);


app.run(['$rootScope', '$state', '$auth', '$transitions', function($rootScope, $state, $auth, $transitions) {
  var matchSuccess = {};
  $rootScope.$state = $state;

  var matchNotLogged = {
    to: function(state) {
      return state.data != null && state.data.requiredLogin === true;
    }
  };

  $transitions.onBefore(matchNotLogged, function(trans) { //on fait une redirection qui est du coup intercepté avant l'auth et donc on repart sur login. Besoin d'utiliser on start dedans onbefore?
    if ($auth.isAuthenticated() != true) {
      $rootScope.fromState = trans.$from();
      $rootScope.toState = trans.$to();
      if (trans.$to().name == "view_my_dtld_meals") {
        $rootScope.toParamsMealId = {
          "myMealId": trans._targetState._params.myMealId
        };
      }
      return trans.router.stateService.target("login");
    }
  });

  $transitions.onSuccess(matchSuccess, function($transitions) {
    document.body.scrollTop = document.documentElement.scrollTop = 0;
    if ($transitions.$to().name != "login") {
      $rootScope.fromState = $transitions.$from();
      $rootScope.toState = $transitions.$to();
    }
  });

  /* 
  $rootScope.$on('$stateChangeStart',
    function(event, toState, toParams, fromState, fromParams) {
      // when the state change, the user load the template at the top of the window
      document.body.scrollTop = document.documentElement.scrollTop = 0;
      $rootScope.fromState = fromState; // on récupère fromState pour l'apparition du plugin checkbox messenger dans create_meal
      var requiredLogin = false;
      // check if this state need login
      if (toState.data && toState.data.requiredLogin) {
        requiredLogin = true;
      }
      if ($auth.isAuthenticated() && requiredLogin == true) { // si on n'est pas connecté et qu'on souhaite accéder à une page privée, on actualise toState et on va sur login (utilisé dans viewMeals.js et viewCreateMeal.js)
        $rootScope.toState = toState; //permet de récupérer l'argument toState dans tous les childs scope
        $rootScope.toParams = toParams; //permet de récupérer l'argument toState dans tous les childs scope
      }
      // if yes and if this user is not logged in, redirect him to login page
      if (!$auth.isAuthenticated() && requiredLogin == true) { // si on n'est pas connecté et qu'on souhaite accéder à une page privée, on actualise toState et on va sur login (utilisé dans viewMeals.js et viewCreateMeal.js)
        $rootScope.toState = toState; //permet de récupérer l'argument toState dans tous les childs scope
        $rootScope.toParams = toParams; //permet de récupérer l'argument toState dans tous les childs scope
        event.preventDefault();
        $state.go('login');
      }
    });
*/
  // enable to get the state in the view


}]);

app.controller('AppCtrl', ['$scope', '$auth', '$state', 'userServicesFactory', '$http', '$rootScope', '$q', '$window', 'ezfb', '$timeout', '$translate', function($scope, $auth, $state, userServicesFactory, $http, $rootScope, $q, $window, ezfb, $timeout, $translate) {

  function isFacebookApp() {
    var ua = $window.navigator.userAgent || $window.navigator.vendor || $window.opera;
    return (ua.indexOf("FBAN") > -1) || (ua.indexOf("FBAV") > -1);
  }
  $rootScope.inApp = isFacebookApp();

  function authe(provider) {
    return $q(function(resolve, reject) {
      $auth.authenticate(provider)
        .then(function(response) {
          console.debug("success", response);
          if ($auth.isAuthenticated()) {
            resolve(userServicesFactory().then(function(data) {
              $rootScope.user = data;
            }));
          }
        })
        .catch(function(response) {
          console.debug("catch", response);
        });
    });
  }



  $rootScope.auth = function(provider, toState, toParams) {
    authe(provider).then(function successCallBack() {
      toState = toState || undefined;
      if (toState != undefined) { //permet à l'utilisateur de se retrouver sur la page qu'il a cliqué avant d'avoir besoin de s'identifier
        if (toState == "profile") {
          $state.go(toState, {
            "userId": $scope.user._id
          });
        }
        else {
          $state.go(toState, toParams);
        }
      }
      else {
        $state.reload();
      }
      initializeUserLabels();
    });
  };

  $rootScope.logout = function() {
      $auth.logout().then(function() {
        $http.get('/auth/logout').then(function(response) {
          console.log(response.data);
          delete $rootScope.user;
          $state.go("welcome");
        });
      });
    },

    $rootScope.isAuthenticated = function() {
      return $auth.isAuthenticated();
    },

    $rootScope.navbarCollapsed = true;

  var authVerification = function() { // fonction qui permet de vérifier que l'utilisateur est bien déconnecté. S'il ne l'est pas alors on récupère ses données
    if ($rootScope.isAuthenticated()) {
      userServicesFactory().then(function(data) {
        $rootScope.user = data;
        initializeUserLabels();
      });
    }
  };

  var initializeUserLabels = function() {
    $timeout(function() {
      //on récupère les pending requests et on le mets dans le rootscope
      $http.get('api/meals?where={"$and": [{"users._id": "' + $rootScope.user._id + '"}, {"users.status": "pending"} ]}').then(function(res) { // on récupère les meals de l'utilisateur dont on consulte le profil
        $rootScope.user.nbDifferentPendingRequest = 0;
        var meals = res.data._items;
        meals.forEach(function(meal) {
          meal.users.forEach(function(participant) {
            if (participant.status == "pending") {
              $rootScope.user.nbDifferentPendingRequest += 1;
            }
          });
        });
      });
      //on récupère les reviews qu'on a besoin de laisser et on les met dans rootscope
      var uniqueListForRequest = [];
      var now = new Date;
      $http.get('api/meals?where={"$and": [{"users._id": "' + $rootScope.user._id + '"}, {"users": {"$not": {"$size": 1}}}]}').then(function(resp) { // on récupère les meals de l'utilisateur dont on consulte le profile où il n'y a pas que lui d'inscrit
        resp.data._items.forEach(function(element) {
          var mealDate = new Date(element.time);
          if (mealDate < now) { // on ne peut laisser une review qu'à un meal qui s'est passé
            element.users.forEach(function(participant) {
              if (participant._id != $rootScope.user._id) { //on enlève les reviews pour moi même
                uniqueListForRequest.push('"' + (participant._id + $rootScope.user._id + element._id).toString() + '"');
              }
            });
          }
        });
        $http.get('api/reviews?where={"unique": {"$in":[' + uniqueListForRequest + ']}}').then(function successCallBack(response) {
          $rootScope.user.nbDifferentReviewsToLeave = uniqueListForRequest.length - response.data._items.length;
        });
      });
    }, 0);
  };

  authVerification();

  $scope.status = {
    isopen: false
  };

  $scope.sloganText = "When was the last time you met someone new?";

  $rootScope.changeLanguage = function(langKey) { // permet de changer la langue depuis index.html en cliquant sur un des drapeaux
    $translate.use(langKey);
  };

}]);


app.filter('ageFilter', ['getAgeServiceFactory', function(getAgeServiceFactory) {
  return function(birthdate) {
    return getAgeServiceFactory(birthdate);
  };
}]);

app.filter('capitalizeFirstLetter', function() {
  return function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
});

/***/ }),

/***/ 80:
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(81);

/***/ }),

/***/ 81:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(82);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(63)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/less-loader/index.js!../../../../node_modules/font-awesome-webpack/font-awesome-styles.loader.js!./font-awesome.config.js", function() {
			var newContent = require("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/less-loader/index.js!../../../../node_modules/font-awesome-webpack/font-awesome-styles.loader.js!./font-awesome.config.js");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 82:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(62)(undefined);
// imports


// module
exports.push([module.i, ".fa {\n  display: inline-block;\n  font: normal normal normal 14px/1 FontAwesome;\n  font-size: inherit;\n  text-rendering: auto;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n}\n/* Font Awesome uses the Unicode Private Use Area (PUA) to ensure screen\n   readers do not read off random characters that represent icons */\n.fa-glass:before {\n  content: \"\\F000\";\n}\n.fa-music:before {\n  content: \"\\F001\";\n}\n.fa-search:before {\n  content: \"\\F002\";\n}\n.fa-envelope-o:before {\n  content: \"\\F003\";\n}\n.fa-heart:before {\n  content: \"\\F004\";\n}\n.fa-star:before {\n  content: \"\\F005\";\n}\n.fa-star-o:before {\n  content: \"\\F006\";\n}\n.fa-user:before {\n  content: \"\\F007\";\n}\n.fa-film:before {\n  content: \"\\F008\";\n}\n.fa-th-large:before {\n  content: \"\\F009\";\n}\n.fa-th:before {\n  content: \"\\F00A\";\n}\n.fa-th-list:before {\n  content: \"\\F00B\";\n}\n.fa-check:before {\n  content: \"\\F00C\";\n}\n.fa-remove:before,\n.fa-close:before,\n.fa-times:before {\n  content: \"\\F00D\";\n}\n.fa-search-plus:before {\n  content: \"\\F00E\";\n}\n.fa-search-minus:before {\n  content: \"\\F010\";\n}\n.fa-power-off:before {\n  content: \"\\F011\";\n}\n.fa-signal:before {\n  content: \"\\F012\";\n}\n.fa-gear:before,\n.fa-cog:before {\n  content: \"\\F013\";\n}\n.fa-trash-o:before {\n  content: \"\\F014\";\n}\n.fa-home:before {\n  content: \"\\F015\";\n}\n.fa-file-o:before {\n  content: \"\\F016\";\n}\n.fa-clock-o:before {\n  content: \"\\F017\";\n}\n.fa-road:before {\n  content: \"\\F018\";\n}\n.fa-download:before {\n  content: \"\\F019\";\n}\n.fa-arrow-circle-o-down:before {\n  content: \"\\F01A\";\n}\n.fa-arrow-circle-o-up:before {\n  content: \"\\F01B\";\n}\n.fa-inbox:before {\n  content: \"\\F01C\";\n}\n.fa-play-circle-o:before {\n  content: \"\\F01D\";\n}\n.fa-rotate-right:before,\n.fa-repeat:before {\n  content: \"\\F01E\";\n}\n.fa-refresh:before {\n  content: \"\\F021\";\n}\n.fa-list-alt:before {\n  content: \"\\F022\";\n}\n.fa-lock:before {\n  content: \"\\F023\";\n}\n.fa-flag:before {\n  content: \"\\F024\";\n}\n.fa-headphones:before {\n  content: \"\\F025\";\n}\n.fa-volume-off:before {\n  content: \"\\F026\";\n}\n.fa-volume-down:before {\n  content: \"\\F027\";\n}\n.fa-volume-up:before {\n  content: \"\\F028\";\n}\n.fa-qrcode:before {\n  content: \"\\F029\";\n}\n.fa-barcode:before {\n  content: \"\\F02A\";\n}\n.fa-tag:before {\n  content: \"\\F02B\";\n}\n.fa-tags:before {\n  content: \"\\F02C\";\n}\n.fa-book:before {\n  content: \"\\F02D\";\n}\n.fa-bookmark:before {\n  content: \"\\F02E\";\n}\n.fa-print:before {\n  content: \"\\F02F\";\n}\n.fa-camera:before {\n  content: \"\\F030\";\n}\n.fa-font:before {\n  content: \"\\F031\";\n}\n.fa-bold:before {\n  content: \"\\F032\";\n}\n.fa-italic:before {\n  content: \"\\F033\";\n}\n.fa-text-height:before {\n  content: \"\\F034\";\n}\n.fa-text-width:before {\n  content: \"\\F035\";\n}\n.fa-align-left:before {\n  content: \"\\F036\";\n}\n.fa-align-center:before {\n  content: \"\\F037\";\n}\n.fa-align-right:before {\n  content: \"\\F038\";\n}\n.fa-align-justify:before {\n  content: \"\\F039\";\n}\n.fa-list:before {\n  content: \"\\F03A\";\n}\n.fa-dedent:before,\n.fa-outdent:before {\n  content: \"\\F03B\";\n}\n.fa-indent:before {\n  content: \"\\F03C\";\n}\n.fa-video-camera:before {\n  content: \"\\F03D\";\n}\n.fa-photo:before,\n.fa-image:before,\n.fa-picture-o:before {\n  content: \"\\F03E\";\n}\n.fa-pencil:before {\n  content: \"\\F040\";\n}\n.fa-map-marker:before {\n  content: \"\\F041\";\n}\n.fa-adjust:before {\n  content: \"\\F042\";\n}\n.fa-tint:before {\n  content: \"\\F043\";\n}\n.fa-edit:before,\n.fa-pencil-square-o:before {\n  content: \"\\F044\";\n}\n.fa-share-square-o:before {\n  content: \"\\F045\";\n}\n.fa-check-square-o:before {\n  content: \"\\F046\";\n}\n.fa-arrows:before {\n  content: \"\\F047\";\n}\n.fa-step-backward:before {\n  content: \"\\F048\";\n}\n.fa-fast-backward:before {\n  content: \"\\F049\";\n}\n.fa-backward:before {\n  content: \"\\F04A\";\n}\n.fa-play:before {\n  content: \"\\F04B\";\n}\n.fa-pause:before {\n  content: \"\\F04C\";\n}\n.fa-stop:before {\n  content: \"\\F04D\";\n}\n.fa-forward:before {\n  content: \"\\F04E\";\n}\n.fa-fast-forward:before {\n  content: \"\\F050\";\n}\n.fa-step-forward:before {\n  content: \"\\F051\";\n}\n.fa-eject:before {\n  content: \"\\F052\";\n}\n.fa-chevron-left:before {\n  content: \"\\F053\";\n}\n.fa-chevron-right:before {\n  content: \"\\F054\";\n}\n.fa-plus-circle:before {\n  content: \"\\F055\";\n}\n.fa-minus-circle:before {\n  content: \"\\F056\";\n}\n.fa-times-circle:before {\n  content: \"\\F057\";\n}\n.fa-check-circle:before {\n  content: \"\\F058\";\n}\n.fa-question-circle:before {\n  content: \"\\F059\";\n}\n.fa-info-circle:before {\n  content: \"\\F05A\";\n}\n.fa-crosshairs:before {\n  content: \"\\F05B\";\n}\n.fa-times-circle-o:before {\n  content: \"\\F05C\";\n}\n.fa-check-circle-o:before {\n  content: \"\\F05D\";\n}\n.fa-ban:before {\n  content: \"\\F05E\";\n}\n.fa-arrow-left:before {\n  content: \"\\F060\";\n}\n.fa-arrow-right:before {\n  content: \"\\F061\";\n}\n.fa-arrow-up:before {\n  content: \"\\F062\";\n}\n.fa-arrow-down:before {\n  content: \"\\F063\";\n}\n.fa-mail-forward:before,\n.fa-share:before {\n  content: \"\\F064\";\n}\n.fa-expand:before {\n  content: \"\\F065\";\n}\n.fa-compress:before {\n  content: \"\\F066\";\n}\n.fa-plus:before {\n  content: \"\\F067\";\n}\n.fa-minus:before {\n  content: \"\\F068\";\n}\n.fa-asterisk:before {\n  content: \"\\F069\";\n}\n.fa-exclamation-circle:before {\n  content: \"\\F06A\";\n}\n.fa-gift:before {\n  content: \"\\F06B\";\n}\n.fa-leaf:before {\n  content: \"\\F06C\";\n}\n.fa-fire:before {\n  content: \"\\F06D\";\n}\n.fa-eye:before {\n  content: \"\\F06E\";\n}\n.fa-eye-slash:before {\n  content: \"\\F070\";\n}\n.fa-warning:before,\n.fa-exclamation-triangle:before {\n  content: \"\\F071\";\n}\n.fa-plane:before {\n  content: \"\\F072\";\n}\n.fa-calendar:before {\n  content: \"\\F073\";\n}\n.fa-random:before {\n  content: \"\\F074\";\n}\n.fa-comment:before {\n  content: \"\\F075\";\n}\n.fa-magnet:before {\n  content: \"\\F076\";\n}\n.fa-chevron-up:before {\n  content: \"\\F077\";\n}\n.fa-chevron-down:before {\n  content: \"\\F078\";\n}\n.fa-retweet:before {\n  content: \"\\F079\";\n}\n.fa-shopping-cart:before {\n  content: \"\\F07A\";\n}\n.fa-folder:before {\n  content: \"\\F07B\";\n}\n.fa-folder-open:before {\n  content: \"\\F07C\";\n}\n.fa-arrows-v:before {\n  content: \"\\F07D\";\n}\n.fa-arrows-h:before {\n  content: \"\\F07E\";\n}\n.fa-bar-chart-o:before,\n.fa-bar-chart:before {\n  content: \"\\F080\";\n}\n.fa-twitter-square:before {\n  content: \"\\F081\";\n}\n.fa-facebook-square:before {\n  content: \"\\F082\";\n}\n.fa-camera-retro:before {\n  content: \"\\F083\";\n}\n.fa-key:before {\n  content: \"\\F084\";\n}\n.fa-gears:before,\n.fa-cogs:before {\n  content: \"\\F085\";\n}\n.fa-comments:before {\n  content: \"\\F086\";\n}\n.fa-thumbs-o-up:before {\n  content: \"\\F087\";\n}\n.fa-thumbs-o-down:before {\n  content: \"\\F088\";\n}\n.fa-star-half:before {\n  content: \"\\F089\";\n}\n.fa-heart-o:before {\n  content: \"\\F08A\";\n}\n.fa-sign-out:before {\n  content: \"\\F08B\";\n}\n.fa-linkedin-square:before {\n  content: \"\\F08C\";\n}\n.fa-thumb-tack:before {\n  content: \"\\F08D\";\n}\n.fa-external-link:before {\n  content: \"\\F08E\";\n}\n.fa-sign-in:before {\n  content: \"\\F090\";\n}\n.fa-trophy:before {\n  content: \"\\F091\";\n}\n.fa-github-square:before {\n  content: \"\\F092\";\n}\n.fa-upload:before {\n  content: \"\\F093\";\n}\n.fa-lemon-o:before {\n  content: \"\\F094\";\n}\n.fa-phone:before {\n  content: \"\\F095\";\n}\n.fa-square-o:before {\n  content: \"\\F096\";\n}\n.fa-bookmark-o:before {\n  content: \"\\F097\";\n}\n.fa-phone-square:before {\n  content: \"\\F098\";\n}\n.fa-twitter:before {\n  content: \"\\F099\";\n}\n.fa-facebook-f:before,\n.fa-facebook:before {\n  content: \"\\F09A\";\n}\n.fa-github:before {\n  content: \"\\F09B\";\n}\n.fa-unlock:before {\n  content: \"\\F09C\";\n}\n.fa-credit-card:before {\n  content: \"\\F09D\";\n}\n.fa-feed:before,\n.fa-rss:before {\n  content: \"\\F09E\";\n}\n.fa-hdd-o:before {\n  content: \"\\F0A0\";\n}\n.fa-bullhorn:before {\n  content: \"\\F0A1\";\n}\n.fa-bell:before {\n  content: \"\\F0F3\";\n}\n.fa-certificate:before {\n  content: \"\\F0A3\";\n}\n.fa-hand-o-right:before {\n  content: \"\\F0A4\";\n}\n.fa-hand-o-left:before {\n  content: \"\\F0A5\";\n}\n.fa-hand-o-up:before {\n  content: \"\\F0A6\";\n}\n.fa-hand-o-down:before {\n  content: \"\\F0A7\";\n}\n.fa-arrow-circle-left:before {\n  content: \"\\F0A8\";\n}\n.fa-arrow-circle-right:before {\n  content: \"\\F0A9\";\n}\n.fa-arrow-circle-up:before {\n  content: \"\\F0AA\";\n}\n.fa-arrow-circle-down:before {\n  content: \"\\F0AB\";\n}\n.fa-globe:before {\n  content: \"\\F0AC\";\n}\n.fa-wrench:before {\n  content: \"\\F0AD\";\n}\n.fa-tasks:before {\n  content: \"\\F0AE\";\n}\n.fa-filter:before {\n  content: \"\\F0B0\";\n}\n.fa-briefcase:before {\n  content: \"\\F0B1\";\n}\n.fa-arrows-alt:before {\n  content: \"\\F0B2\";\n}\n.fa-group:before,\n.fa-users:before {\n  content: \"\\F0C0\";\n}\n.fa-chain:before,\n.fa-link:before {\n  content: \"\\F0C1\";\n}\n.fa-cloud:before {\n  content: \"\\F0C2\";\n}\n.fa-flask:before {\n  content: \"\\F0C3\";\n}\n.fa-cut:before,\n.fa-scissors:before {\n  content: \"\\F0C4\";\n}\n.fa-copy:before,\n.fa-files-o:before {\n  content: \"\\F0C5\";\n}\n.fa-paperclip:before {\n  content: \"\\F0C6\";\n}\n.fa-save:before,\n.fa-floppy-o:before {\n  content: \"\\F0C7\";\n}\n.fa-square:before {\n  content: \"\\F0C8\";\n}\n.fa-navicon:before,\n.fa-reorder:before,\n.fa-bars:before {\n  content: \"\\F0C9\";\n}\n.fa-list-ul:before {\n  content: \"\\F0CA\";\n}\n.fa-list-ol:before {\n  content: \"\\F0CB\";\n}\n.fa-strikethrough:before {\n  content: \"\\F0CC\";\n}\n.fa-underline:before {\n  content: \"\\F0CD\";\n}\n.fa-table:before {\n  content: \"\\F0CE\";\n}\n.fa-magic:before {\n  content: \"\\F0D0\";\n}\n.fa-truck:before {\n  content: \"\\F0D1\";\n}\n.fa-pinterest:before {\n  content: \"\\F0D2\";\n}\n.fa-pinterest-square:before {\n  content: \"\\F0D3\";\n}\n.fa-google-plus-square:before {\n  content: \"\\F0D4\";\n}\n.fa-google-plus:before {\n  content: \"\\F0D5\";\n}\n.fa-money:before {\n  content: \"\\F0D6\";\n}\n.fa-caret-down:before {\n  content: \"\\F0D7\";\n}\n.fa-caret-up:before {\n  content: \"\\F0D8\";\n}\n.fa-caret-left:before {\n  content: \"\\F0D9\";\n}\n.fa-caret-right:before {\n  content: \"\\F0DA\";\n}\n.fa-columns:before {\n  content: \"\\F0DB\";\n}\n.fa-unsorted:before,\n.fa-sort:before {\n  content: \"\\F0DC\";\n}\n.fa-sort-down:before,\n.fa-sort-desc:before {\n  content: \"\\F0DD\";\n}\n.fa-sort-up:before,\n.fa-sort-asc:before {\n  content: \"\\F0DE\";\n}\n.fa-envelope:before {\n  content: \"\\F0E0\";\n}\n.fa-linkedin:before {\n  content: \"\\F0E1\";\n}\n.fa-rotate-left:before,\n.fa-undo:before {\n  content: \"\\F0E2\";\n}\n.fa-legal:before,\n.fa-gavel:before {\n  content: \"\\F0E3\";\n}\n.fa-dashboard:before,\n.fa-tachometer:before {\n  content: \"\\F0E4\";\n}\n.fa-comment-o:before {\n  content: \"\\F0E5\";\n}\n.fa-comments-o:before {\n  content: \"\\F0E6\";\n}\n.fa-flash:before,\n.fa-bolt:before {\n  content: \"\\F0E7\";\n}\n.fa-sitemap:before {\n  content: \"\\F0E8\";\n}\n.fa-umbrella:before {\n  content: \"\\F0E9\";\n}\n.fa-paste:before,\n.fa-clipboard:before {\n  content: \"\\F0EA\";\n}\n.fa-lightbulb-o:before {\n  content: \"\\F0EB\";\n}\n.fa-exchange:before {\n  content: \"\\F0EC\";\n}\n.fa-cloud-download:before {\n  content: \"\\F0ED\";\n}\n.fa-cloud-upload:before {\n  content: \"\\F0EE\";\n}\n.fa-user-md:before {\n  content: \"\\F0F0\";\n}\n.fa-stethoscope:before {\n  content: \"\\F0F1\";\n}\n.fa-suitcase:before {\n  content: \"\\F0F2\";\n}\n.fa-bell-o:before {\n  content: \"\\F0A2\";\n}\n.fa-coffee:before {\n  content: \"\\F0F4\";\n}\n.fa-cutlery:before {\n  content: \"\\F0F5\";\n}\n.fa-file-text-o:before {\n  content: \"\\F0F6\";\n}\n.fa-building-o:before {\n  content: \"\\F0F7\";\n}\n.fa-hospital-o:before {\n  content: \"\\F0F8\";\n}\n.fa-ambulance:before {\n  content: \"\\F0F9\";\n}\n.fa-medkit:before {\n  content: \"\\F0FA\";\n}\n.fa-fighter-jet:before {\n  content: \"\\F0FB\";\n}\n.fa-beer:before {\n  content: \"\\F0FC\";\n}\n.fa-h-square:before {\n  content: \"\\F0FD\";\n}\n.fa-plus-square:before {\n  content: \"\\F0FE\";\n}\n.fa-angle-double-left:before {\n  content: \"\\F100\";\n}\n.fa-angle-double-right:before {\n  content: \"\\F101\";\n}\n.fa-angle-double-up:before {\n  content: \"\\F102\";\n}\n.fa-angle-double-down:before {\n  content: \"\\F103\";\n}\n.fa-angle-left:before {\n  content: \"\\F104\";\n}\n.fa-angle-right:before {\n  content: \"\\F105\";\n}\n.fa-angle-up:before {\n  content: \"\\F106\";\n}\n.fa-angle-down:before {\n  content: \"\\F107\";\n}\n.fa-desktop:before {\n  content: \"\\F108\";\n}\n.fa-laptop:before {\n  content: \"\\F109\";\n}\n.fa-tablet:before {\n  content: \"\\F10A\";\n}\n.fa-mobile-phone:before,\n.fa-mobile:before {\n  content: \"\\F10B\";\n}\n.fa-circle-o:before {\n  content: \"\\F10C\";\n}\n.fa-quote-left:before {\n  content: \"\\F10D\";\n}\n.fa-quote-right:before {\n  content: \"\\F10E\";\n}\n.fa-spinner:before {\n  content: \"\\F110\";\n}\n.fa-circle:before {\n  content: \"\\F111\";\n}\n.fa-mail-reply:before,\n.fa-reply:before {\n  content: \"\\F112\";\n}\n.fa-github-alt:before {\n  content: \"\\F113\";\n}\n.fa-folder-o:before {\n  content: \"\\F114\";\n}\n.fa-folder-open-o:before {\n  content: \"\\F115\";\n}\n.fa-smile-o:before {\n  content: \"\\F118\";\n}\n.fa-frown-o:before {\n  content: \"\\F119\";\n}\n.fa-meh-o:before {\n  content: \"\\F11A\";\n}\n.fa-gamepad:before {\n  content: \"\\F11B\";\n}\n.fa-keyboard-o:before {\n  content: \"\\F11C\";\n}\n.fa-flag-o:before {\n  content: \"\\F11D\";\n}\n.fa-flag-checkered:before {\n  content: \"\\F11E\";\n}\n.fa-terminal:before {\n  content: \"\\F120\";\n}\n.fa-code:before {\n  content: \"\\F121\";\n}\n.fa-mail-reply-all:before,\n.fa-reply-all:before {\n  content: \"\\F122\";\n}\n.fa-star-half-empty:before,\n.fa-star-half-full:before,\n.fa-star-half-o:before {\n  content: \"\\F123\";\n}\n.fa-location-arrow:before {\n  content: \"\\F124\";\n}\n.fa-crop:before {\n  content: \"\\F125\";\n}\n.fa-code-fork:before {\n  content: \"\\F126\";\n}\n.fa-unlink:before,\n.fa-chain-broken:before {\n  content: \"\\F127\";\n}\n.fa-question:before {\n  content: \"\\F128\";\n}\n.fa-info:before {\n  content: \"\\F129\";\n}\n.fa-exclamation:before {\n  content: \"\\F12A\";\n}\n.fa-superscript:before {\n  content: \"\\F12B\";\n}\n.fa-subscript:before {\n  content: \"\\F12C\";\n}\n.fa-eraser:before {\n  content: \"\\F12D\";\n}\n.fa-puzzle-piece:before {\n  content: \"\\F12E\";\n}\n.fa-microphone:before {\n  content: \"\\F130\";\n}\n.fa-microphone-slash:before {\n  content: \"\\F131\";\n}\n.fa-shield:before {\n  content: \"\\F132\";\n}\n.fa-calendar-o:before {\n  content: \"\\F133\";\n}\n.fa-fire-extinguisher:before {\n  content: \"\\F134\";\n}\n.fa-rocket:before {\n  content: \"\\F135\";\n}\n.fa-maxcdn:before {\n  content: \"\\F136\";\n}\n.fa-chevron-circle-left:before {\n  content: \"\\F137\";\n}\n.fa-chevron-circle-right:before {\n  content: \"\\F138\";\n}\n.fa-chevron-circle-up:before {\n  content: \"\\F139\";\n}\n.fa-chevron-circle-down:before {\n  content: \"\\F13A\";\n}\n.fa-html5:before {\n  content: \"\\F13B\";\n}\n.fa-css3:before {\n  content: \"\\F13C\";\n}\n.fa-anchor:before {\n  content: \"\\F13D\";\n}\n.fa-unlock-alt:before {\n  content: \"\\F13E\";\n}\n.fa-bullseye:before {\n  content: \"\\F140\";\n}\n.fa-ellipsis-h:before {\n  content: \"\\F141\";\n}\n.fa-ellipsis-v:before {\n  content: \"\\F142\";\n}\n.fa-rss-square:before {\n  content: \"\\F143\";\n}\n.fa-play-circle:before {\n  content: \"\\F144\";\n}\n.fa-ticket:before {\n  content: \"\\F145\";\n}\n.fa-minus-square:before {\n  content: \"\\F146\";\n}\n.fa-minus-square-o:before {\n  content: \"\\F147\";\n}\n.fa-level-up:before {\n  content: \"\\F148\";\n}\n.fa-level-down:before {\n  content: \"\\F149\";\n}\n.fa-check-square:before {\n  content: \"\\F14A\";\n}\n.fa-pencil-square:before {\n  content: \"\\F14B\";\n}\n.fa-external-link-square:before {\n  content: \"\\F14C\";\n}\n.fa-share-square:before {\n  content: \"\\F14D\";\n}\n.fa-compass:before {\n  content: \"\\F14E\";\n}\n.fa-toggle-down:before,\n.fa-caret-square-o-down:before {\n  content: \"\\F150\";\n}\n.fa-toggle-up:before,\n.fa-caret-square-o-up:before {\n  content: \"\\F151\";\n}\n.fa-toggle-right:before,\n.fa-caret-square-o-right:before {\n  content: \"\\F152\";\n}\n.fa-euro:before,\n.fa-eur:before {\n  content: \"\\F153\";\n}\n.fa-gbp:before {\n  content: \"\\F154\";\n}\n.fa-dollar:before,\n.fa-usd:before {\n  content: \"\\F155\";\n}\n.fa-rupee:before,\n.fa-inr:before {\n  content: \"\\F156\";\n}\n.fa-cny:before,\n.fa-rmb:before,\n.fa-yen:before,\n.fa-jpy:before {\n  content: \"\\F157\";\n}\n.fa-ruble:before,\n.fa-rouble:before,\n.fa-rub:before {\n  content: \"\\F158\";\n}\n.fa-won:before,\n.fa-krw:before {\n  content: \"\\F159\";\n}\n.fa-bitcoin:before,\n.fa-btc:before {\n  content: \"\\F15A\";\n}\n.fa-file:before {\n  content: \"\\F15B\";\n}\n.fa-file-text:before {\n  content: \"\\F15C\";\n}\n.fa-sort-alpha-asc:before {\n  content: \"\\F15D\";\n}\n.fa-sort-alpha-desc:before {\n  content: \"\\F15E\";\n}\n.fa-sort-amount-asc:before {\n  content: \"\\F160\";\n}\n.fa-sort-amount-desc:before {\n  content: \"\\F161\";\n}\n.fa-sort-numeric-asc:before {\n  content: \"\\F162\";\n}\n.fa-sort-numeric-desc:before {\n  content: \"\\F163\";\n}\n.fa-thumbs-up:before {\n  content: \"\\F164\";\n}\n.fa-thumbs-down:before {\n  content: \"\\F165\";\n}\n.fa-youtube-square:before {\n  content: \"\\F166\";\n}\n.fa-youtube:before {\n  content: \"\\F167\";\n}\n.fa-xing:before {\n  content: \"\\F168\";\n}\n.fa-xing-square:before {\n  content: \"\\F169\";\n}\n.fa-youtube-play:before {\n  content: \"\\F16A\";\n}\n.fa-dropbox:before {\n  content: \"\\F16B\";\n}\n.fa-stack-overflow:before {\n  content: \"\\F16C\";\n}\n.fa-instagram:before {\n  content: \"\\F16D\";\n}\n.fa-flickr:before {\n  content: \"\\F16E\";\n}\n.fa-adn:before {\n  content: \"\\F170\";\n}\n.fa-bitbucket:before {\n  content: \"\\F171\";\n}\n.fa-bitbucket-square:before {\n  content: \"\\F172\";\n}\n.fa-tumblr:before {\n  content: \"\\F173\";\n}\n.fa-tumblr-square:before {\n  content: \"\\F174\";\n}\n.fa-long-arrow-down:before {\n  content: \"\\F175\";\n}\n.fa-long-arrow-up:before {\n  content: \"\\F176\";\n}\n.fa-long-arrow-left:before {\n  content: \"\\F177\";\n}\n.fa-long-arrow-right:before {\n  content: \"\\F178\";\n}\n.fa-apple:before {\n  content: \"\\F179\";\n}\n.fa-windows:before {\n  content: \"\\F17A\";\n}\n.fa-android:before {\n  content: \"\\F17B\";\n}\n.fa-linux:before {\n  content: \"\\F17C\";\n}\n.fa-dribbble:before {\n  content: \"\\F17D\";\n}\n.fa-skype:before {\n  content: \"\\F17E\";\n}\n.fa-foursquare:before {\n  content: \"\\F180\";\n}\n.fa-trello:before {\n  content: \"\\F181\";\n}\n.fa-female:before {\n  content: \"\\F182\";\n}\n.fa-male:before {\n  content: \"\\F183\";\n}\n.fa-gittip:before,\n.fa-gratipay:before {\n  content: \"\\F184\";\n}\n.fa-sun-o:before {\n  content: \"\\F185\";\n}\n.fa-moon-o:before {\n  content: \"\\F186\";\n}\n.fa-archive:before {\n  content: \"\\F187\";\n}\n.fa-bug:before {\n  content: \"\\F188\";\n}\n.fa-vk:before {\n  content: \"\\F189\";\n}\n.fa-weibo:before {\n  content: \"\\F18A\";\n}\n.fa-renren:before {\n  content: \"\\F18B\";\n}\n.fa-pagelines:before {\n  content: \"\\F18C\";\n}\n.fa-stack-exchange:before {\n  content: \"\\F18D\";\n}\n.fa-arrow-circle-o-right:before {\n  content: \"\\F18E\";\n}\n.fa-arrow-circle-o-left:before {\n  content: \"\\F190\";\n}\n.fa-toggle-left:before,\n.fa-caret-square-o-left:before {\n  content: \"\\F191\";\n}\n.fa-dot-circle-o:before {\n  content: \"\\F192\";\n}\n.fa-wheelchair:before {\n  content: \"\\F193\";\n}\n.fa-vimeo-square:before {\n  content: \"\\F194\";\n}\n.fa-turkish-lira:before,\n.fa-try:before {\n  content: \"\\F195\";\n}\n.fa-plus-square-o:before {\n  content: \"\\F196\";\n}\n.fa-space-shuttle:before {\n  content: \"\\F197\";\n}\n.fa-slack:before {\n  content: \"\\F198\";\n}\n.fa-envelope-square:before {\n  content: \"\\F199\";\n}\n.fa-wordpress:before {\n  content: \"\\F19A\";\n}\n.fa-openid:before {\n  content: \"\\F19B\";\n}\n.fa-institution:before,\n.fa-bank:before,\n.fa-university:before {\n  content: \"\\F19C\";\n}\n.fa-mortar-board:before,\n.fa-graduation-cap:before {\n  content: \"\\F19D\";\n}\n.fa-yahoo:before {\n  content: \"\\F19E\";\n}\n.fa-google:before {\n  content: \"\\F1A0\";\n}\n.fa-reddit:before {\n  content: \"\\F1A1\";\n}\n.fa-reddit-square:before {\n  content: \"\\F1A2\";\n}\n.fa-stumbleupon-circle:before {\n  content: \"\\F1A3\";\n}\n.fa-stumbleupon:before {\n  content: \"\\F1A4\";\n}\n.fa-delicious:before {\n  content: \"\\F1A5\";\n}\n.fa-digg:before {\n  content: \"\\F1A6\";\n}\n.fa-pied-piper-pp:before {\n  content: \"\\F1A7\";\n}\n.fa-pied-piper-alt:before {\n  content: \"\\F1A8\";\n}\n.fa-drupal:before {\n  content: \"\\F1A9\";\n}\n.fa-joomla:before {\n  content: \"\\F1AA\";\n}\n.fa-language:before {\n  content: \"\\F1AB\";\n}\n.fa-fax:before {\n  content: \"\\F1AC\";\n}\n.fa-building:before {\n  content: \"\\F1AD\";\n}\n.fa-child:before {\n  content: \"\\F1AE\";\n}\n.fa-paw:before {\n  content: \"\\F1B0\";\n}\n.fa-spoon:before {\n  content: \"\\F1B1\";\n}\n.fa-cube:before {\n  content: \"\\F1B2\";\n}\n.fa-cubes:before {\n  content: \"\\F1B3\";\n}\n.fa-behance:before {\n  content: \"\\F1B4\";\n}\n.fa-behance-square:before {\n  content: \"\\F1B5\";\n}\n.fa-steam:before {\n  content: \"\\F1B6\";\n}\n.fa-steam-square:before {\n  content: \"\\F1B7\";\n}\n.fa-recycle:before {\n  content: \"\\F1B8\";\n}\n.fa-automobile:before,\n.fa-car:before {\n  content: \"\\F1B9\";\n}\n.fa-cab:before,\n.fa-taxi:before {\n  content: \"\\F1BA\";\n}\n.fa-tree:before {\n  content: \"\\F1BB\";\n}\n.fa-spotify:before {\n  content: \"\\F1BC\";\n}\n.fa-deviantart:before {\n  content: \"\\F1BD\";\n}\n.fa-soundcloud:before {\n  content: \"\\F1BE\";\n}\n.fa-database:before {\n  content: \"\\F1C0\";\n}\n.fa-file-pdf-o:before {\n  content: \"\\F1C1\";\n}\n.fa-file-word-o:before {\n  content: \"\\F1C2\";\n}\n.fa-file-excel-o:before {\n  content: \"\\F1C3\";\n}\n.fa-file-powerpoint-o:before {\n  content: \"\\F1C4\";\n}\n.fa-file-photo-o:before,\n.fa-file-picture-o:before,\n.fa-file-image-o:before {\n  content: \"\\F1C5\";\n}\n.fa-file-zip-o:before,\n.fa-file-archive-o:before {\n  content: \"\\F1C6\";\n}\n.fa-file-sound-o:before,\n.fa-file-audio-o:before {\n  content: \"\\F1C7\";\n}\n.fa-file-movie-o:before,\n.fa-file-video-o:before {\n  content: \"\\F1C8\";\n}\n.fa-file-code-o:before {\n  content: \"\\F1C9\";\n}\n.fa-vine:before {\n  content: \"\\F1CA\";\n}\n.fa-codepen:before {\n  content: \"\\F1CB\";\n}\n.fa-jsfiddle:before {\n  content: \"\\F1CC\";\n}\n.fa-life-bouy:before,\n.fa-life-buoy:before,\n.fa-life-saver:before,\n.fa-support:before,\n.fa-life-ring:before {\n  content: \"\\F1CD\";\n}\n.fa-circle-o-notch:before {\n  content: \"\\F1CE\";\n}\n.fa-ra:before,\n.fa-resistance:before,\n.fa-rebel:before {\n  content: \"\\F1D0\";\n}\n.fa-ge:before,\n.fa-empire:before {\n  content: \"\\F1D1\";\n}\n.fa-git-square:before {\n  content: \"\\F1D2\";\n}\n.fa-git:before {\n  content: \"\\F1D3\";\n}\n.fa-y-combinator-square:before,\n.fa-yc-square:before,\n.fa-hacker-news:before {\n  content: \"\\F1D4\";\n}\n.fa-tencent-weibo:before {\n  content: \"\\F1D5\";\n}\n.fa-qq:before {\n  content: \"\\F1D6\";\n}\n.fa-wechat:before,\n.fa-weixin:before {\n  content: \"\\F1D7\";\n}\n.fa-send:before,\n.fa-paper-plane:before {\n  content: \"\\F1D8\";\n}\n.fa-send-o:before,\n.fa-paper-plane-o:before {\n  content: \"\\F1D9\";\n}\n.fa-history:before {\n  content: \"\\F1DA\";\n}\n.fa-circle-thin:before {\n  content: \"\\F1DB\";\n}\n.fa-header:before {\n  content: \"\\F1DC\";\n}\n.fa-paragraph:before {\n  content: \"\\F1DD\";\n}\n.fa-sliders:before {\n  content: \"\\F1DE\";\n}\n.fa-share-alt:before {\n  content: \"\\F1E0\";\n}\n.fa-share-alt-square:before {\n  content: \"\\F1E1\";\n}\n.fa-bomb:before {\n  content: \"\\F1E2\";\n}\n.fa-soccer-ball-o:before,\n.fa-futbol-o:before {\n  content: \"\\F1E3\";\n}\n.fa-tty:before {\n  content: \"\\F1E4\";\n}\n.fa-binoculars:before {\n  content: \"\\F1E5\";\n}\n.fa-plug:before {\n  content: \"\\F1E6\";\n}\n.fa-slideshare:before {\n  content: \"\\F1E7\";\n}\n.fa-twitch:before {\n  content: \"\\F1E8\";\n}\n.fa-yelp:before {\n  content: \"\\F1E9\";\n}\n.fa-newspaper-o:before {\n  content: \"\\F1EA\";\n}\n.fa-wifi:before {\n  content: \"\\F1EB\";\n}\n.fa-calculator:before {\n  content: \"\\F1EC\";\n}\n.fa-paypal:before {\n  content: \"\\F1ED\";\n}\n.fa-google-wallet:before {\n  content: \"\\F1EE\";\n}\n.fa-cc-visa:before {\n  content: \"\\F1F0\";\n}\n.fa-cc-mastercard:before {\n  content: \"\\F1F1\";\n}\n.fa-cc-discover:before {\n  content: \"\\F1F2\";\n}\n.fa-cc-amex:before {\n  content: \"\\F1F3\";\n}\n.fa-cc-paypal:before {\n  content: \"\\F1F4\";\n}\n.fa-cc-stripe:before {\n  content: \"\\F1F5\";\n}\n.fa-bell-slash:before {\n  content: \"\\F1F6\";\n}\n.fa-bell-slash-o:before {\n  content: \"\\F1F7\";\n}\n.fa-trash:before {\n  content: \"\\F1F8\";\n}\n.fa-copyright:before {\n  content: \"\\F1F9\";\n}\n.fa-at:before {\n  content: \"\\F1FA\";\n}\n.fa-eyedropper:before {\n  content: \"\\F1FB\";\n}\n.fa-paint-brush:before {\n  content: \"\\F1FC\";\n}\n.fa-birthday-cake:before {\n  content: \"\\F1FD\";\n}\n.fa-area-chart:before {\n  content: \"\\F1FE\";\n}\n.fa-pie-chart:before {\n  content: \"\\F200\";\n}\n.fa-line-chart:before {\n  content: \"\\F201\";\n}\n.fa-lastfm:before {\n  content: \"\\F202\";\n}\n.fa-lastfm-square:before {\n  content: \"\\F203\";\n}\n.fa-toggle-off:before {\n  content: \"\\F204\";\n}\n.fa-toggle-on:before {\n  content: \"\\F205\";\n}\n.fa-bicycle:before {\n  content: \"\\F206\";\n}\n.fa-bus:before {\n  content: \"\\F207\";\n}\n.fa-ioxhost:before {\n  content: \"\\F208\";\n}\n.fa-angellist:before {\n  content: \"\\F209\";\n}\n.fa-cc:before {\n  content: \"\\F20A\";\n}\n.fa-shekel:before,\n.fa-sheqel:before,\n.fa-ils:before {\n  content: \"\\F20B\";\n}\n.fa-meanpath:before {\n  content: \"\\F20C\";\n}\n.fa-buysellads:before {\n  content: \"\\F20D\";\n}\n.fa-connectdevelop:before {\n  content: \"\\F20E\";\n}\n.fa-dashcube:before {\n  content: \"\\F210\";\n}\n.fa-forumbee:before {\n  content: \"\\F211\";\n}\n.fa-leanpub:before {\n  content: \"\\F212\";\n}\n.fa-sellsy:before {\n  content: \"\\F213\";\n}\n.fa-shirtsinbulk:before {\n  content: \"\\F214\";\n}\n.fa-simplybuilt:before {\n  content: \"\\F215\";\n}\n.fa-skyatlas:before {\n  content: \"\\F216\";\n}\n.fa-cart-plus:before {\n  content: \"\\F217\";\n}\n.fa-cart-arrow-down:before {\n  content: \"\\F218\";\n}\n.fa-diamond:before {\n  content: \"\\F219\";\n}\n.fa-ship:before {\n  content: \"\\F21A\";\n}\n.fa-user-secret:before {\n  content: \"\\F21B\";\n}\n.fa-motorcycle:before {\n  content: \"\\F21C\";\n}\n.fa-street-view:before {\n  content: \"\\F21D\";\n}\n.fa-heartbeat:before {\n  content: \"\\F21E\";\n}\n.fa-venus:before {\n  content: \"\\F221\";\n}\n.fa-mars:before {\n  content: \"\\F222\";\n}\n.fa-mercury:before {\n  content: \"\\F223\";\n}\n.fa-intersex:before,\n.fa-transgender:before {\n  content: \"\\F224\";\n}\n.fa-transgender-alt:before {\n  content: \"\\F225\";\n}\n.fa-venus-double:before {\n  content: \"\\F226\";\n}\n.fa-mars-double:before {\n  content: \"\\F227\";\n}\n.fa-venus-mars:before {\n  content: \"\\F228\";\n}\n.fa-mars-stroke:before {\n  content: \"\\F229\";\n}\n.fa-mars-stroke-v:before {\n  content: \"\\F22A\";\n}\n.fa-mars-stroke-h:before {\n  content: \"\\F22B\";\n}\n.fa-neuter:before {\n  content: \"\\F22C\";\n}\n.fa-genderless:before {\n  content: \"\\F22D\";\n}\n.fa-facebook-official:before {\n  content: \"\\F230\";\n}\n.fa-pinterest-p:before {\n  content: \"\\F231\";\n}\n.fa-whatsapp:before {\n  content: \"\\F232\";\n}\n.fa-server:before {\n  content: \"\\F233\";\n}\n.fa-user-plus:before {\n  content: \"\\F234\";\n}\n.fa-user-times:before {\n  content: \"\\F235\";\n}\n.fa-hotel:before,\n.fa-bed:before {\n  content: \"\\F236\";\n}\n.fa-viacoin:before {\n  content: \"\\F237\";\n}\n.fa-train:before {\n  content: \"\\F238\";\n}\n.fa-subway:before {\n  content: \"\\F239\";\n}\n.fa-medium:before {\n  content: \"\\F23A\";\n}\n.fa-yc:before,\n.fa-y-combinator:before {\n  content: \"\\F23B\";\n}\n.fa-optin-monster:before {\n  content: \"\\F23C\";\n}\n.fa-opencart:before {\n  content: \"\\F23D\";\n}\n.fa-expeditedssl:before {\n  content: \"\\F23E\";\n}\n.fa-battery-4:before,\n.fa-battery:before,\n.fa-battery-full:before {\n  content: \"\\F240\";\n}\n.fa-battery-3:before,\n.fa-battery-three-quarters:before {\n  content: \"\\F241\";\n}\n.fa-battery-2:before,\n.fa-battery-half:before {\n  content: \"\\F242\";\n}\n.fa-battery-1:before,\n.fa-battery-quarter:before {\n  content: \"\\F243\";\n}\n.fa-battery-0:before,\n.fa-battery-empty:before {\n  content: \"\\F244\";\n}\n.fa-mouse-pointer:before {\n  content: \"\\F245\";\n}\n.fa-i-cursor:before {\n  content: \"\\F246\";\n}\n.fa-object-group:before {\n  content: \"\\F247\";\n}\n.fa-object-ungroup:before {\n  content: \"\\F248\";\n}\n.fa-sticky-note:before {\n  content: \"\\F249\";\n}\n.fa-sticky-note-o:before {\n  content: \"\\F24A\";\n}\n.fa-cc-jcb:before {\n  content: \"\\F24B\";\n}\n.fa-cc-diners-club:before {\n  content: \"\\F24C\";\n}\n.fa-clone:before {\n  content: \"\\F24D\";\n}\n.fa-balance-scale:before {\n  content: \"\\F24E\";\n}\n.fa-hourglass-o:before {\n  content: \"\\F250\";\n}\n.fa-hourglass-1:before,\n.fa-hourglass-start:before {\n  content: \"\\F251\";\n}\n.fa-hourglass-2:before,\n.fa-hourglass-half:before {\n  content: \"\\F252\";\n}\n.fa-hourglass-3:before,\n.fa-hourglass-end:before {\n  content: \"\\F253\";\n}\n.fa-hourglass:before {\n  content: \"\\F254\";\n}\n.fa-hand-grab-o:before,\n.fa-hand-rock-o:before {\n  content: \"\\F255\";\n}\n.fa-hand-stop-o:before,\n.fa-hand-paper-o:before {\n  content: \"\\F256\";\n}\n.fa-hand-scissors-o:before {\n  content: \"\\F257\";\n}\n.fa-hand-lizard-o:before {\n  content: \"\\F258\";\n}\n.fa-hand-spock-o:before {\n  content: \"\\F259\";\n}\n.fa-hand-pointer-o:before {\n  content: \"\\F25A\";\n}\n.fa-hand-peace-o:before {\n  content: \"\\F25B\";\n}\n.fa-trademark:before {\n  content: \"\\F25C\";\n}\n.fa-registered:before {\n  content: \"\\F25D\";\n}\n.fa-creative-commons:before {\n  content: \"\\F25E\";\n}\n.fa-gg:before {\n  content: \"\\F260\";\n}\n.fa-gg-circle:before {\n  content: \"\\F261\";\n}\n.fa-tripadvisor:before {\n  content: \"\\F262\";\n}\n.fa-odnoklassniki:before {\n  content: \"\\F263\";\n}\n.fa-odnoklassniki-square:before {\n  content: \"\\F264\";\n}\n.fa-get-pocket:before {\n  content: \"\\F265\";\n}\n.fa-wikipedia-w:before {\n  content: \"\\F266\";\n}\n.fa-safari:before {\n  content: \"\\F267\";\n}\n.fa-chrome:before {\n  content: \"\\F268\";\n}\n.fa-firefox:before {\n  content: \"\\F269\";\n}\n.fa-opera:before {\n  content: \"\\F26A\";\n}\n.fa-internet-explorer:before {\n  content: \"\\F26B\";\n}\n.fa-tv:before,\n.fa-television:before {\n  content: \"\\F26C\";\n}\n.fa-contao:before {\n  content: \"\\F26D\";\n}\n.fa-500px:before {\n  content: \"\\F26E\";\n}\n.fa-amazon:before {\n  content: \"\\F270\";\n}\n.fa-calendar-plus-o:before {\n  content: \"\\F271\";\n}\n.fa-calendar-minus-o:before {\n  content: \"\\F272\";\n}\n.fa-calendar-times-o:before {\n  content: \"\\F273\";\n}\n.fa-calendar-check-o:before {\n  content: \"\\F274\";\n}\n.fa-industry:before {\n  content: \"\\F275\";\n}\n.fa-map-pin:before {\n  content: \"\\F276\";\n}\n.fa-map-signs:before {\n  content: \"\\F277\";\n}\n.fa-map-o:before {\n  content: \"\\F278\";\n}\n.fa-map:before {\n  content: \"\\F279\";\n}\n.fa-commenting:before {\n  content: \"\\F27A\";\n}\n.fa-commenting-o:before {\n  content: \"\\F27B\";\n}\n.fa-houzz:before {\n  content: \"\\F27C\";\n}\n.fa-vimeo:before {\n  content: \"\\F27D\";\n}\n.fa-black-tie:before {\n  content: \"\\F27E\";\n}\n.fa-fonticons:before {\n  content: \"\\F280\";\n}\n.fa-reddit-alien:before {\n  content: \"\\F281\";\n}\n.fa-edge:before {\n  content: \"\\F282\";\n}\n.fa-credit-card-alt:before {\n  content: \"\\F283\";\n}\n.fa-codiepie:before {\n  content: \"\\F284\";\n}\n.fa-modx:before {\n  content: \"\\F285\";\n}\n.fa-fort-awesome:before {\n  content: \"\\F286\";\n}\n.fa-usb:before {\n  content: \"\\F287\";\n}\n.fa-product-hunt:before {\n  content: \"\\F288\";\n}\n.fa-mixcloud:before {\n  content: \"\\F289\";\n}\n.fa-scribd:before {\n  content: \"\\F28A\";\n}\n.fa-pause-circle:before {\n  content: \"\\F28B\";\n}\n.fa-pause-circle-o:before {\n  content: \"\\F28C\";\n}\n.fa-stop-circle:before {\n  content: \"\\F28D\";\n}\n.fa-stop-circle-o:before {\n  content: \"\\F28E\";\n}\n.fa-shopping-bag:before {\n  content: \"\\F290\";\n}\n.fa-shopping-basket:before {\n  content: \"\\F291\";\n}\n.fa-hashtag:before {\n  content: \"\\F292\";\n}\n.fa-bluetooth:before {\n  content: \"\\F293\";\n}\n.fa-bluetooth-b:before {\n  content: \"\\F294\";\n}\n.fa-percent:before {\n  content: \"\\F295\";\n}\n.fa-gitlab:before {\n  content: \"\\F296\";\n}\n.fa-wpbeginner:before {\n  content: \"\\F297\";\n}\n.fa-wpforms:before {\n  content: \"\\F298\";\n}\n.fa-envira:before {\n  content: \"\\F299\";\n}\n.fa-universal-access:before {\n  content: \"\\F29A\";\n}\n.fa-wheelchair-alt:before {\n  content: \"\\F29B\";\n}\n.fa-question-circle-o:before {\n  content: \"\\F29C\";\n}\n.fa-blind:before {\n  content: \"\\F29D\";\n}\n.fa-audio-description:before {\n  content: \"\\F29E\";\n}\n.fa-volume-control-phone:before {\n  content: \"\\F2A0\";\n}\n.fa-braille:before {\n  content: \"\\F2A1\";\n}\n.fa-assistive-listening-systems:before {\n  content: \"\\F2A2\";\n}\n.fa-asl-interpreting:before,\n.fa-american-sign-language-interpreting:before {\n  content: \"\\F2A3\";\n}\n.fa-deafness:before,\n.fa-hard-of-hearing:before,\n.fa-deaf:before {\n  content: \"\\F2A4\";\n}\n.fa-glide:before {\n  content: \"\\F2A5\";\n}\n.fa-glide-g:before {\n  content: \"\\F2A6\";\n}\n.fa-signing:before,\n.fa-sign-language:before {\n  content: \"\\F2A7\";\n}\n.fa-low-vision:before {\n  content: \"\\F2A8\";\n}\n.fa-viadeo:before {\n  content: \"\\F2A9\";\n}\n.fa-viadeo-square:before {\n  content: \"\\F2AA\";\n}\n.fa-snapchat:before {\n  content: \"\\F2AB\";\n}\n.fa-snapchat-ghost:before {\n  content: \"\\F2AC\";\n}\n.fa-snapchat-square:before {\n  content: \"\\F2AD\";\n}\n.fa-pied-piper:before {\n  content: \"\\F2AE\";\n}\n.fa-first-order:before {\n  content: \"\\F2B0\";\n}\n.fa-yoast:before {\n  content: \"\\F2B1\";\n}\n.fa-themeisle:before {\n  content: \"\\F2B2\";\n}\n.fa-google-plus-circle:before,\n.fa-google-plus-official:before {\n  content: \"\\F2B3\";\n}\n.fa-fa:before,\n.fa-font-awesome:before {\n  content: \"\\F2B4\";\n}\n.fa-handshake-o:before {\n  content: \"\\F2B5\";\n}\n.fa-envelope-open:before {\n  content: \"\\F2B6\";\n}\n.fa-envelope-open-o:before {\n  content: \"\\F2B7\";\n}\n.fa-linode:before {\n  content: \"\\F2B8\";\n}\n.fa-address-book:before {\n  content: \"\\F2B9\";\n}\n.fa-address-book-o:before {\n  content: \"\\F2BA\";\n}\n.fa-vcard:before,\n.fa-address-card:before {\n  content: \"\\F2BB\";\n}\n.fa-vcard-o:before,\n.fa-address-card-o:before {\n  content: \"\\F2BC\";\n}\n.fa-user-circle:before {\n  content: \"\\F2BD\";\n}\n.fa-user-circle-o:before {\n  content: \"\\F2BE\";\n}\n.fa-user-o:before {\n  content: \"\\F2C0\";\n}\n.fa-id-badge:before {\n  content: \"\\F2C1\";\n}\n.fa-drivers-license:before,\n.fa-id-card:before {\n  content: \"\\F2C2\";\n}\n.fa-drivers-license-o:before,\n.fa-id-card-o:before {\n  content: \"\\F2C3\";\n}\n.fa-quora:before {\n  content: \"\\F2C4\";\n}\n.fa-free-code-camp:before {\n  content: \"\\F2C5\";\n}\n.fa-telegram:before {\n  content: \"\\F2C6\";\n}\n.fa-thermometer-4:before,\n.fa-thermometer:before,\n.fa-thermometer-full:before {\n  content: \"\\F2C7\";\n}\n.fa-thermometer-3:before,\n.fa-thermometer-three-quarters:before {\n  content: \"\\F2C8\";\n}\n.fa-thermometer-2:before,\n.fa-thermometer-half:before {\n  content: \"\\F2C9\";\n}\n.fa-thermometer-1:before,\n.fa-thermometer-quarter:before {\n  content: \"\\F2CA\";\n}\n.fa-thermometer-0:before,\n.fa-thermometer-empty:before {\n  content: \"\\F2CB\";\n}\n.fa-shower:before {\n  content: \"\\F2CC\";\n}\n.fa-bathtub:before,\n.fa-s15:before,\n.fa-bath:before {\n  content: \"\\F2CD\";\n}\n.fa-podcast:before {\n  content: \"\\F2CE\";\n}\n.fa-window-maximize:before {\n  content: \"\\F2D0\";\n}\n.fa-window-minimize:before {\n  content: \"\\F2D1\";\n}\n.fa-window-restore:before {\n  content: \"\\F2D2\";\n}\n.fa-times-rectangle:before,\n.fa-window-close:before {\n  content: \"\\F2D3\";\n}\n.fa-times-rectangle-o:before,\n.fa-window-close-o:before {\n  content: \"\\F2D4\";\n}\n.fa-bandcamp:before {\n  content: \"\\F2D5\";\n}\n.fa-grav:before {\n  content: \"\\F2D6\";\n}\n.fa-etsy:before {\n  content: \"\\F2D7\";\n}\n.fa-imdb:before {\n  content: \"\\F2D8\";\n}\n.fa-ravelry:before {\n  content: \"\\F2D9\";\n}\n.fa-eercast:before {\n  content: \"\\F2DA\";\n}\n.fa-microchip:before {\n  content: \"\\F2DB\";\n}\n.fa-snowflake-o:before {\n  content: \"\\F2DC\";\n}\n.fa-superpowers:before {\n  content: \"\\F2DD\";\n}\n.fa-wpexplorer:before {\n  content: \"\\F2DE\";\n}\n.fa-meetup:before {\n  content: \"\\F2E0\";\n}\n/* makes the font 33% larger relative to the icon container */\n.fa-lg {\n  font-size: 1.33333333em;\n  line-height: 0.75em;\n  vertical-align: -15%;\n}\n.fa-2x {\n  font-size: 2em;\n}\n.fa-3x {\n  font-size: 3em;\n}\n.fa-4x {\n  font-size: 4em;\n}\n.fa-5x {\n  font-size: 5em;\n}\n/* FONT PATH\n * -------------------------- */\n@font-face {\n  font-family: 'FontAwesome';\n  src: url(" + __webpack_require__(83) + ");\n  src: url(" + __webpack_require__(84) + "?#iefix&v=4.7.0) format('embedded-opentype'), url(" + __webpack_require__(85) + ") format('woff2'), url(" + __webpack_require__(86) + ") format('woff'), url(" + __webpack_require__(87) + ") format('truetype'), url(" + __webpack_require__(88) + "#fontawesomeregular) format('svg');\n  font-weight: normal;\n  font-style: normal;\n}\n", ""]);

// exports


/***/ }),

/***/ 83:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "fonts/fontawesome-webfont.eot";

/***/ }),

/***/ 84:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "fonts/fontawesome-webfont.eot";

/***/ }),

/***/ 85:
/***/ (function(module, exports) {

module.exports = "data:application/font-woff2;base64,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"

/***/ }),

/***/ 86:
/***/ (function(module, exports) {

module.exports = "data:application/font-woff;base64,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"

/***/ }),

/***/ 87:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "fonts/fontawesome-webfont.ttf";

/***/ }),

/***/ 88:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "fonts/fontawesome-webfont.svg";

/***/ }),

/***/ 89:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });


/* harmony default export */ __webpack_exports__["default"] = (angular.module('myApp.welcome', ['facebookService'])

.controller('WelcomeCtrl', ['$scope', /*'getEventFacebook', 'ENV', '$window',*/ function($scope/*, getEventFacebook, ENV, $window*/) {
    $scope.status = {
        isopenWelcome: false
    };
    /*$window.fbAsyncInit = function() {
    FB.init({ 
      appId: ENV.appId,
      status: true, 
      cookie: true, 
      xfbml: true,
      version: 'v2.6'
    });
};

    getEventFacebook.getEvent(user_id).then(function successCallBack(response) {
        console.log(response);
    }, function errorCallBack() {
        console.log("something went wrong");
    });
*/  
}]));


/***/ }),

/***/ 90:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });


/* harmony default export */ __webpack_exports__["default"] = (angular.module('myApp.viewCreateMeal', ['ui.router', 'ngAnimate', 'ezfb', 'ngAutocomplete'])

.controller('ViewCreateMealCtrl', ['$scope', '$http', '$uibModal', '$state', 'ENV', 'ezfb', '$auth', '$rootScope', 'userServicesFactory', function($scope, $http, $uibModal, $state, ENV, ezfb, $auth, $rootScope, userServicesFactory) {
  //$scope pour le plugin checkbox messenger
  $scope.origin = ENV.fbRedirectURI + "#/create_meal";
  $scope.page_id = ENV.page_id;
  $scope.app_id = ENV.appId;
  $scope.user_ref = Math.floor((Math.random() * 10000000000000) + 1);


  if ($scope.$parent.$parent.fromState.name != "") { // si on rafraichit la page alors le state d'avant est vide sinon, on relance le plugin
    $scope.$applyAsync(function() { // pour que le plugin prenne en compte correctement les paramètres alors il faut l'appeler après que le scope se soit mis en place
      ezfb.XFBML.parse(document.getElementById('fb-messenger-checkbox')); //XFBML.parse relance le plugin
    });
  }
  function confirmOptIn() {
    ezfb.AppEvents.logEvent('MessengerCheckboxUserConfirmation', null, {
      'app_id': ENV.appId,
      'page_id': ENV.page_id,
      'ref': $scope.$parent.$root.user._id,
      'user_ref': $scope.user_ref
    });
  }

  //initialize the editedMeal model
  $scope.editedMeal = $scope.editedMeal || {
      veggies: false,
      vegan: false,
      time: predefined_date,
      detailedInfo: {
        "requiredGuests": {}
      },
      automaticSubscription: false,
      address: {},
      privateInfo: {
        "address": {}
      }
    },

    $scope.setValue = function(variable) {
      if (typeof variable === 'undefined') {
        return undefined;
      }
      else {
        return variable.toString();
      }
    };

  $scope.createMeal = function() {
    if ($scope.isAuthenticated() == false) {
      $auth.authenticate('facebook') // connection via facebook
        .then(function(response) {
          console.debug("success", response);
          if ($auth.isAuthenticated()) {
            userServicesFactory().then(function(data) {
              $rootScope.user = data;
              if (data.privateInfo.cellphone) {
                createMealWithPhone();
              }
              else {
                if ($scope.createMealForm.inputCellphone.$modelValue) {
                  $http.patch('api/users/private/' + $rootScope.user._id, {
                    "privateInfo": {
                      "cellphone": $scope.createMealForm.inputCellphone.$modelValue
                    }
                  }, {
                    headers: {
                      "If-Match": $rootScope.user._etag
                    }
                  }).then(function successCallBack(response) {
                    $scope.user._etag = response.data._etag;
                    createMealWithPhone();
                  });
                }
                else {
                  console.log("please fill your number");
                }
              }
            });
          }
        });
    }
    else {
      if ($scope.createMealForm.inputCellphone.$dirty && $scope.createMealForm.inputCellphone.$valid) {
        $http.patch('api/users/private/' + $scope.$parent.$root.user._id, {
          "privateInfo": {
            "cellphone": $scope.$parent.$root.user.privateInfo.cellphone
          }
        }, {
          headers: {
            "If-Match": $scope.$parent.$root.user._etag
          }
        }).then(function successCallBack(response) {
          $scope.user._etag = response.data._etag;
          createMealWithPhone();
        });
      }
      else if ($scope.createMealForm.inputCellphone.$invalid) {
        console.log("please fill your number");
      }
      else {
        createMealWithPhone();
      }
    }
  };

  function setDate(dateToSet) {
    dateToSet.setDate($scope.editedMeal.time.getDate());
    dateToSet.setMonth($scope.editedMeal.time.getMonth());
    dateToSet.setFullYear($scope.editedMeal.time.getFullYear());
  }

  function createMealWithPhone() {
    getAddressFromAutocomplete();
    var okToPost = true;
    if ($scope.editedMeal.menu != undefined) {
      if ($scope.editedMeal.menu.title != undefined) {
        if ($scope.editedMeal.detailedInfo.requiredGuests != undefined) {
          if ($scope.editedMeal.detailedInfo.requiredGuests.cooks != undefined) {
            if ($scope.editedMeal.detailedInfo.requiredGuests.cooks.nbRquCooks == null || $scope.editedMeal.detailedInfo.requiredGuests.cooks.nbRquCooks == 0) {
              delete $scope.editedMeal.detailedInfo.requiredGuests.cooks; //si on a essayé de rentrer des aides cuisines mais que finalement on en veut plus, on le supprime
            }
            else if ($scope.editedMeal.detailedInfo.requiredGuests.cooks.nbRquCooks < 0) {
              console.log("you are trying to do somehting ilegal with the number of cooks!");
              okToPost = false;
            }
            setDate($scope.editedMeal.detailedInfo.requiredGuests.cooks.timeCooking);
            if ($scope.editedMeal.detailedInfo.requiredGuests.cooks.timeCooking > $scope.editedMeal.time) {
              okToPost = false;
            }
          }
          if ($scope.editedMeal.detailedInfo.requiredGuests.cleaners != undefined) {
            if ($scope.editedMeal.detailedInfo.requiredGuests.cleaners.nbRquCleaners == null || $scope.editedMeal.detailedInfo.requiredGuests.cleaners.nbRquCleaners == 0) {
              delete $scope.editedMeal.detailedInfo.requiredGuests.cleaners; //si on a essayé de rentrer des aides vaisselles mais que finalement on en veut plus, on le supprime
            }
            else if ($scope.editedMeal.detailedInfo.requiredGuests.cleaners.nbRquCleaners < 0) {
              console.log("you are trying to do somehting ilegal with the number of cleaners!");
              okToPost = false;
            }
            if ($scope.editedMeal.detailedInfo.requiredGuests.cleaners.timeCleaning) {
              setDate($scope.editedMeal.detailedInfo.requiredGuests.cleaners.timeCleaning);
            }
          }
          if ($scope.editedMeal.detailedInfo.requiredGuests.simpleGuests != undefined) {
            if ($scope.editedMeal.detailedInfo.requiredGuests.simpleGuests.nbRquSimpleGuests == null || $scope.editedMeal.detailedInfo.requiredGuests.simpleGuests.nbRquSimpleGuests == 0) {
              delete $scope.editedMeal.detailedInfo.requiredGuests.simpleGuests; //si on a essayé de rentrer des invités simple mais que finalement on en veut plus, on le supprime
            }
            else if ($scope.editedMeal.detailedInfo.requiredGuests.simpleGuests.nbRquSimpleGuests < 0) {
              console.log("you are trying to do somehting ilegal with the number of cleaners!");
              okToPost = false;
            }
          }
        }
        if ($scope.editedMeal.address.town == undefined || $scope.editedMeal.privateInfo.address.name == undefined) {
          console.log("address is missing");
          okToPost = false;
        }
        if ($scope.editedMeal.price == undefined) {
          console.log("price of the groceries is missing");
          okToPost = false;
        }
        if (okToPost == true) {
          $http.post('/api/meals', $scope.editedMeal).then(function(response) {
              if (!$scope.$parent.$root.user.privateInfo.user_ref) {
                confirmOptIn();
              }
              $state.go("view_my_dtld_meals", {
                "myMealId": response.data._id,
                "successSubscribedMessage": true
              });
            },
            function(response) {
              console.log(response); //sert à préparer le terrain pour afficher les erreurs qui pourraient avoir lieu lors de la publication d'un repas
            });
        }
      }
    }
  }

  function getAddressFromAutocomplete() {
    var precision_needed_for_rounding_lat_lng = 100;
    if ($scope.details != undefined) {
      if ("vicinity" in $scope.details) {
        $scope.editedMeal.address.town = $scope.details.vicinity;
      }
      else {
        $scope.editedMeal.address.town = $scope.autocompleteAddress.split(",")[0];
      }
      $scope.editedMeal.privateInfo.address.name = $scope.details.name;
      $scope.editedMeal.privateInfo.address.utc_offset = $scope.details.utc_offset;
      $scope.editedMeal.privateInfo.address.lat = $scope.details.geometry.location.lat();
      $scope.editedMeal.privateInfo.address.lng = $scope.details.geometry.location.lng();
      $scope.editedMeal.address.lat = Math.round($scope.details.geometry.location.lat() * precision_needed_for_rounding_lat_lng) / precision_needed_for_rounding_lat_lng;
      $scope.editedMeal.address.lng = Math.round($scope.details.geometry.location.lng() * precision_needed_for_rounding_lat_lng) / precision_needed_for_rounding_lat_lng;
      for (var i = 0; i < $scope.details.address_components.length; i++) {
        if ($scope.details.address_components[i].types[0] == "postal_code") {
          $scope.editedMeal.address.postalCode = $scope.details.address_components[i].long_name;
        }
      }
    }
  }

  //required for the calendar toolbar (datamodel : editedMeal.time)

  $scope.dateOptions = {
    formatYear: 'yy',
    maxDate: new Date(2020, 5, 22),
    minDate: new Date(),
    startingDay: 1
  };


  $scope.clear = function() {
    $scope.editedMeal.time = null;
  };

  $scope.date_open = function() {
    $scope.date_popup.opened = true;
  };

  $scope.date_popup = {
    opened: false
  };

  //date formats for datepicker
  $scope.date_formats = ['EEEE dd MMMM yyyy', 'dd-MMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
  $scope.date_format = $scope.date_formats[0];
  $scope.altInputDateFormats = ['M!/d!/yyyy'];

  //required for the calendar toolbar (datamodel : editedMeal.time)

  $scope.ismeridian = false;
  $scope.mstep = 10;

  //enable animations in the modal
  $scope.animationsEnabled = true;

  $scope.autocomplete;

  $scope.editedMeal.currency_symbol = "$";
  $http.get("/static/sources/createMeal/currency.json").then(function(result_currency) {
    $http.get("/static/sources/createMeal/currency_symbol.json").then(function(result_currency_symbol) {
      $http.get("/static/sources/profile/countries.json").then(function(res) {
        $scope.$watch('details', function getCurrency() {
          if ($scope.details != undefined) {
            for (var i = 0; i < $scope.details.address_components.length; i++) {
              if ($scope.details.address_components[i].types[0] == "country") {
                var country_code = $scope.details.address_components[i].short_name;
              }
            }
            var currency = result_currency.data[country_code];
            $scope.editedMeal.currency_symbol = result_currency_symbol.data[currency].symbol_native;
            $scope.editedMeal.address.country = getCountry(country_code, res.data);
          }
        });
      });
    });
  });

  function getCountry(country_code, jsonData) {
    for (var i = 0; i < jsonData.length; i++) {
      if (jsonData[i].code == country_code) {
        return jsonData[i].name;
      }
    }
  }

}]));

var predefined_date = new Date();
predefined_date.setDate(predefined_date.getDate());
predefined_date.setHours(20);
predefined_date.setMinutes(30);

/***/ }),

/***/ 91:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });

var angular = __webpack_require__(9);
/* harmony default export */ __webpack_exports__["default"] = (angular.module('myApp.viewMeals', ['myApp.viewMealsDtld', 'ngMap', 'ngSanitize'])


.controller('ViewMealsCtrl', ['$scope', '$state', '$uibModal', '$auth', 'response', '$timeout', 'NgMap', function($scope, $state, $uibModal, $auth, response, $timeout, NgMap) {

  $scope.meals = response; //récupère les données passées lorsqu'on charge la page (chargement lors de loading de la page)

  $scope.$watch("manualSubscriptionPending", function(newValue, oldValue) { //permet de savoir si dans les données chargées, il y a des meals en attente de validation
    if (newValue == true && oldValue == undefined) {
      $timeout(function() {
        $scope.manualSubscriptionPending = false;
      }, 4000);
    }
  });

  $scope.datasUserForEachMeal = function(meal) { //function qui retourne l'utilisateur s'il s'est inscrit
    if ($scope.$parent.$root.user) {
      for (var i = 0; i < meal.users.length; i++) {
        if (meal.users[i]._id == $scope.$parent.$root.user._id) {
          return meal.users[i];
        }
      }
    }
  };

  function checkStatusAccepted(i) {
    if ($scope.datasUserForEachMeal($scope.meals[i])) {
      if ($scope.datasUserForEachMeal($scope.meals[i]).status == "accepted") {
        return true;
      }
      else {
        return false;
      }
    }
    else {
      return false;
    }
  }

  $scope.openModalDtld = function(meal_id) { //permet d'ouvrir les modals de chacun de repas associés
    for (var i = 0; i < $scope.meals.length; i++) {
      if ($scope.meals[i]._id == meal_id) {
        if (checkStatusAccepted(i)) {
          $state.go("view_my_dtld_meals", {
            "myMealId": meal_id
          });
        }
        else {
          var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'static/viewMeals/viewMealsDtld/viewMealsDtld.html',
            controller: 'ViewMealsDtldCtrl',
            size: "lg",
            windowClass: 'modal-meal-window',
            scope: $scope,
            resolve: {
              meal: function() {
                return $scope.meals[i];
              },
              isAuthenticated: function() {
                return $auth.isAuthenticated();
              }
            }
          });
          modalInstance.result.then(function(result) {
            $scope.manualSubscriptionPending = result.manualSubscriptionPending;
            $timeout(function() {
              $scope.manualSubscriptionPending = false;
            }, 4000);
          });
        }
      }
    }
  };

  if ($scope.toState == "view_meals.view_meals.mealsList" && $scope.toParamsMealId && ($scope.fromState == "" || $scope.fromState == "login")) { //permet d'ouvrir le modal associé à un repas que j'essayais d'ouvrir depuis un lien extérieur si je n'étais pas identifier auparavant
    $scope.openModalDtld($scope.toParamsMealId.myMealId);
  }

  //on définit le prix du repas qui doit s'afficher
  for (var j = 0; j < $scope.meals.length; j++) {
    if ("cooks" in $scope.meals[j].detailedInfo.requiredGuests) {
      $scope.meals[j].mealPrice = $scope.meals[j].detailedInfo.requiredGuests.cooks.price; // si aide cuisine alors le prix du repas est le prix de l'aide cuisine
    }
    else if ("cleaners" in $scope.meals[j].detailedInfo.requiredGuests) {
      $scope.meals[j].mealPrice = $scope.meals[j].detailedInfo.requiredGuests.cleaners.price; // si pas aide cuisine et aide vaisselle alors le prix du repas est le prix de l'aide vaisselle
    }
    else if ("simpleGuests" in $scope.meals[j].detailedInfo.requiredGuests) {
      $scope.meals[j].mealPrice = $scope.meals[j].detailedInfo.requiredGuests.simpleGuests.price; //sinon c'est soit le prix d'aide cuisine s'il n'y a ni l'un ni l'autre
    }
    else {
      $scope.meals[j].mealPrice = $scope.meals[j].detailedInfo.requiredGuests.hosts.price; // si le repas n'a pas d'invités (par précaution), c'est le prix de l'hôte
    }
    $scope.meals[j].priceUnit = Math.ceil(10 * $scope.meals[j].price / $scope.meals[j].nbGuests) / 10; //sera utilisé pour viewMyMealDtld pour la phrase de variation de prix
  }

  $scope.countPendingRequestsPerMeal = function(mealId) {
    var numberOfPendingRequests = 0;
    $scope.meals.forEach(function(meal) {
      if (meal._id == mealId) {
        meal.users.forEach(function(user) {
          if (user.status == "pending") {
            numberOfPendingRequests += 1;
          }
        });
      }
    });
    return numberOfPendingRequests;
  };

  $scope.isCollapsed = {
    "weekDays": false,
    "period": false,
    "price": false,
    "place": false
  }; //permet de faire apparaître tous les filtres lors du chargement de la page
  $scope.reverse = false; //permet de filtrer du plus récent au plus ancien
  $scope.SortOrder = 'asc';

  $scope.openModalFilter = function(filter) { //permet d'ouvrir le modal de filtres lorsqu'on est sur mobile
    $uibModal.open({
      animation: true,
      templateUrl: 'static/viewMeals/viewFilter/filterMobile.html',
      controller: 'filterMealModalCtrl',
      scope: $scope
    });
  };

  $scope.filter = {
    weekDays: [{
      label: 'Monday',
      selected: false,
      ind: 1
    }, {
      label: 'Tuesday',
      selected: false,
      ind: 2
    }, {
      label: 'Wednesday',
      selected: false,
      ind: 3
    }, {
      label: 'Thursday',
      selected: false,
      ind: 4
    }, {
      label: 'Friday',
      selected: false,
      ind: 5
    }, {
      label: 'Saturday',
      selected: false,
      ind: 6
    }, {
      label: 'Sunday',
      selected: false,
      ind: 0
    }],
    dateFilterMin: {
      opened: false,
      value: null
    },
    dateFilterMax: {
      opened: false,
      value: null
    },
    priceFilterMin: {
      value: null
    },
    priceFilterMax: {
      value: null
    },
    cityFilter: "",
    preferenceFilter: {
      "veggies": false,
      "vegan": false,
      "halal": false,
      "kosher": false
    },
    helpingTypeFilter: {
      "cooks": false,
      "cleaners": false,
      "simpleGuests": false
    }
  };

  //-------------- FILTERS --------------//

  //code pour faire les filtres selon les weekDays
  $scope.weekDaysFilter = function(meal) { //permet de faire un filtre avec les jours de la semaine selectionnés
    if ($scope.filter.weekDays.some(checkIfWeekDaysSelected) == true) {
      var listMeal = [];
      for (var i = 0; i < $scope.filter.weekDays.length; i++) {
        if ($scope.filter.weekDays[i].selected == true) {
          var mealDate = new Date(meal.time);
          if (mealDate.getDay() == $scope.filter.weekDays[i].ind) {
            listMeal.push(meal);
          }
        }
      }
      return listMeal[0];
    }
    else {
      return meal;
    }
  };

  var now = new Date();

  $scope.futurMealsFilter = function(meal) {
    return (Date.parse(meal.time) >= now.getTime());
  };

  $scope.pastMealsFilter = function(meal) {
    return (Date.parse(meal.time) < now.getTime());
  };

  function checkIfWeekDaysSelected(element, index, array) { //vérifie si au moins un des jours de la semaine a été selectionné dans les filtres
    return element.selected == true;
  }

  //code pour faire les filtres selon une période fixe de temps
  $scope.dateFilterMin_open = function() {
    $scope.filter.dateFilterMin.opened = true;
  };

  $scope.dateFilterMax_open = function() {
    $scope.filter.dateFilterMax.opened = true;
  };

  $scope.dateRangeFilter = function(meal) {
    var mealDate = new Date(meal.time);
    if ($scope.filter.dateFilterMin.value != null && $scope.filter.dateFilterMax.value != null) {
      return (mealDate >= $scope.filter.dateFilterMin.value && mealDate <= $scope.filter.dateFilterMax.value);
    }
    else {
      if ($scope.filter.dateFilterMin.value != null) {
        return (mealDate >= $scope.filter.dateFilterMin.value);
      }
      else if ($scope.filter.dateFilterMax.value != null) {
        return (mealDate <= $scope.filter.dateFilterMax.value);
      }
      else {
        return meal;
      }
    }
  };

  $scope.priceRangeFilter = function(meal) {
    if ($scope.filter.priceFilterMin.value != null && $scope.filter.priceFilterMax.value != null) {
      return (meal.mealPrice >= $scope.filter.priceFilterMin.value && $scope.meal.mealPriceMin <= $scope.filter.priceFilterMax.value);
    }
    else {
      if ($scope.filter.priceFilterMin.value != null) {
        return (meal.mealPrice >= $scope.filter.priceFilterMin.value);
      }
      else if ($scope.filter.priceFilterMax.value != null) {
        return (meal.mealPrice <= $scope.filter.priceFilterMax.value);
      }
      else {
        return meal;
      }
    }
  };

  $scope.cityRangeFilter = function(meal) {
    if ($scope.filter.cityFilter != "") {
      var city = "";
      if ($scope.filter.cityFilter.match(",")) {
        city = $scope.filter.cityFilter.split(",")[0];
      }
      else {
        city = $scope.filter.cityFilter;
      }
      if (city.match(" ")) { //si la ville a des espaces, on met en majuscule chacune des premières lettres
        var arrayCity = city.split(" ");
        city = "";
        for (var i = 0; i < arrayCity.length; i++) {
          arrayCity[i] = capitalizeFirstLetter(arrayCity[i]);
          city += arrayCity[i] + " ";
        }
        city = city.substring(0, city.length - 1);
      }
      else {
        city = capitalizeFirstLetter(city);
      } // on met en majuscule la première lettre
      return meal.address.town.match(city);
    }
    else {
      return meal;
    }
  };

  $scope.preferenceFilter = function(meal) {
    var count = 0;
    for (var value in $scope.filter.preferenceFilter) {
      if ($scope.filter.preferenceFilter[value] == true) {
        if (meal[value] == true) {
          return meal;
        }
      }
      else {
        count += 1;
      }
    }
    if (count == Object.keys($scope.filter.preferenceFilter).length) {
      return meal;
    }
  };

  $scope.helpingTypeFilter = function(meal) {
    var count = 0;
    for (var value in $scope.filter.helpingTypeFilter) {
      if ($scope.filter.helpingTypeFilter[value] == true) {
        if (meal.detailedInfo.requiredGuests[value] && meal.detailedInfo.requiredGuests[value]["nbRemainingPlaces"] > 0) {
          return meal;
        }
      }
      else {
        count += 1;
      }
    }
    if (count == Object.keys($scope.filter.helpingTypeFilter).length) {
      return meal;
    }
  };

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  //-------------- INITIALIZING --------------//

  $state.go("view_meals.mealsList");

  $scope.InitializeMealsMap = function() {
    var vm = this;
    NgMap.getMap("mealsMap").then(function(map) {
      vm.map = map;
    });

    $scope.openInfowindow = function(evt) { //ouvre l'infowindow associé à la carte google
      vm.map.showInfoWindow(this.id, this.id); //1er argument = infowindow ID, 2eme argument = marker ID. Pour simplifier, j'ai attribué l'ID du repas aux deux.
    };
  };

}])

.controller('filterMealModalCtrl', ['$scope', '$uibModalInstance', function($scope, $uibModalInstance) {
  $scope.cancel = function() {
    $uibModalInstance.close();
  };

  $scope.clearAndCloseFilterMobile = function() {
    for (var i = 0; i < $scope.filter.weekDays.length; i++) {
      $scope.filter.weekDays[i].selected = false;
    }
    $scope.filter.dateFilterMin.value = null;
    $scope.filter.dateFilterMax.value = null;
    $scope.filter.priceFilterMin.value = null;
    $scope.filter.priceFilterMax.value = null;
    $scope.filter.cityFilter = "";
    $scope.filter.preferenceFilter.veggies = false;
    $scope.filter.preferenceFilter.vegan = false;
    $scope.filter.preferenceFilter.halal = false;
    $scope.filter.preferenceFilter.kosher = false;
    $scope.filter.helpingTypeFilter.cooks = false;
    $scope.filter.helpingTypeFilter.cleaners = false;
    $scope.filter.helpingTypeFilter.simpleGuests = false;
    $uibModalInstance.close();
  };

}]));


/***/ }),

/***/ 92:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });


/* harmony default export */ __webpack_exports__["default"] = (angular.module('myApp.viewMealsDtld', [])

.controller('ViewMealsDtldCtrl', ['$scope', '$http', 'meal', '$uibModalInstance', '$state', 'isAuthenticated', '$auth', 'userServicesFactory', '$rootScope', 'ENV', 'ezfb', 'getSpecificUserFactory', function($scope, $http, meal, $uibModalInstance, $state, isAuthenticated, $auth, userServicesFactory, $rootScope, ENV, ezfb, getSpecificUserFactory) {

  $scope.meal = meal;

  $scope.meal.users.forEach(function(element) {
    getSpecificUserFactory(element._id).then(function successCallBack(response) {
      element["first_name"] = response.first_name;
      element["last_name"] = response.last_name;
      element["gender"] = response.gender;
      element["picture"] = response.picture;
      if ("birthdate" in response) {
        element["birthdate"] = response.birthdate;
      }
      if ("country_of_origin" in response) {
        element["country_of_origin"] = response.country_of_origin;
      }
      if ("reviews" in response) {
        element["reviews"] = response.reviews;
      }
    });
  });

  $scope.origin = ENV.fbRedirectURI + "#/view_meal";
  $scope.page_id = ENV.page_id;
  $scope.app_id = ENV.appId;
  $scope.user_ref = Math.floor((Math.random() * 10000000000000) + 1);

  if ($scope.$parent.$root.fromState.name != "") { // si on rafraichit la page alors le state d'avant est vide sinon, on relance le plugin
    $scope.$applyAsync(function() { // pour que le plugin prenne en compte correctement les paramètres alors il faut l'appeler après que le scope se soit mis en place
      ezfb.XFBML.parse(document.getElementById('fb-messenger_checkbox')); //XFBML.parse relance le plugin
    });
  }

  function confirmOptIn() {
    ezfb.AppEvents.logEvent('MessengerCheckboxUserConfirmation', null, {
      'app_id': ENV.appId,
      'page_id': ENV.page_id,
      'ref': $scope.$parent.$root.user._id,
      'user_ref': $scope.user_ref
    });
  }

  var setValue = function(variable) {
    if (typeof variable === 'undefined') {
      return undefined;
    }
    else {
      return variable.toString();
    }
  };

  if (check($scope.$parent.$root.user)) {
    var cellphoneStr = setValue($scope.$parent.$root.user.privateInfo.cellphone); //on initie le téléphone comme un string
  }

  function needToUpdateCellphone() { // if true --> need to patch, if false --> need to return error, if null subscribe to a meal
    if (check($scope.$parent.$root.user)) {
      if (check($scope.$parent.$root.user.privateInfo)) {
        if (check($scope.$parent.$root.user.privateInfo.cellphone) || $scope.$parent.$root.user.privateInfo.cellphone == '') {
          if ($scope.$parent.$root.user.privateInfo.cellphone != '') {
            if (cellphoneStr != '' && cellphoneStr != undefined) { // si quand on se connecte la première fois le téléphone n'est pas vide alors on n'a pas besoin de faire un patch
              return null;
            }
            else {
              return true; //si cellphoneStr (cellphone quand on se connecte) est vide ou undefined alors $scope.$parent.$root.user.privateInfo.cellphone 
              //qui correspond à la modif du cellphone par le user doit être patché
            }
          }
          else {
            return false;
          }
        }
        else {
          return false;
        }
      }
      else {
        return false;
      }
    }
    else {
      return false;
    }
  }

  $scope.cellphoneValidation = needToUpdateCellphone();

  function checkAvailablePlaces() {
    /*to check wether there is available space for each rôle*/
    if (!$scope.meal.detailedInfo.requiredGuests.cooks || $scope.meal.detailedInfo.requiredGuests.cooks.nbRemainingPlaces <= 0) {
      $scope.requiredGuests.availablePlaces['cooks'] = false;
    }
    else {
      $scope.requiredGuests.availablePlaces['cooks'] = true;
    }
    if (!$scope.meal.detailedInfo.requiredGuests.cleaners || $scope.meal.detailedInfo.requiredGuests.cleaners.nbRemainingPlaces <= 0) {
      $scope.requiredGuests.availablePlaces['cleaners'] = false;
    }
    else {
      $scope.requiredGuests.availablePlaces['cleaners'] = true;
    }
    if (!$scope.meal.detailedInfo.requiredGuests.simpleGuests || $scope.meal.detailedInfo.requiredGuests.simpleGuests.nbRemainingPlaces <= 0) {
      $scope.requiredGuests.availablePlaces['simpleGuests'] = false;
    }
    else {
      $scope.requiredGuests.availablePlaces['simpleGuests'] = true;
    }
    if (checkStatusAccepted()) {
      $scope.goToMeal = true;
    }
    else {
      $scope.goToMeal = false;
    }
  }


  function checkStatusAccepted() {
    if ($scope.datasUserForEachMeal($scope.meal)) {
      if ($scope.datasUserForEachMeal($scope.meal).status == "accepted") {
        return true;
      }
      else {
        return false;
      }
    }
    else {
      return false;
    }
  }

  function checkStatusPending() {
    if ($scope.datasUserForEachMeal($scope.meal)) {
      if ($scope.datasUserForEachMeal($scope.meal).status == "pending") {
        return true;
      }
      else {
        return false;
      }
    }
    else {
      return false;
    }
  }

  function check(value) {
    if (value != undefined) {
      return true;
    }
    else {
      return false;
    }
  }

  function subscribeMeal(meal_id, role) {
    $http.post('/api/meals/' + meal_id + '/subscription', {
      "requestRole": role
    }).then(function(response) {
      confirmOptIn();
      $scope.meal.nbRemainingPlaces -= 1;
      $scope.meal.detailedInfo.requiredGuests[$scope.requestRole.name + "s"].nbRemainingPlaces -= 1;
      if ($scope.meal.automaticSubscription == true) {
        $scope.goToMeal = true;
        $uibModalInstance.close({
          'manualSubscriptionPending': false
        });
        $state.go("view_my_dtld_meals", {
          "myMealId": meal_id,
          "successSubscribedMessage": true
        });
      }
      else if ($scope.meal.automaticSubscription == false) {
        $scope.goToMeal = false;
        $uibModalInstance.close({
          'manualSubscriptionPending': true
        });
        $state.go($scope.$state.current.name, {}, {reload:true});
      }
    }, function(response) {
      $scope.errorSubscribe.requestRole.status = true;
      if (RegExp(response.data = "requestRole")) {
        if (response.status == 400) {
          $scope.errorSubscribe.requestRole.message = response.data.message;
        }
        else {
          $scope.errorSubscribe.requestRole.message = "you have to select a role to participate";
        }
      }
      else {
        $scope.errorSubscribe.requestRole.message = response.data;
      }
    });
  }

  $scope.subscribeMealAuth = function(meal_id, role, provider) {
    if ($scope.checkMealDate() == true) {
      if (isAuthenticated) { // si l'user est authentifié
        if (check($scope.requestRole.name)) {
          if (needToUpdateCellphone() == true) {
            $http.patch('api/users/private/' + $scope.$parent.$root.user._id, {
              "privateInfo": {
                "cellphone": $scope.$parent.$root.user.privateInfo.cellphone
              }
            }, {
              headers: {
                "If-Match": $scope.$parent.$root.user._etag
              }
            }).then(function successCallBack(response) {
              $scope.user._etag = response.data._etag;
              subscribeMeal(meal_id, role);
            });
          }
          else if (needToUpdateCellphone() == false) {
            $scope.errorSubscribe.cellphone.status = true;
            $scope.errorSubscribe.cellphone.message = "Please fill your cellphone number to participate.";
            console.log("please fill your number");
          }
          else {
            subscribeMeal(meal_id, role);
          }
        }
        else {
          if (!check($scope.$parent.$root.user.privateInfo.cellphone)) {
            $scope.errorSubscribe.cellphone.status = true;
            $scope.errorSubscribe.cellphone.message = "Please fill your cellphone number to participate.";
            console.log("please fill your number");
          }
          if (!check($scope.requestRole.name)) {
            $scope.errorSubscribe.requestRole.status = true;
            $scope.errorSubscribe.requestRole.message = "You have to select a role to participate";
            console.log("please choose a role");
          }
        }
      }
      else { // si l'user n'est pas authentifié
        if (check($scope.requestRole.name)) { // on vérifie qu'il a bien demandé un rôle
          $auth.authenticate(provider) // connection via facebook
            .then(function(response) {
              console.debug("success", response);
              if ($auth.isAuthenticated()) {
                userServicesFactory().then(function(data) {
                  $rootScope.user = data;
                  $scope.isAuthenticated = true;
                  isAuthenticated = true;
                  $http.get('/api/meals/' + meal_id).then(function successCallBack(responseUser) { // on récupère les infos pour savoir si l'user est inscrit au repas
                    if (data._id == $scope.meal.admin._id || checkStatusAccepted()) { // s'il est l'hôte ou s'il inscrit on go sur le repas
                      $scope.goToMeal = true;
                      $uibModalInstance.close({
                        "manualSubscriptionPending": false
                      });
                      $state.go("view_my_dtld_meals", {
                        "myMealId": meal_id,
                        "successSubscribedMessage": true
                      });
                    }
                    if (checkStatusPending()) { //s'il est en attente sur le repas
                      $scope.goToMeal = false;
                      $uibModalInstance.close({
                        "manualSubscriptionPending": true
                      });
                    }
                    else { // s'il n'est ni l'hôte ni inscrit au repas
                      if (check($scope.$parent.$root.user.privateInfo.cellphone) == true) { // on check si son cellphone est déjà rentré dans notre BDD
                        subscribeMeal(meal_id, role); // si son tel est dans notre BDD, on l'inscrit au repas
                      }
                      else { // si son tel n'est pas dans notre BDD on lui demande de le remplir
                        $scope.errorSubscribe.cellphone.status = true;
                        $scope.errorSubscribe.cellphone.message = "Please fill your cellphone number to participate.";
                        console.log("please fill your number");

                      }
                    }
                  });
                });
              }
            })
            .catch(function(response) {
              console.debug("catch", response);
            });
        }
        else {
          if (!check($scope.requestRole.name)) {
            $scope.errorSubscribe.requestRole.status = true;
            $scope.errorSubscribe.requestRole.message = "You have to select a role to participate";
            console.log("please choose a role");
          }
        }
      }
    }
  };

  $scope.unsubscribe = function() {
    $http.post('/api/meals/' + $scope.meal._id + '/unsubscription').then(function(response) {
      //rajouter en fonction de la réponse un popup ?
    });
    $uibModalInstance.close({
      'manualSubscriptionPending': false
    });
    $state.go($scope.$state.current.name, {}, {reload:true});
  }; //function to validate the modal

  //Initialize variable
  $scope.isAuthenticated = isAuthenticated;
  $scope.requestRole = {};
  $scope.requiredGuests = {
    availablePlaces: {}
  };
  $scope.errorSubscribe = {
    requestRole: {
      "status": false
    },
    cellphone: {
      "status": false
    }
  };
  $scope.goToMeal = false;

  checkAvailablePlaces();
  $scope.accordionOneAtATime = true;

  $scope.closeAlert = function() {
    $scope.errorSubscribe.requestRole.status = false;
    $scope.errorSubscribe.cellphone.status = false;
  };

  $scope.cancel = function() {
    $uibModalInstance.dismiss('cancel');
  }; //funcion to dismiss the modal

  var now = new Date();

  $scope.checkMealDate = function() {
    return (Date.parse($scope.meal.time) >= now.getTime());
  };

}]));

/***/ }),

/***/ 93:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });


/* harmony default export */ __webpack_exports__["default"] = (angular.module('myApp.viewMyMeals', ['myApp.viewMyMealsDtld', 'ngSanitize'])

.controller('ViewMyMealsCtrl', ['$scope', 'response', '$uibModal', function($scope, response, $uibModal) {

  $scope.meals = response.data['_items'];
  var userId = $scope.user._id;

  for (var j = 0; j < $scope.meals.length; j++) {
    for (var i = 0; i < $scope.meals[j].users.length; i++) {
      if ($scope.meals[j].users[i]._id == userId) {
        var userRole = $scope.meals[j].users[i].role[0];
        if (userRole == "simpleGuest") {
          $scope.meals[j].mealPrice = $scope.meals[j].detailedInfo.requiredGuests.simpleGuests.price; //enfin, s'il n'y a pas d'aide, c'est le prix invité
        }
        if (userRole == "cook") {
          $scope.meals[j].mealPrice = $scope.meals[j].detailedInfo.requiredGuests.cooks.price; //sinon c'est soit le prix d'aide cuisine
        }
        if (userRole == "cleaner") {
          $scope.meals[j].mealPrice = $scope.meals[j].detailedInfo.requiredGuests.cleaners.price; //ou le prix aide vaisselle
        }
        if (userRole == "admin") {
          $scope.meals[j].mealPrice = $scope.meals[j].detailedInfo.requiredGuests.hosts.price; //ou le prix hôte
        }
      }
    }
  }


  var hoursToAdd = 7;
  var now = new Date();
  now.setHours(now.getHours() - hoursToAdd); // on rajoute 7h pour que les meals passe de incoming a previous

  $scope.futurMealsFilter = function(meal) {
    return (Date.parse(meal.time) >= now.getTime());
  };

  $scope.pastMealsFilter = function(meal) {
    return (Date.parse(meal.time) < now.getTime());
  };

  $scope.countPendingRequestsPerMeal = function(mealId) {
    var numberOfPendingRequests = 0;
    $scope.meals.forEach(function(meal) {
      if (meal._id == mealId) {
        meal.users.forEach(function(user) {
          if (user.status == "pending") {
            numberOfPendingRequests += 1;
          }
        });
      }
    });
    return numberOfPendingRequests;
  };

  $scope.countMealWithPendingRequest = function() {
    var numberOfMealWithPendingRequest = 0;
    var now = new Date;
    $scope.meals.forEach(function(meal) {
      var mealTime = new Date(meal.time);
      if (meal.admin._id == $scope.$parent.$root.user._id && now < mealTime) { //il faut que l'utilisateur soit bien l'admin du repas
        meal.users.forEach(function(user) {
          if (user.status == "pending") {
            numberOfMealWithPendingRequest += 1;
          }
        });
      }
    });
    return numberOfMealWithPendingRequest;
  };

  $scope.datasUserForEachMeal = function(meal) {
    if ($scope.$parent.$root.user) {
      for (var i = 0; i < meal.users.length; i++) {
        if (meal.users[i]._id == $scope.$parent.$root.user._id) {
          break;
        }
      }
      return meal.users[i];
    }
  };

}]));


/***/ }),

/***/ 94:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });


/* harmony default export */ __webpack_exports__["default"] = (angular.module('myApp.viewMyMealsDtld', ['ngMap'])

.controller('ViewMyMealsDtldCtrl', ['$scope', '$http', '$stateParams', '$uibModal', 'ENV', '$timeout', 'meal', 'NgMap', 'getMealReviewServiceFactory', 'userResolve', '$state', function($scope, $http, $stateParams, $uibModal, ENV, $timeout, meal, NgMap, getMealReviewServiceFactory, userResolve, $state) {

    $scope.meal = meal.data;

    function check_loading() {
        $scope.pendingRequest = false;
        if ("users" in $scope.meal) {
            for (var i = 0; i < $scope.meal.users.length; i++) {
                if ($scope.meal.users[i]._id == userResolve._id) {
                    if ($scope.meal.users[i].status == "pending") {
                        $state.go("view_meals");
                    }
                    else {
                        $scope.userRole = $scope.meal.users[i].role[0];
                    }
                }
                if ($scope.meal.users[i].status == "pending") { //fait apparaître l'encadré de validation lorsqu'un utilisateur est en attente de confirmation pour participer à un repas
                    $scope.pendingRequest = true;
                }
            }
        }
    }

    check_loading();
    $scope.data_href = ENV.fbRedirectURI + "#!/my_meals/" + $scope.meal._id;

    //modalDelete to delete a meal
    $scope.openModalDelete = function() {
        if ($scope.isOldMeal() != true) {
            $uibModal.open({
                animation: true,
                templateUrl: '/static/viewMyMeals/viewMyMealsDtld/modalviewMyMealsDtld/modalDeleteMyMealDtld.html',
                controller: 'modalDeleteInstanceCtrl',
                size: "sm",
                resolve: {
                    meal: function() {
                        return $scope.meal;
                    }
                }
            });
        }
    };

    //modalEdit to edit a meal
    $scope.openModalEdit = function() {
        if ($scope.isOldMeal() != true) {
            $uibModal.open({
                animation: true,
                templateUrl: 'static/viewMyMeals/viewMyMealsDtld/modalviewMyMealsDtld/modalEditMyMealDtld.html',
                controller: 'modalEditInstanceCtrl',
                size: "lg",
                resolve: {
                    editedMeal: function() {
                        return $scope.meal;
                    }
                }
            });
        }
    };

    //modalUnsubscribe to unsubscribe to a meal
    $scope.openModalUnsubscribe = function() {
        if ($scope.isOldMeal() != true) {
            $uibModal.open({
                animation: true,
                templateUrl: '/static/viewMyMeals/viewMyMealsDtld/modalviewMyMealsDtld/modalUnsubscribeMyMealDtld.html',
                controller: 'modalUnsubscribeInstanceCtrl',
                size: "sm",
                resolve: {
                    meal: function() {
                        return $scope.meal;
                    }
                }
            });
        }
    };

    //function pour faire apparaître un well de validation lorsqu'un utilisateur vient de s'inscrire
    function successfullySubscribed(variable) {
        $scope.successSubscribedMessage = variable || false;
        var delayToDisapear = 4000;
        if (!$scope.$parent.$root.user.birthdate && !$scope.$parent.$root.user.country_of_origin && !$scope.$parent.$root.user.presentation && !$scope.$parent.$root.user.spoken_languages) {
            delayToDisapear = 15000;
        }
        if ($scope.successSubscribedMessage == true) {
            $timeout(function() {
                $scope.successSubscribedMessage = false;
            }, delayToDisapear);
        }
    }
    successfullySubscribed($stateParams.successSubscribedMessage);

    $scope.validateSubscription = function(participant_id) {
        $http.post('/api/meals/' + $scope.meal._id + '/subscription/validate/' + participant_id, {
            'validation_result': true
        }).then(function() {
            if ($scope.$parent.$root.user.nbDifferentPendingRequest) {
                $scope.$parent.$root.user.nbDifferentPendingRequest -= 1;
            }
            var nbPendingRequest = 0;
            for (var i = 0; i < $scope.meal.users.length; i++) {
                if ($scope.meal.users[i]._id == participant_id) {
                    $scope.meal.users[i].status = "accepted";
                }
                else if ($scope.meal.users[i].status == "pending") {
                    nbPendingRequest += 1;
                }
            }
            if (nbPendingRequest == 0) {
                $scope.pendingRequest = false;
            }
        });
    };

    $scope.refuseSubscription = function(participant_id) {
        $http.post('/api/meals/' + $scope.meal._id + '/subscription/validate/' + participant_id, {
            'validation_result': false
        }).then(function() {
            var nbPendingRequest = 0;
            for (var i = 0; i < $scope.meal.users.length; i++) {
                if ($scope.meal.users[i]._id == participant_id) {
                    delete $scope.meal.users[i];
                }
                else if ($scope.meal.users[i].status == "pending") {
                    nbPendingRequest += 1;
                }
            }
            if (nbPendingRequest == 0) {
                $scope.pendingRequest = false;
            }
        });
    };

    $http.get("/api/meals/" + $scope.meal._id + "/calculateMealPrice").then(function(responsePrice) {
        $scope.meal.pricePaybackIfFull = $scope.meal.price - $scope.meal.detailedInfo.requiredGuests.hosts.price;
        $scope.meal.currentPricePayback = 0;
        if ("cooks" in $scope.meal.detailedInfo.requiredGuests) {
            if (responsePrice.data.cookPrice == "") {
                $scope.meal.detailedInfo.requiredGuests.cooks.price = undefined;
            }
            else {
                $scope.meal.currentPricePayback += responsePrice.data.cookPrice * ($scope.meal.detailedInfo.requiredGuests.cooks.nbRquCooks - $scope.meal.detailedInfo.requiredGuests.cooks.nbRemainingPlaces);
            }
        }
        if ("cleaners" in $scope.meal.detailedInfo.requiredGuests) {
            if (responsePrice.data.cleanerPrice == "") {
                $scope.meal.detailedInfo.requiredGuests.cleaners.price = undefined;
            }
            else {
                $scope.meal.currentPricePayback += responsePrice.data.cleanerPrice * ($scope.meal.detailedInfo.requiredGuests.cleaners.nbRquCleaners - $scope.meal.detailedInfo.requiredGuests.cleaners.nbRemainingPlaces);
            }
        }
        if ("simpleGuests" in $scope.meal.detailedInfo.requiredGuests) {
            if (responsePrice.data.simpleGuestPrice == "") {
                $scope.meal.detailedInfo.requiredGuests.simpleGuests.price = undefined;
            }
            else {
                $scope.meal.currentPricePayback += responsePrice.data.simpleGuestPrice * ($scope.meal.detailedInfo.requiredGuests.simpleGuests.nbRquSimpleGuests - $scope.meal.detailedInfo.requiredGuests.simpleGuests.nbRemainingPlaces);
            }
        }
        $scope.meal.currentPricePayback = Math.ceil($scope.meal.currentPricePayback * 100000) / 100000; //problème avec 11.2+5.6 = 16,79999999

    });

    
    var vm = this;
    //rajouter if user != admin
    NgMap.getMap("map").then(function(map) {
        vm.map = map;
    });

    $scope.isOldMeal = function() {
        var now = new Date;
        var hoursToAdd = 7;
        now.setHours(now.getHours() - hoursToAdd);
        var mealTime = new Date($scope.meal.time);
        return now >= mealTime;
    };

    $scope.dataForReview = [];
    getMealReviewServiceFactory($scope.meal._id, userResolve._id).then(function successCallBack(response) {
        if (response.length > 0) {
            $scope.dataForReview = response;
            for (var i = 0; i < $scope.dataForReview.length; i++) {
                $scope.dataForReview[i]['sent'] = true;
            }
        }
    });


    function checkIndexDataForReview(participantId) { //retourne l'index où on doit faire les modifications dans dataForReview
        var i = 0;
        if ($scope.dataForReview.length > 0) {
            for (i; i < $scope.dataForReview.length; i++) {
                if ($scope.dataForReview[i].forUser._id == participantId) {
                    break;
                }
            }
        }
        return i;
    }


    $scope.checkAlreadyReviewed = function(participantId) {
        var index = checkIndexDataForReview(participantId);
        if ($scope.dataForReview.length > 0) {
            if ($scope.dataForReview[index] != undefined) {
                if ($scope.dataForReview[index].sent == true) {
                    return true;
                }
                else {
                    return false;
                }
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    };

    $scope.getDataForReview = function(participantId, type) {
        var index = checkIndexDataForReview(participantId);
        if ($scope.dataForReview.length > 0) {
            if ($scope.dataForReview[index] != undefined) {
                if (type == "rating") {
                    if ($scope.dataForReview[index].forUser.rating != undefined) {
                        return $scope.dataForReview[index].forUser.rating;
                    }
                    else {
                        return null;
                    }
                }
                if (type == "comment") {
                    if ($scope.dataForReview[index].forUser.comment != undefined) {
                        return $scope.dataForReview[index].forUser.comment;
                    }
                    else {
                        return null;
                    }
                }
            }
            else {
                return null;
            }
        }
        else {
            return null;
        }
    };

    $scope.sendReview = function(participantId, role, type, value) {
        var index = checkIndexDataForReview(participantId);
        if (participantId != $scope.$parent.$root.user._id) {
            if (index == $scope.dataForReview.length) {
                $scope.dataForReview.push({
                    "forUser": {
                        "_id": participantId,
                        "role": role[0]
                    },
                    "mealAssociated": $scope.meal._id,
                    "fromUser": {
                        "_id": userResolve._id,
                        "role": $scope.userRole
                    },
                    "unique": participantId + userResolve._id + $scope.meal._id,
                    "sent": false
                });
            }
            $scope.dataForReview[index].forUser[type] = value;
            if (type == "comment") {
                if ($scope.dataForReview[index].forUser.rating == undefined) {
                    for (var i = 0; i < $scope.meal.users.length; i++) {
                        if ($scope.meal.users[i]._id == participantId) {
                            console.log("you need to grade " + $scope.meal.users[i].first_name);
                        }
                    }
                }
                else {
                    delete $scope.dataForReview[index].sent;
                    $http.post('/api/reviews', $scope.dataForReview[index]).then(function successCallBack(response) {
                        $scope.dataForReview[index]['sent'] = true; //on ajoute cet attribut pour modifier la vue HTML des références
                        if ($scope.$parent.$root.user.nbDifferentReviewsToLeave) {
                            $scope.$parent.$root.user.nbDifferentReviewsToLeave -= 1;
                        }
                    }, function errorCallback(response) {
                        $scope.dataForReview[index]['sent'] = false; //s'il y a une erreur dans le process alors les données ne se sont pas envoyées
                    });
                }
            }
        }
    };

}])

.controller('modalDeleteInstanceCtrl', function($scope, $http, $uibModalInstance, $state, meal) {

    $scope.delete = function() {
        var config = {
            headers: {
                "If-Match": meal._etag
            }
        };
        $http.delete('/api/meals/private/' + meal._id, config).then(function successCallBack(response) {
            $uibModalInstance.close();
            $state.go('view_meals', {
                reload: true,
                inherit: false,
                notify: false
            });
            //rajouter en fonction de la réponse un popup ?
        }, function errorCallBack(response) {
            console.log("We could not delete the meal");
        });

    }; //function to validate the modal

    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    }; //funcion to dismiss the modal

})

.controller('modalEditInstanceCtrl', function($scope, $http, $uibModalInstance, $state, editedMeal, $timeout, $parse, $filter) {
    $scope.editedMeal = editedMeal;
    $scope.addressComplement = $scope.editedMeal.privateInfo.address.complement;
    $scope.editedMeal.time = new Date($scope.editedMeal.time);

    if (editedMeal.detailedInfo.requiredGuests.cooks) {
        if (editedMeal.detailedInfo.requiredGuests.cooks.timeCooking) {
            $scope.editedMeal.detailedInfo.requiredGuests.cooks.timeCooking = new Date($scope.editedMeal.detailedInfo.requiredGuests.cooks.timeCooking);
        }
    }
    if (editedMeal.detailedInfo.requiredGuests.cleaners) {
        if (editedMeal.detailedInfo.requiredGuests.cleaners.timeCleaning) {
            $scope.editedMeal.detailedInfo.requiredGuests.cleaners.timeCleaning = new Date($scope.editedMeal.detailedInfo.requiredGuests.cleaners.timeCleaning);
        }
    }
    $scope.autocompleteAddress = $scope.editedMeal.privateInfo.address.name + ", " + $scope.editedMeal.address.town + ", " + $scope.editedMeal.address.country;
    $scope.editedMeal.timeForControl = new Date($scope.editedMeal.time);

    //required for the calendar toolbar (datamodel : editedMeal.time)

    $scope.dateOptions = {
        formatYear: 'yy',
        maxDate: new Date(2020, 5, 22),
        minDate: new Date(),
        startingDay: 1
    };

    function getCountry(country_code, jsonData) {
        for (var i = 0; i < jsonData.length; i++) {
            if (jsonData[i].code == country_code) {
                return jsonData[i].name;
            }
        }
    }

    $http.get("/static/sources/profile/countries.json").then(function(res) {
        $scope.countries = res.data;
    });

    function addAddressFromAutocomplete(dataToPerform) {
        var precision_needed_for_rounding_lat_lng = 100;
        if ($scope.details != undefined) {
            var dataToAdd = {"address": {}};
            if ("vicinity" in $scope.details) {
                dataToAdd.address.town = $scope.details.vicinity;
            }
            else {
                dataToAdd.address.town = $scope.autocompleteAddress.split(",")[0];
            }
            if (!dataToAdd.privateInfo) {
                dataToAdd["privateInfo"] = {};
            }
            if (!dataToAdd.privateInfo.address) {
                dataToAdd.privateInfo["address"] = {};
            }

            dataToAdd.privateInfo.address.name = $scope.details.name;
            dataToAdd.privateInfo.address.lat = $scope.details.geometry.location.lat();
            dataToAdd.privateInfo.address.lng = $scope.details.geometry.location.lng();
            dataToAdd.address.lat = Math.round($scope.details.geometry.location.lat() * precision_needed_for_rounding_lat_lng) / precision_needed_for_rounding_lat_lng;
            dataToAdd.address.lng = Math.round($scope.details.geometry.location.lng() * precision_needed_for_rounding_lat_lng) / precision_needed_for_rounding_lat_lng;
            for (var i = 0; i < $scope.details.address_components.length; i++) {
                if ($scope.details.address_components[i].types[0] == "postal_code") {
                    dataToAdd.address.postalCode = $scope.details.address_components[i].long_name;
                }
                if ($scope.details.address_components[i].types[0] == "country") {
                    dataToAdd.address.country = getCountry($scope.details.address_components[i].short_name, $scope.countries);
                }
            }
        }
        $parse("editedMeal.address").assign(dataToPerform, dataToAdd.address);
        $parse("editedMeal.privateInfo").assign(dataToPerform, dataToAdd.privateInfo);
        return dataToPerform;
    }

    function getDataToPerform() {
        var dataToPerform = {};
        $scope.editedMeal;
        $scope.editMealForm.$$controls.forEach(function(element) { //on effectue une boucle sur chacun des élements contenu dans le formulaire
            if (element.$viewValue != element.$$lastCommittedViewValue) { // on vérifie si l'élément à été modifié, dans ce cas, on le rajoute dans dataToPerform
                var parseFunction = $parse(element.$$attr.ngModel);
                if (element.$$attr.ngModel == "autocompleteAddress") {
                    dataToPerform = addAddressFromAutocomplete(dataToPerform);
                }
                else if (element.$$attr.ngModel == "editedMeal.time") {
                    var newDate = new Date(element.$modelValue);
                    if (element.$name == "formDate") {
                        var oldDate = new Date(element.$viewValue);
                        newDate.setDate(oldDate.getDate());
                        newDate.setMonth(oldDate.getMonth());
                        newDate.setFullYear(oldDate.getFullYear());
                    }
                    else {
                        newDate.setHours(element.$viewValue.split(":")[0]);
                        newDate.setMinutes(element.$viewValue.split(":")[1]);
                    }
                    parseFunction.assign(dataToPerform, newDate);
                }
                else if (element.$$attr.ngModel == "editedMeal.detailedInfo.requiredGuests.cooks.timeCooking" || element.$$attr.ngModel == "editedMeal.detailedInfo.requiredGuests.cleaners.timeCleaning") {
                    var newDate = new Date($scope.editedMeal.time);
                    newDate.setHours(element.$viewValue.split(":")[0]);
                    newDate.setMinutes(element.$viewValue.split(":")[1]);
                    parseFunction.assign(dataToPerform, newDate);
                }
                else {
                    parseFunction.assign(dataToPerform, element.$viewValue);
                }
            }
        });
        return dataToPerform;
    }


    $scope.clear = function() {
        $scope.editedMeal.time = null;
    };

    $scope.date_open = function() {
        $scope.date_popup.opened = true;
    };

    $scope.date_popup = {
        opened: false
    };

    //date formats for datepicker
    $scope.date_formats = ['EEEE dd MMMM yyyy', 'dd-MMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.date_format = $scope.date_formats[0];
    $scope.altInputDateFormats = ['M!/d!/yyyy'];

    //required for the calendar toolbar (datamodel : meal.time)

    $scope.ismeridian = false;
    $scope.mstep = 10;

    $scope.formPopoverTimepicker = {
        title: 'Time of the meal',
        templateUrl: 'static/viewCreateMeal/viewCreateMealModal/PopoverTimepickerTemplate.html',
    };

    //enable animations in the modal
    $scope.animationsEnabled = true;

    if ($scope.editedMeal.detailedInfo.requiredGuests.cooks) {
        $scope.nbCooksSubscribed = $scope.editedMeal.detailedInfo.requiredGuests.cooks.nbRquCooks - $scope.editedMeal.detailedInfo.requiredGuests.cooks.nbRemainingPlaces;
    }
    else {
        $scope.nbCooksSubscribed = 0;
    }
    if ($scope.editedMeal.detailedInfo.requiredGuests.cleaners) {
        $scope.nbCleanersSubscribed = $scope.editedMeal.detailedInfo.requiredGuests.cleaners.nbRquCleaners - $scope.editedMeal.detailedInfo.requiredGuests.cleaners.nbRemainingPlaces;
    }
    else {
        $scope.nbCleanersSubscribed = 0;
    }
    if ($scope.editedMeal.detailedInfo.requiredGuests.simpleGuests) {
        $scope.nbSimpleGuestsSubscribed = $scope.editedMeal.detailedInfo.requiredGuests.simpleGuests.nbRquSimpleGuests - $scope.editedMeal.detailedInfo.requiredGuests.simpleGuests.nbRemainingPlaces;
    }
    else {
        $scope.nbSimpleGuestsSubscribed = 0;
    }

    function checkTimeCooking(dataToPerform) {
        if (dataToPerform.editedMeal.detailedInfo && dataToPerform.editedMeal.detailedInfo.requiredGuests && dataToPerform.editedMeal.detailedInfo.requiredGuests.cooks) {
            if (dataToPerform.editedMeal.detailedInfo.requiredGuests.cooks.timeCooking && dataToPerform.editedMeal.time && dataToPerform.editedMeal.detailedInfo.requiredGuests.cooks.timeCooking <= dataToPerform.editedMeal.time || //on vérifie que l'heure d'arrivée d'aide cuisine est bien avant l'heure du repas
                dataToPerform.editedMeal.detailedInfo.requiredGuests.cooks.timeCooking && dataToPerform.editedMeal.detailedInfo.requiredGuests.cooks.timeCooking <= $scope.editedMeal.time ||
                !dataToPerform.editedMeal.detailedInfo.requiredGuests.cooks.timeCooking) {
                return true;
            }
            else {
                return false;
            }
        }
        else {
            return true;
        }
    }

    $scope.edit = function() {
        var dataToPerform = getDataToPerform();
        var nbRquCooks = Number(document.getElementById("inputCooks").value) || 0;
        var nbRquCleaners = Number(document.getElementById("inputCleaners").value) || 0;
        var nbRquSimpleGuests = Number(document.getElementById("inputSimpleGuests").value) || 0;
        if ($scope.nbCooksSubscribed <= nbRquCooks && $scope.nbCleanersSubscribed <= nbRquCleaners && $scope.nbSimpleGuestsSubscribed <= nbRquSimpleGuests) { //on vérifie que on ne diminue pas mal le nombre de places restantes là où des personnes se sont déjà inscrites
            if ((nbRquCooks > 0 && document.getElementById("inputTimeCooking").value != "") || nbRquCooks == 0) { //on vérifie qu'il y a bien une heure si on rajoute une aide cuisine
                if (checkTimeCooking(dataToPerform) == true) {
                    var config = {
                        headers: {
                            "If-Match": $scope.editedMeal._etag
                        }
                    };
                    $http.patch('/api/meals/private/' + $scope.editedMeal._id, dataToPerform.editedMeal, config).then(function successCallBack(response) {
                        $uibModalInstance.close();
                        $state.reload();
                        //rajouter en fonction de la réponse un popup ?
                    }, function errorCallBack(response) {
                        console.log(response);
                    });
                }
                else {
                    $scope.editMealForm.$commitViewValue();
                }
            }
            else {
                $scope.editMealForm.$commitViewValue();
            }
        }
        else {
            $scope.editMealForm.$commitViewValue();
        }
    };


    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    }; //funcion to dismiss the modal*/
})

.controller('modalUnsubscribeInstanceCtrl', function($scope, $http, $uibModalInstance, $state, meal) {

    $scope.unsubscribe = function() {
        $http.post('/api/meals/' + meal._id + '/unsubscription').then(function(response) {
            //rajouter en fonction de la réponse un popup ?
        });
        $uibModalInstance.close();
        $state.go('view_meals', {
            reload: true,
            notify: false
        });

    }; //function to validate the modal

    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    }; //funcion to dismiss the modal

})

.filter('ageFilter', function() {
    function calculateAge(birthday) { // birthday is a date
        var nowAge = new Date;
        var birthday_value = new Date(birthday);
        var ageDifMs = nowAge - birthday_value;
        var ageDate = new Date(ageDifMs); // miliseconds from epoch
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    }

    return function(birthdate) {
        return calculateAge(birthdate);
    };
}));

/***/ }),

/***/ 95:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });


/* harmony default export */ __webpack_exports__["default"] = (angular.module('myApp.viewLogin', [])

.controller('ViewLoginCtrl', ['$scope', function($scope) {
    if (!$scope.toState) {
        $scope.toState = {
            "name": "welcome"
        };
    }
}]));


/***/ }),

/***/ 96:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });


/* harmony default export */ __webpack_exports__["default"] = (angular.module('myApp.viewProfile', ['dateDropdownService'])

.controller('ViewProfileCtrl', ['$scope', '$http', 'userInfo', 'ENV', 'ezfb', '$timeout', 'getUserReviewServiceFactory', 'getSpecificUserFactory', '$state', '$uibModal', '$auth', function($scope, $http, userInfo, ENV, ezfb, $timeout, getUserReviewServiceFactory, getSpecificUserFactory, $state, $uibModal, $auth) {

  function setValue(variable) {
    if (typeof variable === 'undefined') {
      return undefined;
    }
    else {
      return variable.toString();
    }
  }

  function setValueScope(variable) {
    if (typeof variable === 'undefined') {
      return undefined;
    }
    if (variable == null) {
      return null;
    }
    else {
      return variable.toString();
    }
  }

  function getDataToPerform() {
    var actionProhibited = false;
    var origUser = {
      "privateInfo": {
        "keep": false,
        "preferences": {}
      }
    };
    if (cellphone != setValueScope($scope.user.privateInfo.cellphone)) {
      if ($scope.user.privateInfo.cellphone == "") {
        actionProhibited = true;
      }
      else {
        origUser.privateInfo.cellphone = $scope.user.privateInfo.cellphone;
        origUser.privateInfo.keep = true;
      }
    }
    if (email != setValueScope($scope.user.privateInfo.email)) {
      if ($scope.user.privateInfo.email == "") {
        actionProhibited = true;
      }
      else {
        origUser.privateInfo.email = $scope.user.privateInfo.email;
        origUser.privateInfo.keep = true;
      }
    }
    if (birthdate != setValueScope($scope.user.birthdate)) {
      origUser.birthdate = $scope.user.birthdate;
    }
    if (presentation != setValueScope($scope.user.presentation)) {
      origUser.presentation = $scope.user.presentation;
    }
    if (gender != setValueScope($scope.user.gender)) {
      origUser.gender = $scope.user.gender;
    }
    if (spoken_languages != setValueScope($scope.user.spoken_languages)) {
      origUser.spoken_languages = $scope.user.spoken_languages;
    }
    if ("country_of_origin" in $scope.user) {
      if (country_of_origin_name != setValueScope($scope.user.country_of_origin.name)) {
        origUser.country_of_origin = $scope.user.country_of_origin;
      }
    }
    if ("preferences" in $scope.user.privateInfo) {
      if ("city_notification" in $scope.user.privateInfo.preferences) {
        if (city_notification != setValueScope($scope.user.privateInfo.preferences.city_notification)) {
          origUser.privateInfo.preferences = {
            "city_notification": $scope.user.privateInfo.preferences.city_notification
          };
          origUser.privateInfo.keep = true;
          origUser.privateInfo.user_ref = $scope.user_ref;
          setDietaryPreferencesToTrue(); //si la liste des villes pour les notifications devient vide alors on définit comme faux les préférences végétariennes et veganes de l'user
        }
      }
      if ("preferences")
        if ("omnivorous_notification" in $scope.user.privateInfo.preferences) {
          if (omnivorous_notification != setValueScope($scope.user.privateInfo.preferences.omnivorous_notification)) {
            origUser.privateInfo.preferences["omnivorous_notification"] = $scope.user.privateInfo.preferences.omnivorous_notification;
            origUser.privateInfo.keep = true;
            origUser.privateInfo.user_ref = $scope.user_ref;
          }
        }
      if ("veggies_notification" in $scope.user.privateInfo.preferences) {
        if (veggies_notification != setValueScope($scope.user.privateInfo.preferences.veggies_notification)) {
          origUser.privateInfo.preferences["veggies_notification"] = $scope.user.privateInfo.preferences.veggies_notification;
          origUser.privateInfo.keep = true;
          origUser.privateInfo.user_ref = $scope.user_ref;
        }
      }
      if ("vegan_notification" in $scope.user.privateInfo.preferences) {
        if (vegan_notification != setValueScope($scope.user.privateInfo.preferences.vegan_notification)) {
          origUser.privateInfo.preferences["vegan_notification"] = $scope.user.privateInfo.preferences.vegan_notification;
          origUser.privateInfo.keep = true;
          origUser.privateInfo.user_ref = $scope.user_ref;
        }
      }
    }
    if (origUser.privateInfo.keep == false) { //permet de savoir s'il faut garder les privates info à upload ou non
      delete origUser.privateInfo;
    }
    else {
      delete origUser.privateInfo.keep;
    }
    if (angular.equals(origUser, {})) {
      if (actionProhibited == true) {
        return "this action is prohibited";
      }
      else {
        return null;
      }
    }
    if (actionProhibited == true) {
      return "this action is prohibited";
    }
    else {
      return origUser;
    }
  }

  function addPreferencesToUser() {
    if ($scope.user.privateInfo.preferences == undefined) {
      $scope.user.privateInfo.preferences = {};
    }
  }

  function checkIfCityIsNew(cityToAdd) {
    if ($scope.user.privateInfo.preferences.city_notification == undefined) {
      $scope.user.privateInfo.preferences.city_notification = [cityToAdd];
    }
    else {
      if ($scope.user.privateInfo.preferences.city_notification.includes(cityToAdd) == false) {
        $scope.user.privateInfo.preferences.city_notification.push(cityToAdd);
      }
    }
  }

  function checkIfSpokenLanguageIsNew(languageToAdd) {
    if ($scope.user.spoken_languages == undefined) {
      $scope.user.spoken_languages = [languageToAdd];
    }
    else {
      if ($scope.user.spoken_languages.includes(languageToAdd) == false) {
        $scope.user.spoken_languages.push(languageToAdd);
      }
    }
  }

  function setDietaryPreferencesToTrue() {
    if ($scope.user.privateInfo.preferences.city_notification.length == 0) {
      $scope.user.privateInfo.preferences.omnivorous_notification = true;
      $scope.user.privateInfo.preferences.veggies_notification = true;
      $scope.user.privateInfo.preferences.vegan_notification = true;
    }
  }

  if ($scope.$parent.user == undefined) { // si l'utilisateur n'est pas connecté
    $state.go('login');
  }
  else {
    if (userInfo.data._id == $scope.$parent.user._id) { // si l'utilisateur consulte son profil
      $scope.user = $scope.$parent.user;
      var cellphone = setValue($scope.user.privateInfo.cellphone);
      var email = setValue($scope.user.privateInfo.email);
      var city_notification = "";
      var omnivorous_notification = "";
      var veggies_notification = "";
      var vegan_notification = "";
      if ("preferences" in $scope.user.privateInfo) {
        if ("city_notification" in $scope.user.privateInfo.preferences) {
          city_notification = setValue($scope.user.privateInfo.preferences.city_notification);
        }
        if ("omnivorous_notification" in $scope.user.privateInfo.preferences) {
          omnivorous_notification = setValue($scope.user.privateInfo.preferences.omnivorous_notification);
        }
        if ("veggies_notification" in $scope.user.privateInfo.preferences) {
          veggies_notification = setValue($scope.user.privateInfo.preferences.veggies_notification);
        }
        if ("vegan_notification" in $scope.user.privateInfo.preferences) {
          vegan_notification = setValue($scope.user.privateInfo.preferences.vegan_notification);
        }
      }
      else { //si l'utilisateur actualise son profil et qu'il n'a pas de préférence alors par défaut il a des notifications sur tout les repas. Ca permet dans le back la reqûete sql en utilisant celery
        $scope.user.privateInfo.preferences = {
          "omnivorous_notification": true,
          "veggies_notification": true,
          "vegan_notification": true
        };
      }
    }
    else { //si l'utilisateur consulte le profil de quelqu'un d'autre
      $scope.user = userInfo.data;

      $http.get('api/meals?where={"users._id": "' + $scope.user._id + '"}').then(function(res) { // on récupère les meals de l'utilisateur dont on consulte le profil
        $scope.meals = res.data._items;
        for (var j = 0; j < $scope.meals.length; j++) {
          if ("cooks" in $scope.meals[j].detailedInfo.requiredGuests) {
            $scope.meals[j].mealPrice = $scope.meals[j].detailedInfo.requiredGuests.cooks.price; // si aide cuisine alors le prix du repas est le prix de l'aide cuisine
          }
          else if ("cleaners" in $scope.meals[j].detailedInfo.requiredGuests) {
            $scope.meals[j].mealPrice = $scope.meals[j].detailedInfo.requiredGuests.cleaners.price; // si pas aide cuisine et aide vaisselle alors le prix du repas est le prix de l'aide vaisselle
          }
          else if ("simpleGuests" in $scope.meals[j].detailedInfo.requiredGuests) {
            $scope.meals[j].mealPrice = $scope.meals[j].detailedInfo.requiredGuests.simpleGuests.price; //sinon c'est soit le prix d'aide cuisine s'il n'y a ni l'un ni l'autre
          }
          else {
            $scope.meals[j].mealPrice = $scope.meals[j].detailedInfo.requiredGuests.hosts.price; // si le repas n'a pas d'invités (par précaution), c'est le prix de l'hôte
          }
          $scope.meals[j].priceUnit = Math.ceil(10 * $scope.meals[j].price / $scope.meals[j].nbGuests) / 10; //sera utilisé pour viewMyMealDtld pour la phrase de variation de prix
        }
      });

      $state.go("profile.mealsList"); //on active le ui-view de meals-liste

      //on définit le prix du repas qui doit s'afficher

      $scope.openModalDtld = function(meal_id) { //permet d'ouvrir les modals de chacun de repas associés
        for (var i = 0; i < $scope.meals.length; i++) {
          if ($scope.meals[i]._id == meal_id) {
            if ($scope.meals[i].detailedInfo.subscribed == true) {
              $state.go("view_my_dtld_meals", {
                "myMealId": meal_id
              });
            }
            else {
              var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'static/viewMeals/viewMealsDtld/viewMealsDtld.html',
                controller: 'ViewMealsDtldCtrl',
                size: "lg",
                windowClass: 'modal-meal-window',
                resolve: {
                  meal: function() {
                    return $scope.meals[i];
                  },
                  isAuthenticated: function() {
                    return $auth.isAuthenticated();
                  }
                }
              });
              modalInstance.result.then(function(result) {
                var result_value = result;
                if (result_value == undefined) {
                  result_value = {
                    "manualSubscriptionPending": false,
                    "pending": false
                  };
                }
                $scope.manualSubscriptionPending = result_value.manualSubscriptionPending;
                for (var i = 0; i < $scope.meals.length; i++) {
                  if ($scope.meals[i]._id == meal_id) {
                    $scope.meals[i].detailedInfo.pending = result_value.pending;
                  }
                }
              });
            }
          }
        }
      };
    }
    $scope.user._created = new Date(parseInt($scope.user._id.substring(0, 8), 16) * 1000);
    $scope.user.reviews = $scope.user.reviews || {};
    $scope.user.reviews.positive = $scope.user.reviews.positive || 0;
    $scope.user.reviews.neutral = $scope.user.reviews.neutral || 0;
    $scope.user.reviews.negative = $scope.user.reviews.negative || 0;
    var birthdate = setValue($scope.user.birthdate);
    var presentation = setValue($scope.user.presentation);
    var gender = setValue($scope.user.gender);
    var spoken_languages = setValue($scope.user.spoken_languages);
    var country_of_origin_name = "";
    if ($scope.user.country_of_origin != undefined) {
      country_of_origin_name = setValue($scope.user.country_of_origin.name);
    }

    $scope.addCityNotificationPreference = function($event) {
      addPreferencesToUser();
      if (event.which === 13 && event.type == "keypress" || event.type == "click") {
        if ("details" in this) {
          if ("vicinity" in this.details) {
            checkIfCityIsNew(this.details.vicinity);
          }
          else if (this.autocomplete != undefined) { //si il n'existe pas vicinity, alors on récupère la première partie de l'adresse avant la première virgule
            if (this.autocomplete.includes(",")) {
              var cityArray = this.autocomplete.split(",");
              checkIfCityIsNew(cityArray[0]);
            }
          }
        }
      }
    };

    $scope.removeCityNotificationPreference = function() {
      var index = $scope.user.privateInfo.preferences.city_notification.indexOf(this.cities);
      if (index > -1) {
        $scope.user.privateInfo.preferences.city_notification.splice(index, 1);
      }
    };

    $scope.addSpokenLanguage = function($event) {
      if (event.which === 13 && event.type == "keypress" || event.type == "click") {
        checkIfSpokenLanguageIsNew(this.userSpokenLanguage.name);
        delete this.userSpokenLanguage;
      }
    };

    $scope.removeSpokenLanguage = function() {
      var index = $scope.user.spoken_languages.indexOf(this.spoken_language);
      if (index > -1) {
        $scope.user.spoken_languages.splice(index, 1);
      }
    };

    $scope.actualizeUser = function(user_id, _etag) {
      if ($scope.actualized != undefined) {
        delete $scope.actualized;
      }
      var dataToPerform = getDataToPerform();
      if (dataToPerform == "this action is prohibited") {
        console.log("email or cellphone are needed to participate");
        $scope.actualized = "error";
      }
      else {
        if (dataToPerform != null) { //check si dataToPerfom est vide
          var config = {
            headers: {
              'IF-Match': _etag
            }
          };
          $http.patch('api/users/private/' + user_id, dataToPerform, config).then(function successCallBack(response) {
            $scope.user._etag = response.data._etag;
            cellphone = setValue($scope.user.privateInfo.cellphone);
            email = setValue($scope.user.privateInfo.email);
            birthdate = setValue($scope.user.birthdate);
            presentation = setValue($scope.user.presentation);
            gender = setValue($scope.user.gender);
            spoken_languages = setValue($scope.user.spoken_languages);
            if ($scope.user.country_of_origin != undefined) {
              country_of_origin_name = setValue($scope.user.country_of_origin.name);
            }
            if ("preferences" in $scope.user.privateInfo) {
              if ("city_notification" in $scope.user.privateInfo.preferences) {
                city_notification = setValue($scope.user.privateInfo.preferences.city_notification);
              }
              if ("omnivorous_notification" in $scope.user.privateInfo.preferences) {
                omnivorous_notification = setValue($scope.user.privateInfo.preferences.omnivorous_notification);
              }
              if ("veggies_notification" in $scope.user.privateInfo.preferences) {
                veggies_notification = setValue($scope.user.privateInfo.preferences.veggies_notification);
              }
              if ("vegan_notification" in $scope.user.privateInfo.preferences) {
                vegan_notification = setValue($scope.user.privateInfo.preferences.vegan_notification);
              }
            }
            $scope.actualized = true;
          }, function errorCallback(response) {
            console.log("We couldn't delete a data that was here before. Please contact Dimitri");
            $scope.actualized = false;
          });
        }
      }
      $timeout(function() {
        $scope.actualized = null;
      }, 8000);
    };

    $http.get("/static/sources/profile/countries.json").then(function(res) {
      $scope.countries = res.data;
    });

    $http.get("/static/sources/profile/languages.json").then(function(res) {
      $scope.languages = res.data;
    });

    //$scope pour le plugin checkbox messenger
    $scope.origin = ENV.fbRedirectURI + "#/profile/" + userInfo.data._id;
    $scope.page_id = ENV.page_id;
    $scope.app_id = ENV.appId;
    $scope.user_ref = Math.floor((Math.random() * 10000000000000) + 1).toString();

    if ($scope.$parent.$parent.fromState.name != "") { // si on rafraichit la page alors le state d'avant est vide sinon, on relance le plugin
      $scope.$applyAsync(function() { // pour que le plugin prenne en compte correctement les paramètres alors il faut l'appeler après que le scope se soit mis en place
        ezfb.XFBML.parse(document.getElementById('fb-messenger-checkbox')); //XFBML.parse relance le plugin
      });
    }

    $scope.confirmOptIn = function() {
      ezfb.AppEvents.logEvent('MessengerCheckboxUserConfirmation', null, {
        'app_id': ENV.appId,
        'page_id': ENV.page_id,
        'ref': $scope.$parent.$root.user._id,
        'user_ref': $scope.user_ref
      });
    };

    $scope.reviews = [];
    getUserReviewServiceFactory($scope.user._id).then(function successCallBack(responseGetUserReviews) {
      if (responseGetUserReviews.length > 0) {
        $scope.reviews = responseGetUserReviews;
        $scope.reviews.forEach(function(element) {
          getSpecificUserFactory(element.fromUser._id).then(function successCallBack(responseGetSpecificUser) {
            element.fromUser.datas = responseGetSpecificUser;
          });
        });
      }
    });

    $scope.getDateFromObjectId = function(objectId) {
      return new Date(parseInt(objectId.substring(0, 8), 16) * 1000);
    };

  }

}])

.filter('ageFilter', ['getAgeServiceFactory', function(getAgeServiceFactory) {
  return function(birthdate) {
    return getAgeServiceFactory(birthdate);
  };
}]));

/***/ }),

/***/ 97:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });


/* harmony default export */ __webpack_exports__["default"] = (angular.module('myApp.viewLeaveReviews', [])

.controller('ViewLeaveReviewsCtrl', ['$scope', '$http', 'getSpecificUserFactory', '$timeout', function($scope, $http, getSpecificUserFactory, $timeout) {

    if ($scope.$parent.$root.user) {
        var uniqueList = [];
        var uniqueListForRequest = [];
        var now = new Date;
        $http.get('api/meals?where={"$and": [{"users._id": "' + $scope.$parent.$root.user._id + '"}, {"users": {"$not": {"$size": 1}}}]}').then(function(res) { // on récupère les meals de l'utilisateur dont on consulte le profile où il n'y a pas que lui d'inscrit
            res.data._items.forEach(function(element) {
                var mealDate = new Date(element.time);
                if (mealDate < now) { // on ne peut laisser une review qu'à un meal qui s'est passé
                    element.users.forEach(function(user) {
                        if (user._id != $scope.$parent.$root.user._id) { //on enlève les reviews pour moi même
                            var unique = user._id + $scope.$parent.$root.user._id + element._id;
                            var role = user.role[0];
                            uniqueList.push({
                                "unique": unique,
                                "role": role,
                                "mealTitle": element.menu.title
                            });
                            uniqueListForRequest.push('"' + (user._id + $scope.$parent.$root.user._id + element._id).toString() + '"');
                        }
                    });
                }
            });
            $http.get('api/reviews?where={"unique": {"$in":[' + uniqueListForRequest + ']}}').then(function successCallBack(response) {
                response.data._items.forEach(function(reviewsResponse) { // on effectue la soustraction de toutes les reviews que j'aurais pu laisser - celles que j'ai laissé
                    var index = uniqueList.map(function(o) {
                        return o.unique;
                    }).indexOf(reviewsResponse.unique);
                    if (index != -1) {
                        uniqueList.splice(index, 1);
                    }
                });
                initializeReviews(uniqueList.reverse());
            });
        });

        $scope.checkAlreadyReviewed = function(unique) {
            var index = checkIndexDataForReview(unique);
            if ($scope.dataForReview.length > 0) {
                if ($scope.dataForReview[index] != undefined) {
                    if ($scope.dataForReview[index].sent == true) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                else {
                    return false;
                }
            }
            else {
                return false;
            }
        };

        $scope.getDataForReview = function(unique, type) {
            var index = checkIndexDataForReview(unique);
            if ($scope.dataForReview.length > 0) {
                if ($scope.dataForReview[index] != undefined) {
                    if (type == "rating") {
                        if ($scope.dataForReview[index].forUser.rating != undefined) {
                            return $scope.dataForReview[index].forUser.rating;
                        }
                        else {
                            return null;
                        }
                    }
                    if (type == "comment") {
                        if ($scope.dataForReview[index].forUser.comment != undefined) {
                            return $scope.dataForReview[index].forUser.comment;
                        }
                        else {
                            return null;
                        }
                    }
                }
                else {
                    return null;
                }
            }
            else {
                return null;
            }
        };

        $scope.sendReview = function(unique, role, type, value) {
            var index = checkIndexDataForReview(unique);
            $scope.dataForReview[index].forUser[type] = value;
            if (type == "comment") {
                $scope.actualized = true;
                $timeout(function() {
                    $scope.actualized = null;
                }, 8000);
                if ($scope.dataForReview[index].forUser.rating == undefined) {
                    console.log("you need to grade " + $scope.dataForReview[index].forUser.datas.first_name);
                }
                else {
                    delete $scope.dataForReview[index].sent;
                    delete $scope.dataForReview[index].mealTitle;
                    delete $scope.dataForReview[index].forUser.datas;
                    $http.post('/api/reviews', $scope.dataForReview[index]).then(function successCallBack(response) {
                        $scope.dataForReview.splice(index, 1);
                        if ($scope.$parent.$root.user.nbDifferentReviewsToLeave) {
                            $scope.$parent.$root.user.nbDifferentReviewsToLeave -= 1;
                        }
                    }, function errorCallback(response) {
                        $scope.dataForReview[index]['sent'] = false; //s'il y a une erreur dans le process alors les données ne se sont pas envoyées
                    });
                }
            }
        };
    }

    function initializeReviews(uniqueList) {
        $scope.dataForReview = [];
        var listUser = [];
        uniqueList.forEach(function(element) {
            listUser.push('"' + element.unique.substring(0, 24) + '"');
        });
        $http.get('/api/users?where={"_id": {"$in": [' + listUser + ']}}').then(function successCallback(result) {
            var users = result.data['_items'];
            uniqueList.forEach(function(element) {
                var index = users.map(function(o) {
                    return o._id;
                }).indexOf(element.unique.substring(0, 24));
                var review = {
                    "forUser": {
                        "_id": element.unique.substring(0, 24),
                        "role": element.role,
                        "datas": users[index]
                    },
                    "fromUser": {
                        "_id": element.unique.substring(24, 48),
                        "role": "admin"
                    },
                    "unique": element.unique,
                    "mealAssociated": element.unique.substring(48, 72),
                    "mealTitle": element.mealTitle,
                    "sent": false
                };
                $scope.dataForReview.push(review);
            });
        });
        $scope.actualized = false;
    }

    function checkIndexDataForReview(unique) { //retourne l'index où on doit faire les modifications dans dataForReview
        var i = 0;
        if ($scope.dataForReview.length > 0) {
            for (i; i < $scope.dataForReview.length; i++) {
                if ($scope.dataForReview[i].unique == unique) {
                    break;
                }
            }
        }
        return i;
    }

}]));

/***/ }),

/***/ 98:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });


/* harmony default export */ __webpack_exports__["default"] = (angular.module('myApp.viewManageRequests', [])

.controller('ViewManageRequestsCtrl', ['$scope', '$http', 'getSpecificUserFactory', function($scope, $http, getSpecificUserFactory) {
    if ($scope.$parent.$root.user) {
        $scope.nbDifferentPendingRequest = 0;
        $http.get('api/meals?where={"$and": [{"admin": "' + $scope.$parent.$root.user._id + '"}, {"users.status": "pending"} ]}').then(function(res) { // on récupère les meals de l'utilisateur dont on consulte le profil
            $scope.meals = res.data._items;
            $scope.meals.forEach(function(meal) {
                meal.users.forEach(function(user) {
                    if (user.status == "pending") {
                        $scope.nbDifferentPendingRequest += 1;
                        getSpecificUserFactory(user._id).then(function successCallBack(userInfo) {
                            var listUserInfo = Object.keys(userInfo);
                            listUserInfo.forEach(function(key) {
                                user[key] = userInfo[key];
                            });
                        });
                    }
                });
            });
        });
    }

    $scope.validateSubscription = function() {
        var users = this.$parent.$parent.meal.users;
        var mealIndex = this.$parent.$parent.$index;
        $http.post('/api/meals/' + this.$parent.$parent.meal._id + '/subscription/validate/' + this.$parent.participant._id, {
            'validation_result': true
        }).then(function() {
            if ($scope.$parent.$root.user.nbDifferentPendingRequest) {
                $scope.$parent.$root.user.nbDifferentPendingRequest -= 1;
            }
            var nbPendingRequest = 0;
            users.forEach(function(user) {
                if (user.status == "pending") {
                    nbPendingRequest += 1;
                }
            });
            nbPendingRequest -= 1; //on retire la pending request de l'utilisateur qu'on supprime 
            if (nbPendingRequest == 0) {
                $scope.meals.splice(mealIndex, 1);
            }
        });
    };

    $scope.refuseSubscription = function() {
        var users = this.$parent.$parent.meal.users;
        var mealIndex = this.$parent.$parent.$index;
        var participantIndex = this.$parent.$index;
        $http.post('/api/meals/' + this.$parent.$parent.meal._id + '/subscription/validate/' + this.$parent.participant._id, {
            'validation_result': false
        }).then(function() {
            var nbPendingRequest = 0;
            users.forEach(function(user) {
                if (user.status == "pending") {
                    nbPendingRequest += 1;
                }
            });
            nbPendingRequest -= 1; //on retire la pending request de l'utilisateur qu'on supprime 
            if (nbPendingRequest == 0) {
                $scope.meals.splice(mealIndex, 1);
            }
            else {
                $scope.meals[mealIndex].users.splice(participantIndex, 1);
            }
        });
    };

}]));

/***/ }),

/***/ 99:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });


/* harmony default export */ __webpack_exports__["default"] = (angular.module('getAgeService', [])

.factory('getAgeServiceFactory', function() {

    function calculateAge(birthday) { // birthday is a date
        var now = new Date;
        var birthday_value = new Date(birthday);
        var ageDifMs = now - birthday_value;
        var ageDate = new Date(ageDifMs); // miliseconds from epoch
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    }

    return function(birthdate) {
        return calculateAge(birthdate);
    };


}));

/***/ })

},[78]);