webpackJsonp([1],Array(62).concat([
/* 62 */
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
/* 63 */
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
/* 64 */
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
/* 65 */,
/* 66 */,
/* 67 */,
/* 68 */,
/* 69 */,
/* 70 */,
/* 71 */,
/* 72 */,
/* 73 */,
/* 74 */,
/* 75 */,
/* 76 */,
/* 77 */,
/* 78 */
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
require('./bower_components/angular-ui-router/release/angular-ui-router.min.js');*/
/*require('./bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js');*/
__webpack_require__(105);
__webpack_require__(106);
__webpack_require__(107);
__webpack_require__(108);
__webpack_require__(109);
__webpack_require__(110);
__webpack_require__(111);
__webpack_require__(112);
__webpack_require__(113);


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

var translationsEN = {
  "INDEX": {
    "ACTION_BUTTON": {
      "SIGN_IN_1": "@: VIEW_MEALS.ACTION_BUTTON.SIGN_IN_2",
      "SIGN_IN_2": 'with facebook',
    },
    "HELLO": 'Hi',
    "MY_MEALS": 'My meals',
    "PROFILE": 'My profile ',
    "MANAGE_REQUESTS": 'Manage requests',
    "LEAVE_REVIEWS": 'Leave reviews',
    "LOGOUT": 'Logout',
    "CREATE_A_MEAL": 'Create a meal',
    "BROWSE_A_MEAL": 'Browse a meal',
    "SLOGAN_1": 'And the last time you ate with someone new ?',
    "SLOGAN_2": 'When was the last time you met someone new ?',
    "FOOTER": {
      "INFORMATION": {
        "TITLE": 'Information',
        "CONCEPT": 'Concept',
        "TEAM_HISTORY": 'Team & History',
        "FAQ": 'FAQ'
      },
      "SUPPORT": {
        "TITLE": 'Support',
        "GUIDELINES": 'Guidelines',
        "GENERAL_POLICIES": 'General Policies',
        "PRIVACY_POLICY": 'Privacy Policy',
        "TERMS_OF_USE": 'Terms of use'
      },
      "MORE": {
        "TITLE": 'More',
        "PHOTO_GALLERY": 'Photo gallery',
        "CAREERS_FEEDBACKS": 'Careers & Feedbacks',
        "CONTACT_US": 'Contact us'
      },
      "LANGUAGE": {
        "TITLE": 'Language'
      },
      "SHARE": 'Share myCommuneaty on'
    }
  },
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
    "START_NOW":{
      "TITLE": 'Start now',
      "CREATE_A_MEAL": "@: INDEX.CREATE_A_MEAL",
      "BROWSE_A_MEAL": "@: INDEX.BROWSE_A_MEAL"
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
      "TOTAL": 'Total',
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
    "TITLE": 'Incoming meals',
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
    "PARTICIPANTS": {
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
      "PARAGRAPH": 'Do you want to receive notifications through messenger about new meals?',
      "PARAGRAPH_1": "@:CREATE_A_MEAL.FORM.NOTIFICATIONS.MESSENGER_2",
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
  },
  "LOGIN": {
    "PARAGRAPH": 'You need to sign in to keep going',
    "SIGN_IN": "@: VIEW_MEALS_DTLD.ACTION_BUTTON.SUBSCRIBE_NOT_CONNECTED_1"
  },
  "VIEW_MY_MEALS": {
    "INCOMING_MEALS": "@: VIEW_MEALS.TITLE",
    "PREVIOUS_MEALS": 'Previous meals',
    "VEGETARIAN_MEAL": "@: VIEW_MEALS.VEGETARIAN_MEAL",
    "VEGAN_MEAL": "@: VIEW_MEALS.VEGAN_MEAL",
    "HALAL_MEAL": "@: VIEW_MEALS.HALAL_MEAL",
    "KOSHER_MEAL": "@: VIEW_MEALS.KOSHER_MEAL",
    "PENDING_REQUEST": 'Pending request',
    "PENDING_REQUESTS": 'Pending requests',
    "PRICE_FROM": "@: VIEW_MEALS.FILTERS.PRICE.PLACEHOLDER_FROM",
    "STATUS": {
      "PENDING": "@: VIEW_MEALS.PENDING",
      "ATTENDING": "@: VIEW_MEALS.ATTENDING",
      "ATTENDED": "@: VIEW_MEALS.ATTENDED",
      "HOSTING": "@: VIEW_MEALS.HOSTING",
      "HOSTED": "@: VIEW_MEALS.HOSTED",
    },
    "NO_INCOMING_MEALS_1": 'You do not have incoming meals but you can',
    "NO_INCOMING_MEALS_2": "@: WELCOME.CREATE_A_MEAL",
    "NO_INCOMING_MEALS_3": 'or',
    "NO_INCOMING_MEALS_4": "@: WELCOME.BROWSE_A_MEAL",
    "NO_PARTICIPATION_YET": 'You didn\'t participate yet.'
  },
  "VIEW_MY_MEALS_DTLD": {
    "MESSAGE": {
      "WELL_DONE": 'Well done!',
      "SUBSCRIBED": 'You successfully subscribed to the meal.',
      "PUBLISHED": 'You successfully published your meal.',
      "INCOMPLETE_PROFILE_1": 'We advise you to',
      "INCOMPLETE_PROFILE_2": 'complete your',
      "INCOMPLETE_PROFILE_3": 'profile',
      "INCOMPLETE_PROFILE_4": 'in order to make your meal more friendly.',
    },
    "PENDING_REQUEST": {
      "TITLE": 'You have a pending request',
      "REQUESTED_ROLE": 'Requested role:',
      "HELP_COOKING": "@:WELCOME.DIFFERENT_ROLES.HELP_COOKING.NAME",
      "HELP_CLEANING": "@:WELCOME.DIFFERENT_ROLES.HELP_CLEANING.NAME",
      "SIMPLE_GUEST": "@:WELCOME.DIFFERENT_ROLES.SIMPLE_GUEST.NAME",
      "ACTION_BUTTON": {
        "ACCEPT": 'Accept',
        "REFUSE": 'Refuse',
      },
      "SEE_REVIEWS": 'see reviews'
    },
    "ACTION_BUTTON": {
      "DELETE": 'Delete',
      "EDIT": 'Edit',
      "UNSUBSCRIBE": 'Unsubscribe'
    },
    "MEAL_INFORMATIONS": {
      "TITLE": "Important information",
      "INVITE_FRIENDS": 'Invite friends',
      "INSCRIBED_AS": 'Inscribed as:',
      "TOTAL_GROCERIES": 'Total price of the groceries:',
      "TOTAL_PAYBACK": 'Total participants payback',
      "PRICE_MEAL_FULL": 'If the meal is full:',
      "PRICE_CURRENT": 'Currentyl:',
      "PRICE_MEAL": 'Price of your meal:',
      "PRICE_LEFT_TO_PAY": 'left to pay to {{meal_admin_first_name}} {{meal_admin_last_name}}',
      "SUBSCRIPTION_RECAPITULATORY": 'Subscription recapitulatory:',
      "VEGETARIAN_MEAL": "@: VIEW_MEALS.VEGETARIAN_MEAL",
      "VEGAN_MEAL": "@: VIEW_MEALS.VEGAN_MEAL",
      "HALAL_MEAL": "@: VIEW_MEALS.HALAL_MEAL",
      "KOSHER_MEAL": "@: VIEW_MEALS.KOSHER_MEAL",
      "HELP_COOKING": "@: VIEW_MEALS_DTLD.PARTICIPANTS.HELP_COOKING",
      "HELP_CLEANING": "@: VIEW_MEALS_DTLD.PARTICIPANTS.HELP_CLEANING",
      "SIMPLE_GUEST": "@: VIEW_MEALS_DTLD.PARTICIPANTS.SIMPLE_GUEST",
    },
    "PARTICIPANTS": {
      "TITLE": "@: CREATE_A_MEAL.FORM.PARTICIPANTS",
      "HOST": "@: VIEW_MEALS_DTLD.PARTICIPANTS.HOST",
      "LEAVE_REVIEWS": {
        "TITLE": 'How was your experience with {{participant_first_name}}?',
        "POSITIVE": 'Positive',
        "NEUTRAL": 'Neutral',
        "NEGATIVE": 'Negative',
        "PLACEHOLDER": 'Leave a review to {{first_name}}',
        "GRADE_FIRST": 'Grade {{first_name}} first',
        "SEND": 'send'
      },
      "PER_PERS": 'per pers',
      "REMAINING_PLACES": 'Remaining places: {{nb_remaining_places}}',
      "PENDING_REQUEST": "@: VIEW_MY_MEALS.PENDING_REQUEST"
    },
    "BACK_TO_MY_MEALS": 'Back to my meals',
    "MODAL": {
      "ACTION_BUTTON": {
        "NO": 'No',
        "YES": 'Yes'
      },
      "DELETE": {
        "TITLE": 'Cancel the meal',
        "PARAGRAPH": 'Are you sure that you want to cancel the event?',
      },
      "UNSUBSCRIBE": {
        "TITLE": 'Unsubscribe from the meal',
        "PARAGRAPH": 'Are you sure you want to unsubscribe from the meal?',
      },
      "EDIT": {
        "ERROR_COOKING_TIME": 'The arrival time for the helping cooks can not be after the beggining of the meal',
        "ACTION_BUTTON": {
          "CANCEL": 'Cancel',
          "EDIT": 'Edit'
        }
      }
    }
  },
  "VIEW_LEAVE_REVIEWS": {
    "LOADING": 'Loading, please wait...',
    "NO_REVIEWS": 'You do not have reviews to leave',
    "TITLE_1": 'How was your experience with',
    "TITLE_2": 'those {{dataForReview_length}} persons',
    "REVIEW_SENT": 'Your review was sent'
  },
  "VIEW_MANAGE_REQUESTS": {
    "LOADING": "@: VIEW_LEAVE_REVIEWS.LOADING",
    "NO_PENDING_REQUESTS": 'You do not have pending request',
    "TITLE_1": 'You have {{nbDifferentPendingRequest}} pending request',
    "TITLE_2": 'You have {{nbDifferentPendingRequest}} pending requests',
    "TITLE_3": 'for {{meals_length}} different meals',
  },
  "FOOTER": {
    "CONCEPT": {
      "TITLE": 'Do you want to eat homemade food and meet new people?',
      "PARAGRAPH_1": 'myCommuneaty is here for you! It is a social network that connects lovers of good cooking and friendliness so that they organize meals easily.',
      "PARAGRAPH_2": 'The idea is to share the meal together, but also the tasks and budget.',
      "DIFFERENT_ROLES": {
        "TITLE": "@: WELCOME.DIFFERENT_ROLES.TITLE",
        "HOST": {
          "NAME": "@: WELCOME.DIFFERENT_ROLES.HOST.NAME",
          "DESCRIPTION": 'The Host is the person who publishes the meal. He chooses the menu, the number of participants, the help needed, the date and the place (could be at home or outside). He will do the groceries and prepare the meal with his helpers guests.'
        },
        "HELP_COOKING": {
          "NAME": "@: WELCOME.DIFFERENT_ROLES.HELP_COOKING.NAME",
          "DESCRIPTION": 'The Help cooking are helpers guests. They will arrive earlier in order to help the host to cook. The time of their arrival is specified by the host in the meal description.'
        },
        "HELP_CLEANING": {
          "NAME": "@: WELCOME.DIFFERENT_ROLES.HELP_CLEANING.NAME",
          "DESCRIPTION": 'The Help cleaning are helpers guests. They will help the host to clean the dishes and order. The time of their arrival is specified by the host in the meal description.'
        },
        "SIMPLE_GUEST": {
          "NAME": "@: WELCOME.DIFFERENT_ROLES.SIMPLE_GUEST.NAME",
          "DESCRIPTION": 'The Simple guests won’t help the host but they will pay a little bit more. This surplus will be redistributed between the host and the helpers, according to the calculations below. This extra role is particularly useful when a host wants to organize a meal with quite a lot of participants but do not need so many helpers, or in the case that someone wants to come to a meal and is not very fond of cooking or cleaning.'
        }
      },
      "GROCERIES_PRICE": {
        "TITLE": 'The price of the groceries is determined by the host. We encourage him to be the more accurate possible. This price is then shared between all the participants according to their role.',
        "WITHOUT_SIMPLE_GUEST": {
          "TITLE": 'Without simple guests',
          "DESCRIPTION": 'Everybody helps so everybody pays the same. So, the price of the groceries is simply divided by the number of participants.'
        },
        "WITH_SIMPLE_GUEST": {
          "TITLE": 'With simple guests',
          "DESCRIPTION": 'Each of the simple guests pay 25% more and the surplus generated is redistributed at 50% to the host and at 50% to the others helpers. If there are more than 4 simple guests, then the host won’t pay and the additional surplus will be shared equitably between the helpers, reducing again the final price of their meal.'
        },
        "CONCLUSION_1": 'At the end of the meal, each guest has to pay directly to the host who bought the groceries.',
        "CONCLUSION_2": 'There are no website fees. Our service is completely free.',
      }
    },
    "TEAM_HISTORY": {
      "MAYLIS_DESCRIPTION": '"Hi ! I am Maylis from France. I love meeting people from all over the world. That\'s why I am already in different social websites and so happy to be involved in myCommuneaty. I write the website contents and promote the concept."',
      "DIMITRI_DESCRIPTION": '"Hey there ! I love to eat and meet new people. I studied engineering and I am still learning about programming. When you click on a button, I probably programmed it, so if something goes wrong, let me know."',
      "PARAGRAPH_1": 'Everything started with Dimitri’s desire for realizing an entrepreneurship related with food. This desire became an idea and then a project thanks to Maylis and Kevin.',
      "PARAGRAPH_2": 'In October 2015, in Chile, we started the project named at this time SharEat. 40 collaborative meals were realized using Facebook and Google Apps as platforms. After a while, we decided to start creating a website. As the domain name SharEat was already used, we changed it for the current name myCommuneaty.',
      "PARAGRAPH_3": 'In January 2017, unfortunately, Kevin had to leave the project to focus in his new professional career.',
      "PARAGRAPH_4": 'In April 2017, we were happy to present the first website version. We keep working hard on this project and would be happy to receive your feedbacks, comments or ideas. So, please feel free to contact and join us !'
    },
    "GENERAL_POLICIES": {
      "TITLE": 'General policies',
      "PARAGRAPH_1_1": 'The following policies are in place to ensure that myCommuneaty remains a fun and safe place for everyone.',
      "PARAGRAPH_1_NOTE": 'Note: the policies below are enforced under Terms of Use sections 4.1 and 4.2 and provided for further insight. Review the myCommuneaty',
      "PARAGRAPH_1_TERMS_OF_USE": "@: INDEX.FOOTER.SUPPORT.TERMS_OF_USE",
      "PARAGRAPH_1_2": 'in its entirety for complete details. Please also see our',
      "PARAGRAPH_1_PRIVACY_POLICY": "@: INDEX.FOOTER.SUPPORT.PRIVACY_POLICY",
      "PARAGRAPH_1_3": 'Violations of these policies may result in a range of actions including, but not limited to:',
      "PARAGRAPH_1_LIST": {
        "BULLET_1": 'Removal of violating content',
        "BULLET_2": 'Warning',
        "BULLET_3": 'Removal of access to elements of the site or features',
        "BULLET_4": 'Temporary or permanent Profile deactivation'
      },
      "CONDUCT_POLICY": {
        "TITLE": 'Conduct policy',
        "BULLET_1_1": 'Don’t spam',
        "BULLET_1_2": 'We value human interaction and want the content on our site and sent to our members to be personalized and valuable. Copying and pasting the same message across the site, in member-to-member messages, Groups, Local discussions or Event listings is not permitted. Messaging many members that have not shown an intent to receive the type of message your sending may also be considered spam.',
        "BULLET_2_1": 'Don’t look for a date',
        "BULLET_2_2": 'Our members join myCommuneaty to create friendships. Don’t contact other members for dating, or use the site to find sexual partners. We take reports of unwanted sexual advances, both online and offline, seriously and they may be considered violations of our Conduct policy. Respect others’ boundaries. If another member lets you know they are uncomfortable, respect their feelings and take a step back.',
        "BULLET_3_1": 'Don’t intimidate, stalk, or harass',
        "BULLET_3_2": 'Stalking, intimidation, threats, and harassment of other members is prohibited. Harassment is defined as a pattern of offensive behavior that appears to have the purpose of adversely affecting a targeted person or persons. Examples of harassment include making threats, repeated unwanted contacts with a person, and posting the personal information of another person. myCommuneaty reserves the right to take action (see above) on profiles we believe may pose a threat to community.',
        "BULLET_4_1": 'Do create only one profile',
        "BULLET_4_2": 'Duplicate, fake, and joke profiles are not allowed. The first profile that you create must be you and is the only one that you may have. Our trust network needs everyone to stand by their reputation.',
        "BULLET_5_1": 'Be yourself',
        "BULLET_5_2": 'Misrepresenting yourself as someone else is prohibited. This includes representation as an agent, representative, or affiliate of myCommuneaty.',
        "BULLET_6_1": 'Keep it legal',
        "BULLET_6_2": 'Don’t engage in nor encourage illegal activity; don’t violate any applicable law or regulation.',
        "BULLET_7_1": 'Do use myCommuneaty properly',
        "BULLET_7_2": 'Using myCommuneaty in a way that could interfere with other members from fully enjoying the site or that could impair the functioning of the site is prohibited. This includes behavior that causes excessive reports, flags, or blocks from other members. We may prohibit proactive outreach on communications that are flagged by myCommuneaty members or that we believe harm the experience for other members. Additionally, posting anything to the site that includes viruses, corrupted data, or other potentially harmful code. Attempting to circumvent myCommuneaty systems, or using these systems in a manner which undermines their intent, is prohibited.',
        "BULLET_8_1": 'Don’t force your beliefs and lifestyle choices on others',
        "BULLET_8_2": 'myCommuneaty is proud of the diversity of its members. Using our platform to recruit other members to join your lifestyle or belief system may be a violation of our Conduct policy. Don’t make the adoption of your lifestyle or belief system a condition of your meal offer. While certain house rules are expected, if we believe that the conditions imposed on the members introduce risk, harms the experience of our members, or damages the reputation of myCommuneaty, we reserve the right to prohibit the requirement.'
      },
      "CONTENT_POLICY": {
        "TITLE": 'Content policy',
        "SUBTITLE": 'Content that we believe, in our sole discretion, falls into any of the following categories is prohibited:',
        "BULLET_1_1": 'Hate speech and offensive language',
        "BULLET_1_2": 'Hate speech, particularly speech that disparages any ethnic, racial, sexual or religious group by stereotypical depiction or is otherwise abusive or inflammatory, including content that contains offensive language or images',
        "BULLET_2_1": 'Sexually explicit content',
        "BULLET_2_2": 'Contains nudity, sexually explicit content or is otherwise obscene, sexually exploitive of minors, pornographic, indecent, lewd, or suggestive',

        "BULLET_3_1": 'Personally identifiable information',
        "BULLET_3_2": 'Contains private or personal information about another person, such as phone number or address',
        "BULLET_4_1": 'Illegal and infringing',
        "BULLET_4_2": 'Unlawful content or content for which myCommuneaty has received a court order to remove, or content that infringes on the rights of a third party, including intellectual property, privacy, publicity or contractual rights',
        "BULLET_5_1": 'Glamorizing violence',
        "BULLET_5_2": 'Incites violence or characterizes violence as acceptable, glamorous or desirable',
        "BULLET_6_1": 'Commercial or promotional',
        "BULLET_6_2": 'Contains unsolicited promotions, political campaigning, advertising or solicitations - including content used to promote a business or product - without our prior written consent'
      },
      "REFERENCE_POLICY": {
        "TITLE": 'Reference policy',
        "PARAGRAPH": 'The referencing system allows members to share information about their interactions with other members, enabling the community to make more informed decisions. References should be accurate and relevant to the experience with the recipient. Any activities that undermine the integrity of the reference system are a violation of myCommuneaty’s Policies and Terms of Use. myCommuneaty does not generally interfere with reference content left by members. In extremely rare circumstances, myCommuneaty may censor, temporarily hide, or remove reference content if it violates our Reference Guidelines.'
      },
      "REPORTING_VIOLATIONS": {
        "TITLE": 'Reporting violations of myCommuneaty policies',
        "PARAGRAPH": 'If you feel another person is violating this policy, please',
        "CONTACT_US": "contact us"
      }
    },
    "GUIDELINES": {
      "TITLE": 'Guidelines',
      "GENERAL_POLICIES": "@: INDEX.FOOTER.SUPPORT.GENERAL_POLICIES",
      "PRIVACY_POLICY": "@: INDEX.FOOTER.SUPPORT.PRIVACY_POLICY",
      "TERMS_OF_USE": "@: INDEX.FOOTER.SUPPORT.TERMS_OF_USE",
      "CONTACT_US": "@: FOOTER.GENERAL_POLICIES.REPORTING_VIOLATIONS.CONTACT_US",
      "AND": 'and',
      "OR": 'or',
      "BULLET_1_1": 'Be considerate and respectful',
      "BULLET_1_2": 'is a core myCommuneaty principle that requires people to treat other people in the myCommuneaty community with civility, respect and consideration – both online and offline. Respect opposing or differing opinions and beliefs. Try to listen to and understand others with whom you may disagree. Encourage others in the community to also be welcoming and respectful. Following these simple guidelines will help make this community a better place for us all.',
      "BULLET_2_1": 'Respect others',
      "BULLET_2_2": 'myCommuneaty is a meeting place for people of different cultures, lifestyles and ideals. By joining our community, you promise to communicate with respect and consideration, even if you encounter someone you disagree with.',
      "BULLET_3_1": 'Work together to resolve disputes',
      "BULLET_3_2": 'myCommuneaty members are always encouraged to work through their member disputes and problems together with the other members. Working together with others and appreciating different viewpoints are important aspects of the myCommuneaty experience.',
      "BULLET_4_1": 'Don’t attack members or their content',
      "BULLET_4_2": 'Personal attacks are not allowed on myCommuneaty, nor are disrespectful or insulting attacks directed at other people and their contributions to the community. See myCommuneaty',
      "BULLET_4_3": 'for more information.',
      "BULLET_5_1": 'Use good judgment and be empathetic',
      "BULLET_5_2": 'When interacting with others on myCommuneaty, try to see the world from their perspective. People contribute to the myCommuneaty community in their own way. Disputes between members can occur when differing cultural norms create a misunderstanding, as many things are acceptable in some cultures and unacceptable in others.',
      "BULLET_6_1": 'Member interactions',
      "BULLET_6_2": 'It is okay to disagree. In fact, alternative points of view are a key part of cultural exchange as long as your comments are civil, respectful and polite. Remember to give the impression of assuming goodwill on the part of the person with whom you are disagreeing.',
      "BULLET_7_1": 'Retaliation is not okay',
      "BULLET_7_2": 'It is never okay to violate myCommuneaty',
      "BULLET_7_3": 'even in response to another person who has done so.',
      "BULLET_8_1": 'Safety is a cornerstone of the myCommuneaty community',
      "BULLET_8_2": 'Member safety is very important to myCommuneaty and the health of the community.',
      "BULLET_9_1": 'Report violations',
      "BULLET_9_2": 'If you feel another person is violating myCommuneaty',
      "BULLET_9_3": 'please'
    },
    "CAREERS_FEEDBACKS": {
      "TITLE": 'Careers & Feedbacks',
      "PARAGRAPH_1": 'We are looking for volunteers who could widespread the concept of myCommuneaty or help for the development of our platform (angularJs, html & css, flask/python) and for its design.',
      "PARAGRAPH_2": 'In addition, we are always happy to receive constructive feedbacks, comments or ideas. So, please feel free to contact us by',
    },
    "CONTACT_US": {
      "TITLE": "@: FOOTER.GENERAL_POLICIES.REPORTING_VIOLATIONS.CONTACT_US",
      "EMAIL": 'By email',
      "FACEBOOK": 'On facebook'
    },
    "PRIVACY_POLICY": {
      "TITLE": "@: INDEX.FOOTER.SUPPORT.PRIVACY_POLICY",
      "LAST_UPDATE": 'Last updated : 30th of May, 2017',
      "PARAGRAPH": 'Please read our Privacy Policy carefully to get a clear understanding of how we collect, use, disclose, protect and otherwise handle information about you. By using myCommuneaty services, you consent to the collection and use of your data as described in this Privacy Policy.',
      "SUBTITLE_1": {
        "NAME": 'This Privacy Policy describes:',
        "BULLET_1": 'the information we, myCommuneaty, collect about you,',
        "BULLET_2": 'how we use and share that information,',
        "BULLET_3": 'the privacy choices we offer.',
        "PARAGRAPH": 'This Privacy Policy applies to information we collect when you use our website, mobile application and other online products and services (collectively, the “Services”), or when you otherwise interact with us. From time to time, we may change the provisions of this Privacy Policy; when we do, we will notify you, including by revising the date at the top of this Privacy Policy. We encourage you to review the Privacy Policy whenever you use our Services or otherwise interact with us to stay informed about our information practices and the ways you can help protect your privacy.'
      },
      "SUBTITLE_2": {
        "NAME": 'What information do we collect when you use our services?',
        "PARAGRAPH_1": {
          "TITLE": 'Information users provide to us',
          "PARAGRAPH": 'We collect information you provide to us, such as when you create an account, update your profile, use the interactive features of our Services, participate in contests, promotions or surveys, request customer support or otherwise communicate with us. The types of information we may collect include:',
          "BULLET_1": 'Basic user information, such as your name, gender, birth date, email address, mailing address, phone number and photographs;',
          "BULLET_2": 'Messages and interactive forum information, such as discussion meal posts, messages to other myCommuneaty users and information you provide in connection with activities and events;',
          "BULLET_3": 'Other background, contact and demographic information, such as your personal URL, IM username, meal sharing history and other interests and self-descriptions you choose to provide;',
          "BULLET_4": 'Information about you from other myCommuneaty users, such as trust ratings, public references, and other interconnections and interactions between you and other myCommuneaty users.',
        },
        "PARAGRAPH_2": {
          "TITLE": 'Information we collect automatically',
          "PARAGRAPH": 'When you access or use our Services, we may also automatically collect information about you, including:',
          "BULLET_1": 'Location Information: We may collect information about your location each time you access our website, or otherwise consent to the collection of this information. For more information, please see “Your Information Choices” below.',
          "BULLET_2": 'Log Information: We collect log information about how you access or use our Services, including your access times, browser type and language, Internet Service Provider and Internet Protocol (“IP”) address.',
          "BULLET_3": 'Information Collected by Cookies and other Tracking Technologies: We may automatically collect information using cookies, web beacons (also known as “tracking gifs,” “pixel tags” and “tracking pixels”) and other tracking technologies to, among other things, improve our Services and your experience, monitor user activity, count visits, understand usage and campaign effectiveness, and tell if an email has been opened and acted upon. For information about removing or rejecting cookies, please see “Your Information Choices” below.',
        },
        "PARAGRAPH_3": {
          "TITLE": 'Information we collect from other sources',
          "PARAGRAPH_3_1": 'We may also obtain information from other sources and combine that with information we collect through our Services. For example, if you create or log into your myCommuneaty account through a third-party social networking site, we will have access to certain information from that site, such as your name, profile picture, connections and other account information in accordance with the authorization procedures determined by such third-party social networking site.',
          "PARAGRAPH_3_2": 'Some of this information may be shared with other users, for example they may be able to see your connections who are also myCommuneaty users. Please see “Your Information Choices” below for more information about how to manage your sharing preferences.'
        },
        "PARAGRAPH_4": {
          "TITLE": 'How do we use this information?',
          "PARAGRAPH": 'We use information about you for purposes described in this Privacy Policy or otherwise disclosed to you on or in connection with our Services. For example, we may use information about you to:',
          "BULLET_1": 'Operate and improve our Services;',
          "BULLET_2": 'Protect the safety of myCommuneaty users',
          "BULLET_3": 'Send you technical notices, updates, security alerts and support and administrative messages;',
          "BULLET_4": 'Respond to your comments, questions and requests and provide customer service;',
          "BULLET_5": 'Communicate with you about products, services, offers, promotions, rewards and events and provide other news and information about myCommuneaty and other third parties;',
          "BULLET_6": 'Monitor and analyze trends, usage and activities in connection with our Services;',
          "BULLET_7": 'Personalize the Services, which may include providing content or features that match user informations;',
          "BULLET_8": 'Process and deliver contest entries and rewards; and',
          "BULLET_9": 'Link or combine with other information we get from third parties to help understand your needs and provide you with better service.',
        },
        "PARAGRAPH_5": {
          "TITLE": 'Transfers of your personal information abroad',
          "PARAGRAPH": 'myCommuneaty may store and process personal information in France and other countries, where under local laws you may have fewer legal rights. However, wherever we store your information we will treat it in accordance with this Privacy Policy.'
        },
        "PARAGRAPH_6": {
          "TITLE": 'Sharing of information',
          "PARAGRAPH_1": 'We will not share information about you with outside parties except as described below or elsewhere in this Privacy Policy:',
          "BULLET_1": 'With your consent, including if we notify you through our Services that the information you provide will be shared in a particular manner and you subsequently agree to provide such information;',
          "BULLET_2": 'With others who access or use our Services in accordance with the privacy settings you establish (please see “Your Information Choices” below for more information about how to manage your sharing preferences);',
          "BULLET_3": 'With search engines in order to index the content you provide as part of a discussion forum or public profile;',
          "BULLET_4": 'With partners who run contests, special offers or other events or activities in connection with our Services;',
          "BULLET_5": 'In connection with, or during negotiations of, any merger, sale of company assets, financing or acquisition of all or a portion of our business to another company;',
          "BULLET_6": 'If we believe that disclosure is reasonably necessary to comply with any applicable law, regulation, legal process or governmental request, including to meet national security or law enforcement requirements; and',
          "BULLET_7": 'To enforce our agreements, policies and Terms of Use to protect the security or integrity of our Services; or to protect myCommuneaty, our users or the public from harm or illegal activities.',
          "PARAGRAPH_2": 'We may also share aggregated or de-identified information, which cannot reasonably be used to identify you.',
          "PARAGRAPH_3": 'myCommuneaty is responsible and liable if third-party agents that it uses to process the personal data on its behalf do so in a manner inconsistent with the Privacy Shield Principles, unless myCommuneaty proves that it is not responsible for the event that allowed the damage to occur.',
        },
        "PARAGRAPH_7": {
          "TITLE": 'Social Media Tools',
          "PARAGRAPH_1": 'myCommuneaty may offer social sharing features or other integrated tools which let you share actions you take on our Services with other media, and vice versa. The use of such features enables the sharing of certain information with your friends or the public, depending on the settings you establish with the third party that provides the social sharing feature. For more information about the purpose and scope of data collection and processing in connection with social sharing features, please visit the privacy policies of the third parties that provide these social sharing features. myCommuneaty may also allow you to access Google Maps. Please note that when you use Google Maps, you are subject to',
          "PARAGRAPH_2": 'as amended by Google from time to time.',
          "LINK_TEXT": 'Google’s privacy policy'
        },
        "PARAGRAPH_8": {
          "TITLE": 'Third Party Links',
          "PARAGRAPH": 'Occasionally, at our discretion, we may include or offer third party products or services as part of our Services. These third parties may have separate and independent privacy policies. We therefore have no responsibility or liability for the activities of these third parties and how they collect, use or share information about you. Nonetheless, we seek to protect the integrity of our Services and welcome any feedback about these third parties.'
        },
        "PARAGRAPH_9": {
          "TITLE": 'Advertising and analytics services provided by others',
          "PARAGRAPH": 'We may allow third parties to serve advertisements on our behalf across the Internet and to provide analytics services in relation to the use of our Services. These entities may use cookies, web beacons and other technologies to collect information about your use of the Services and other websites, including your IP address and information about your web browser and operating system, pages viewed, time spent on pages, links clicked and conversion information. This information may be used by myCommuneaty and others to, among other things, analyze and track data, determine the popularity of certain content, deliver advertising and content targeted to your interests on our Services and other websites and better understand your online activity. Please note that we may share aggregated, non-personal information, or personal information in a hashed, non-human readable form, with these third parties. For example, we may engage a third party data provider who may collect web log data from you or place or recognize a unique cookie on your browser to enable you to receive customized ads or content. These cookies may reflect de-identified demographic or other data linked to information you voluntarily provide to us (e.g., an email address) in a hashed, non-human readable form. For more information about interest-based ads, or to opt out of having your web browsing information used for behavioral advertising purposes, please visit',
        }
      },
      "SUBTITLE_3": {
        "TITLE": 'Your Information Choices',
        "PARAGRAPH_1": {
          "TITLE": 'Account information',
          "PARAGRAPH": 'You may update or correct information about you or deactivate your account at any time by logging into your account and editing your profile. myCommuneaty will not provide members access to account data that is not already available to a logged in member. Even after you deactivate your account, we may retain certain information as required by law, for legitimate business purposes or to protect member safety. If your account is deactivated, myCommuneaty will provide access to the data associated with the deactivated account upon receipt of the required legal documentation.'
        },
        "PARAGRAPH_2": {
          "TITLE": 'Cookies',
          "PARAGRAPH_1": 'Most web browsers are set to accept cookies by default. However, you can choose to set your browser to remove or reject browser cookies. Each browser is a little different, so look at your browser\'s help menu to learn the correct way to modify your cookies, or visit',
          "PARAGRAPH_2": 'Please note, however, that our Services may not function properly if your browser does not accept cookies.'
        },
        "PARAGRAPH_3": {
          "TITLE": 'Promotional communications',
          "PARAGRAPH": 'You may opt out of receiving promotional communications from myCommuneaty by following the instructions in those emails or by adjusting the appropriate settings in your profile. If you opt out, we may still send you transactional or relationship messages, such as emails about your account.'
        },
        "PARAGRAPH_4": {
          "TITLE": "@: INDEX.FOOTER.MORE.CONTACT_US",
          "PARAGRAPH": 'If you have any questions about this Privacy Policy, please',
          "CONTACT_US": "@: FOOTER.GENERAL_POLICIES.REPORTING_VIOLATIONS.CONTACT_US"
        }
      }
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


/***/ }),
/* 79 */,
/* 80 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(81);

/***/ }),
/* 81 */
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
/* 82 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(62)(undefined);
// imports


// module
exports.push([module.i, ".fa {\n  display: inline-block;\n  font: normal normal normal 14px/1 FontAwesome;\n  font-size: inherit;\n  text-rendering: auto;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n}\n/* Font Awesome uses the Unicode Private Use Area (PUA) to ensure screen\n   readers do not read off random characters that represent icons */\n.fa-glass:before {\n  content: \"\\F000\";\n}\n.fa-music:before {\n  content: \"\\F001\";\n}\n.fa-search:before {\n  content: \"\\F002\";\n}\n.fa-envelope-o:before {\n  content: \"\\F003\";\n}\n.fa-heart:before {\n  content: \"\\F004\";\n}\n.fa-star:before {\n  content: \"\\F005\";\n}\n.fa-star-o:before {\n  content: \"\\F006\";\n}\n.fa-user:before {\n  content: \"\\F007\";\n}\n.fa-film:before {\n  content: \"\\F008\";\n}\n.fa-th-large:before {\n  content: \"\\F009\";\n}\n.fa-th:before {\n  content: \"\\F00A\";\n}\n.fa-th-list:before {\n  content: \"\\F00B\";\n}\n.fa-check:before {\n  content: \"\\F00C\";\n}\n.fa-remove:before,\n.fa-close:before,\n.fa-times:before {\n  content: \"\\F00D\";\n}\n.fa-search-plus:before {\n  content: \"\\F00E\";\n}\n.fa-search-minus:before {\n  content: \"\\F010\";\n}\n.fa-power-off:before {\n  content: \"\\F011\";\n}\n.fa-signal:before {\n  content: \"\\F012\";\n}\n.fa-gear:before,\n.fa-cog:before {\n  content: \"\\F013\";\n}\n.fa-trash-o:before {\n  content: \"\\F014\";\n}\n.fa-home:before {\n  content: \"\\F015\";\n}\n.fa-file-o:before {\n  content: \"\\F016\";\n}\n.fa-clock-o:before {\n  content: \"\\F017\";\n}\n.fa-road:before {\n  content: \"\\F018\";\n}\n.fa-download:before {\n  content: \"\\F019\";\n}\n.fa-arrow-circle-o-down:before {\n  content: \"\\F01A\";\n}\n.fa-arrow-circle-o-up:before {\n  content: \"\\F01B\";\n}\n.fa-inbox:before {\n  content: \"\\F01C\";\n}\n.fa-play-circle-o:before {\n  content: \"\\F01D\";\n}\n.fa-rotate-right:before,\n.fa-repeat:before {\n  content: \"\\F01E\";\n}\n.fa-refresh:before {\n  content: \"\\F021\";\n}\n.fa-list-alt:before {\n  content: \"\\F022\";\n}\n.fa-lock:before {\n  content: \"\\F023\";\n}\n.fa-flag:before {\n  content: \"\\F024\";\n}\n.fa-headphones:before {\n  content: \"\\F025\";\n}\n.fa-volume-off:before {\n  content: \"\\F026\";\n}\n.fa-volume-down:before {\n  content: \"\\F027\";\n}\n.fa-volume-up:before {\n  content: \"\\F028\";\n}\n.fa-qrcode:before {\n  content: \"\\F029\";\n}\n.fa-barcode:before {\n  content: \"\\F02A\";\n}\n.fa-tag:before {\n  content: \"\\F02B\";\n}\n.fa-tags:before {\n  content: \"\\F02C\";\n}\n.fa-book:before {\n  content: \"\\F02D\";\n}\n.fa-bookmark:before {\n  content: \"\\F02E\";\n}\n.fa-print:before {\n  content: \"\\F02F\";\n}\n.fa-camera:before {\n  content: \"\\F030\";\n}\n.fa-font:before {\n  content: \"\\F031\";\n}\n.fa-bold:before {\n  content: \"\\F032\";\n}\n.fa-italic:before {\n  content: \"\\F033\";\n}\n.fa-text-height:before {\n  content: \"\\F034\";\n}\n.fa-text-width:before {\n  content: \"\\F035\";\n}\n.fa-align-left:before {\n  content: \"\\F036\";\n}\n.fa-align-center:before {\n  content: \"\\F037\";\n}\n.fa-align-right:before {\n  content: \"\\F038\";\n}\n.fa-align-justify:before {\n  content: \"\\F039\";\n}\n.fa-list:before {\n  content: \"\\F03A\";\n}\n.fa-dedent:before,\n.fa-outdent:before {\n  content: \"\\F03B\";\n}\n.fa-indent:before {\n  content: \"\\F03C\";\n}\n.fa-video-camera:before {\n  content: \"\\F03D\";\n}\n.fa-photo:before,\n.fa-image:before,\n.fa-picture-o:before {\n  content: \"\\F03E\";\n}\n.fa-pencil:before {\n  content: \"\\F040\";\n}\n.fa-map-marker:before {\n  content: \"\\F041\";\n}\n.fa-adjust:before {\n  content: \"\\F042\";\n}\n.fa-tint:before {\n  content: \"\\F043\";\n}\n.fa-edit:before,\n.fa-pencil-square-o:before {\n  content: \"\\F044\";\n}\n.fa-share-square-o:before {\n  content: \"\\F045\";\n}\n.fa-check-square-o:before {\n  content: \"\\F046\";\n}\n.fa-arrows:before {\n  content: \"\\F047\";\n}\n.fa-step-backward:before {\n  content: \"\\F048\";\n}\n.fa-fast-backward:before {\n  content: \"\\F049\";\n}\n.fa-backward:before {\n  content: \"\\F04A\";\n}\n.fa-play:before {\n  content: \"\\F04B\";\n}\n.fa-pause:before {\n  content: \"\\F04C\";\n}\n.fa-stop:before {\n  content: \"\\F04D\";\n}\n.fa-forward:before {\n  content: \"\\F04E\";\n}\n.fa-fast-forward:before {\n  content: \"\\F050\";\n}\n.fa-step-forward:before {\n  content: \"\\F051\";\n}\n.fa-eject:before {\n  content: \"\\F052\";\n}\n.fa-chevron-left:before {\n  content: \"\\F053\";\n}\n.fa-chevron-right:before {\n  content: \"\\F054\";\n}\n.fa-plus-circle:before {\n  content: \"\\F055\";\n}\n.fa-minus-circle:before {\n  content: \"\\F056\";\n}\n.fa-times-circle:before {\n  content: \"\\F057\";\n}\n.fa-check-circle:before {\n  content: \"\\F058\";\n}\n.fa-question-circle:before {\n  content: \"\\F059\";\n}\n.fa-info-circle:before {\n  content: \"\\F05A\";\n}\n.fa-crosshairs:before {\n  content: \"\\F05B\";\n}\n.fa-times-circle-o:before {\n  content: \"\\F05C\";\n}\n.fa-check-circle-o:before {\n  content: \"\\F05D\";\n}\n.fa-ban:before {\n  content: \"\\F05E\";\n}\n.fa-arrow-left:before {\n  content: \"\\F060\";\n}\n.fa-arrow-right:before {\n  content: \"\\F061\";\n}\n.fa-arrow-up:before {\n  content: \"\\F062\";\n}\n.fa-arrow-down:before {\n  content: \"\\F063\";\n}\n.fa-mail-forward:before,\n.fa-share:before {\n  content: \"\\F064\";\n}\n.fa-expand:before {\n  content: \"\\F065\";\n}\n.fa-compress:before {\n  content: \"\\F066\";\n}\n.fa-plus:before {\n  content: \"\\F067\";\n}\n.fa-minus:before {\n  content: \"\\F068\";\n}\n.fa-asterisk:before {\n  content: \"\\F069\";\n}\n.fa-exclamation-circle:before {\n  content: \"\\F06A\";\n}\n.fa-gift:before {\n  content: \"\\F06B\";\n}\n.fa-leaf:before {\n  content: \"\\F06C\";\n}\n.fa-fire:before {\n  content: \"\\F06D\";\n}\n.fa-eye:before {\n  content: \"\\F06E\";\n}\n.fa-eye-slash:before {\n  content: \"\\F070\";\n}\n.fa-warning:before,\n.fa-exclamation-triangle:before {\n  content: \"\\F071\";\n}\n.fa-plane:before {\n  content: \"\\F072\";\n}\n.fa-calendar:before {\n  content: \"\\F073\";\n}\n.fa-random:before {\n  content: \"\\F074\";\n}\n.fa-comment:before {\n  content: \"\\F075\";\n}\n.fa-magnet:before {\n  content: \"\\F076\";\n}\n.fa-chevron-up:before {\n  content: \"\\F077\";\n}\n.fa-chevron-down:before {\n  content: \"\\F078\";\n}\n.fa-retweet:before {\n  content: \"\\F079\";\n}\n.fa-shopping-cart:before {\n  content: \"\\F07A\";\n}\n.fa-folder:before {\n  content: \"\\F07B\";\n}\n.fa-folder-open:before {\n  content: \"\\F07C\";\n}\n.fa-arrows-v:before {\n  content: \"\\F07D\";\n}\n.fa-arrows-h:before {\n  content: \"\\F07E\";\n}\n.fa-bar-chart-o:before,\n.fa-bar-chart:before {\n  content: \"\\F080\";\n}\n.fa-twitter-square:before {\n  content: \"\\F081\";\n}\n.fa-facebook-square:before {\n  content: \"\\F082\";\n}\n.fa-camera-retro:before {\n  content: \"\\F083\";\n}\n.fa-key:before {\n  content: \"\\F084\";\n}\n.fa-gears:before,\n.fa-cogs:before {\n  content: \"\\F085\";\n}\n.fa-comments:before {\n  content: \"\\F086\";\n}\n.fa-thumbs-o-up:before {\n  content: \"\\F087\";\n}\n.fa-thumbs-o-down:before {\n  content: \"\\F088\";\n}\n.fa-star-half:before {\n  content: \"\\F089\";\n}\n.fa-heart-o:before {\n  content: \"\\F08A\";\n}\n.fa-sign-out:before {\n  content: \"\\F08B\";\n}\n.fa-linkedin-square:before {\n  content: \"\\F08C\";\n}\n.fa-thumb-tack:before {\n  content: \"\\F08D\";\n}\n.fa-external-link:before {\n  content: \"\\F08E\";\n}\n.fa-sign-in:before {\n  content: \"\\F090\";\n}\n.fa-trophy:before {\n  content: \"\\F091\";\n}\n.fa-github-square:before {\n  content: \"\\F092\";\n}\n.fa-upload:before {\n  content: \"\\F093\";\n}\n.fa-lemon-o:before {\n  content: \"\\F094\";\n}\n.fa-phone:before {\n  content: \"\\F095\";\n}\n.fa-square-o:before {\n  content: \"\\F096\";\n}\n.fa-bookmark-o:before {\n  content: \"\\F097\";\n}\n.fa-phone-square:before {\n  content: \"\\F098\";\n}\n.fa-twitter:before {\n  content: \"\\F099\";\n}\n.fa-facebook-f:before,\n.fa-facebook:before {\n  content: \"\\F09A\";\n}\n.fa-github:before {\n  content: \"\\F09B\";\n}\n.fa-unlock:before {\n  content: \"\\F09C\";\n}\n.fa-credit-card:before {\n  content: \"\\F09D\";\n}\n.fa-feed:before,\n.fa-rss:before {\n  content: \"\\F09E\";\n}\n.fa-hdd-o:before {\n  content: \"\\F0A0\";\n}\n.fa-bullhorn:before {\n  content: \"\\F0A1\";\n}\n.fa-bell:before {\n  content: \"\\F0F3\";\n}\n.fa-certificate:before {\n  content: \"\\F0A3\";\n}\n.fa-hand-o-right:before {\n  content: \"\\F0A4\";\n}\n.fa-hand-o-left:before {\n  content: \"\\F0A5\";\n}\n.fa-hand-o-up:before {\n  content: \"\\F0A6\";\n}\n.fa-hand-o-down:before {\n  content: \"\\F0A7\";\n}\n.fa-arrow-circle-left:before {\n  content: \"\\F0A8\";\n}\n.fa-arrow-circle-right:before {\n  content: \"\\F0A9\";\n}\n.fa-arrow-circle-up:before {\n  content: \"\\F0AA\";\n}\n.fa-arrow-circle-down:before {\n  content: \"\\F0AB\";\n}\n.fa-globe:before {\n  content: \"\\F0AC\";\n}\n.fa-wrench:before {\n  content: \"\\F0AD\";\n}\n.fa-tasks:before {\n  content: \"\\F0AE\";\n}\n.fa-filter:before {\n  content: \"\\F0B0\";\n}\n.fa-briefcase:before {\n  content: \"\\F0B1\";\n}\n.fa-arrows-alt:before {\n  content: \"\\F0B2\";\n}\n.fa-group:before,\n.fa-users:before {\n  content: \"\\F0C0\";\n}\n.fa-chain:before,\n.fa-link:before {\n  content: \"\\F0C1\";\n}\n.fa-cloud:before {\n  content: \"\\F0C2\";\n}\n.fa-flask:before {\n  content: \"\\F0C3\";\n}\n.fa-cut:before,\n.fa-scissors:before {\n  content: \"\\F0C4\";\n}\n.fa-copy:before,\n.fa-files-o:before {\n  content: \"\\F0C5\";\n}\n.fa-paperclip:before {\n  content: \"\\F0C6\";\n}\n.fa-save:before,\n.fa-floppy-o:before {\n  content: \"\\F0C7\";\n}\n.fa-square:before {\n  content: \"\\F0C8\";\n}\n.fa-navicon:before,\n.fa-reorder:before,\n.fa-bars:before {\n  content: \"\\F0C9\";\n}\n.fa-list-ul:before {\n  content: \"\\F0CA\";\n}\n.fa-list-ol:before {\n  content: \"\\F0CB\";\n}\n.fa-strikethrough:before {\n  content: \"\\F0CC\";\n}\n.fa-underline:before {\n  content: \"\\F0CD\";\n}\n.fa-table:before {\n  content: \"\\F0CE\";\n}\n.fa-magic:before {\n  content: \"\\F0D0\";\n}\n.fa-truck:before {\n  content: \"\\F0D1\";\n}\n.fa-pinterest:before {\n  content: \"\\F0D2\";\n}\n.fa-pinterest-square:before {\n  content: \"\\F0D3\";\n}\n.fa-google-plus-square:before {\n  content: \"\\F0D4\";\n}\n.fa-google-plus:before {\n  content: \"\\F0D5\";\n}\n.fa-money:before {\n  content: \"\\F0D6\";\n}\n.fa-caret-down:before {\n  content: \"\\F0D7\";\n}\n.fa-caret-up:before {\n  content: \"\\F0D8\";\n}\n.fa-caret-left:before {\n  content: \"\\F0D9\";\n}\n.fa-caret-right:before {\n  content: \"\\F0DA\";\n}\n.fa-columns:before {\n  content: \"\\F0DB\";\n}\n.fa-unsorted:before,\n.fa-sort:before {\n  content: \"\\F0DC\";\n}\n.fa-sort-down:before,\n.fa-sort-desc:before {\n  content: \"\\F0DD\";\n}\n.fa-sort-up:before,\n.fa-sort-asc:before {\n  content: \"\\F0DE\";\n}\n.fa-envelope:before {\n  content: \"\\F0E0\";\n}\n.fa-linkedin:before {\n  content: \"\\F0E1\";\n}\n.fa-rotate-left:before,\n.fa-undo:before {\n  content: \"\\F0E2\";\n}\n.fa-legal:before,\n.fa-gavel:before {\n  content: \"\\F0E3\";\n}\n.fa-dashboard:before,\n.fa-tachometer:before {\n  content: \"\\F0E4\";\n}\n.fa-comment-o:before {\n  content: \"\\F0E5\";\n}\n.fa-comments-o:before {\n  content: \"\\F0E6\";\n}\n.fa-flash:before,\n.fa-bolt:before {\n  content: \"\\F0E7\";\n}\n.fa-sitemap:before {\n  content: \"\\F0E8\";\n}\n.fa-umbrella:before {\n  content: \"\\F0E9\";\n}\n.fa-paste:before,\n.fa-clipboard:before {\n  content: \"\\F0EA\";\n}\n.fa-lightbulb-o:before {\n  content: \"\\F0EB\";\n}\n.fa-exchange:before {\n  content: \"\\F0EC\";\n}\n.fa-cloud-download:before {\n  content: \"\\F0ED\";\n}\n.fa-cloud-upload:before {\n  content: \"\\F0EE\";\n}\n.fa-user-md:before {\n  content: \"\\F0F0\";\n}\n.fa-stethoscope:before {\n  content: \"\\F0F1\";\n}\n.fa-suitcase:before {\n  content: \"\\F0F2\";\n}\n.fa-bell-o:before {\n  content: \"\\F0A2\";\n}\n.fa-coffee:before {\n  content: \"\\F0F4\";\n}\n.fa-cutlery:before {\n  content: \"\\F0F5\";\n}\n.fa-file-text-o:before {\n  content: \"\\F0F6\";\n}\n.fa-building-o:before {\n  content: \"\\F0F7\";\n}\n.fa-hospital-o:before {\n  content: \"\\F0F8\";\n}\n.fa-ambulance:before {\n  content: \"\\F0F9\";\n}\n.fa-medkit:before {\n  content: \"\\F0FA\";\n}\n.fa-fighter-jet:before {\n  content: \"\\F0FB\";\n}\n.fa-beer:before {\n  content: \"\\F0FC\";\n}\n.fa-h-square:before {\n  content: \"\\F0FD\";\n}\n.fa-plus-square:before {\n  content: \"\\F0FE\";\n}\n.fa-angle-double-left:before {\n  content: \"\\F100\";\n}\n.fa-angle-double-right:before {\n  content: \"\\F101\";\n}\n.fa-angle-double-up:before {\n  content: \"\\F102\";\n}\n.fa-angle-double-down:before {\n  content: \"\\F103\";\n}\n.fa-angle-left:before {\n  content: \"\\F104\";\n}\n.fa-angle-right:before {\n  content: \"\\F105\";\n}\n.fa-angle-up:before {\n  content: \"\\F106\";\n}\n.fa-angle-down:before {\n  content: \"\\F107\";\n}\n.fa-desktop:before {\n  content: \"\\F108\";\n}\n.fa-laptop:before {\n  content: \"\\F109\";\n}\n.fa-tablet:before {\n  content: \"\\F10A\";\n}\n.fa-mobile-phone:before,\n.fa-mobile:before {\n  content: \"\\F10B\";\n}\n.fa-circle-o:before {\n  content: \"\\F10C\";\n}\n.fa-quote-left:before {\n  content: \"\\F10D\";\n}\n.fa-quote-right:before {\n  content: \"\\F10E\";\n}\n.fa-spinner:before {\n  content: \"\\F110\";\n}\n.fa-circle:before {\n  content: \"\\F111\";\n}\n.fa-mail-reply:before,\n.fa-reply:before {\n  content: \"\\F112\";\n}\n.fa-github-alt:before {\n  content: \"\\F113\";\n}\n.fa-folder-o:before {\n  content: \"\\F114\";\n}\n.fa-folder-open-o:before {\n  content: \"\\F115\";\n}\n.fa-smile-o:before {\n  content: \"\\F118\";\n}\n.fa-frown-o:before {\n  content: \"\\F119\";\n}\n.fa-meh-o:before {\n  content: \"\\F11A\";\n}\n.fa-gamepad:before {\n  content: \"\\F11B\";\n}\n.fa-keyboard-o:before {\n  content: \"\\F11C\";\n}\n.fa-flag-o:before {\n  content: \"\\F11D\";\n}\n.fa-flag-checkered:before {\n  content: \"\\F11E\";\n}\n.fa-terminal:before {\n  content: \"\\F120\";\n}\n.fa-code:before {\n  content: \"\\F121\";\n}\n.fa-mail-reply-all:before,\n.fa-reply-all:before {\n  content: \"\\F122\";\n}\n.fa-star-half-empty:before,\n.fa-star-half-full:before,\n.fa-star-half-o:before {\n  content: \"\\F123\";\n}\n.fa-location-arrow:before {\n  content: \"\\F124\";\n}\n.fa-crop:before {\n  content: \"\\F125\";\n}\n.fa-code-fork:before {\n  content: \"\\F126\";\n}\n.fa-unlink:before,\n.fa-chain-broken:before {\n  content: \"\\F127\";\n}\n.fa-question:before {\n  content: \"\\F128\";\n}\n.fa-info:before {\n  content: \"\\F129\";\n}\n.fa-exclamation:before {\n  content: \"\\F12A\";\n}\n.fa-superscript:before {\n  content: \"\\F12B\";\n}\n.fa-subscript:before {\n  content: \"\\F12C\";\n}\n.fa-eraser:before {\n  content: \"\\F12D\";\n}\n.fa-puzzle-piece:before {\n  content: \"\\F12E\";\n}\n.fa-microphone:before {\n  content: \"\\F130\";\n}\n.fa-microphone-slash:before {\n  content: \"\\F131\";\n}\n.fa-shield:before {\n  content: \"\\F132\";\n}\n.fa-calendar-o:before {\n  content: \"\\F133\";\n}\n.fa-fire-extinguisher:before {\n  content: \"\\F134\";\n}\n.fa-rocket:before {\n  content: \"\\F135\";\n}\n.fa-maxcdn:before {\n  content: \"\\F136\";\n}\n.fa-chevron-circle-left:before {\n  content: \"\\F137\";\n}\n.fa-chevron-circle-right:before {\n  content: \"\\F138\";\n}\n.fa-chevron-circle-up:before {\n  content: \"\\F139\";\n}\n.fa-chevron-circle-down:before {\n  content: \"\\F13A\";\n}\n.fa-html5:before {\n  content: \"\\F13B\";\n}\n.fa-css3:before {\n  content: \"\\F13C\";\n}\n.fa-anchor:before {\n  content: \"\\F13D\";\n}\n.fa-unlock-alt:before {\n  content: \"\\F13E\";\n}\n.fa-bullseye:before {\n  content: \"\\F140\";\n}\n.fa-ellipsis-h:before {\n  content: \"\\F141\";\n}\n.fa-ellipsis-v:before {\n  content: \"\\F142\";\n}\n.fa-rss-square:before {\n  content: \"\\F143\";\n}\n.fa-play-circle:before {\n  content: \"\\F144\";\n}\n.fa-ticket:before {\n  content: \"\\F145\";\n}\n.fa-minus-square:before {\n  content: \"\\F146\";\n}\n.fa-minus-square-o:before {\n  content: \"\\F147\";\n}\n.fa-level-up:before {\n  content: \"\\F148\";\n}\n.fa-level-down:before {\n  content: \"\\F149\";\n}\n.fa-check-square:before {\n  content: \"\\F14A\";\n}\n.fa-pencil-square:before {\n  content: \"\\F14B\";\n}\n.fa-external-link-square:before {\n  content: \"\\F14C\";\n}\n.fa-share-square:before {\n  content: \"\\F14D\";\n}\n.fa-compass:before {\n  content: \"\\F14E\";\n}\n.fa-toggle-down:before,\n.fa-caret-square-o-down:before {\n  content: \"\\F150\";\n}\n.fa-toggle-up:before,\n.fa-caret-square-o-up:before {\n  content: \"\\F151\";\n}\n.fa-toggle-right:before,\n.fa-caret-square-o-right:before {\n  content: \"\\F152\";\n}\n.fa-euro:before,\n.fa-eur:before {\n  content: \"\\F153\";\n}\n.fa-gbp:before {\n  content: \"\\F154\";\n}\n.fa-dollar:before,\n.fa-usd:before {\n  content: \"\\F155\";\n}\n.fa-rupee:before,\n.fa-inr:before {\n  content: \"\\F156\";\n}\n.fa-cny:before,\n.fa-rmb:before,\n.fa-yen:before,\n.fa-jpy:before {\n  content: \"\\F157\";\n}\n.fa-ruble:before,\n.fa-rouble:before,\n.fa-rub:before {\n  content: \"\\F158\";\n}\n.fa-won:before,\n.fa-krw:before {\n  content: \"\\F159\";\n}\n.fa-bitcoin:before,\n.fa-btc:before {\n  content: \"\\F15A\";\n}\n.fa-file:before {\n  content: \"\\F15B\";\n}\n.fa-file-text:before {\n  content: \"\\F15C\";\n}\n.fa-sort-alpha-asc:before {\n  content: \"\\F15D\";\n}\n.fa-sort-alpha-desc:before {\n  content: \"\\F15E\";\n}\n.fa-sort-amount-asc:before {\n  content: \"\\F160\";\n}\n.fa-sort-amount-desc:before {\n  content: \"\\F161\";\n}\n.fa-sort-numeric-asc:before {\n  content: \"\\F162\";\n}\n.fa-sort-numeric-desc:before {\n  content: \"\\F163\";\n}\n.fa-thumbs-up:before {\n  content: \"\\F164\";\n}\n.fa-thumbs-down:before {\n  content: \"\\F165\";\n}\n.fa-youtube-square:before {\n  content: \"\\F166\";\n}\n.fa-youtube:before {\n  content: \"\\F167\";\n}\n.fa-xing:before {\n  content: \"\\F168\";\n}\n.fa-xing-square:before {\n  content: \"\\F169\";\n}\n.fa-youtube-play:before {\n  content: \"\\F16A\";\n}\n.fa-dropbox:before {\n  content: \"\\F16B\";\n}\n.fa-stack-overflow:before {\n  content: \"\\F16C\";\n}\n.fa-instagram:before {\n  content: \"\\F16D\";\n}\n.fa-flickr:before {\n  content: \"\\F16E\";\n}\n.fa-adn:before {\n  content: \"\\F170\";\n}\n.fa-bitbucket:before {\n  content: \"\\F171\";\n}\n.fa-bitbucket-square:before {\n  content: \"\\F172\";\n}\n.fa-tumblr:before {\n  content: \"\\F173\";\n}\n.fa-tumblr-square:before {\n  content: \"\\F174\";\n}\n.fa-long-arrow-down:before {\n  content: \"\\F175\";\n}\n.fa-long-arrow-up:before {\n  content: \"\\F176\";\n}\n.fa-long-arrow-left:before {\n  content: \"\\F177\";\n}\n.fa-long-arrow-right:before {\n  content: \"\\F178\";\n}\n.fa-apple:before {\n  content: \"\\F179\";\n}\n.fa-windows:before {\n  content: \"\\F17A\";\n}\n.fa-android:before {\n  content: \"\\F17B\";\n}\n.fa-linux:before {\n  content: \"\\F17C\";\n}\n.fa-dribbble:before {\n  content: \"\\F17D\";\n}\n.fa-skype:before {\n  content: \"\\F17E\";\n}\n.fa-foursquare:before {\n  content: \"\\F180\";\n}\n.fa-trello:before {\n  content: \"\\F181\";\n}\n.fa-female:before {\n  content: \"\\F182\";\n}\n.fa-male:before {\n  content: \"\\F183\";\n}\n.fa-gittip:before,\n.fa-gratipay:before {\n  content: \"\\F184\";\n}\n.fa-sun-o:before {\n  content: \"\\F185\";\n}\n.fa-moon-o:before {\n  content: \"\\F186\";\n}\n.fa-archive:before {\n  content: \"\\F187\";\n}\n.fa-bug:before {\n  content: \"\\F188\";\n}\n.fa-vk:before {\n  content: \"\\F189\";\n}\n.fa-weibo:before {\n  content: \"\\F18A\";\n}\n.fa-renren:before {\n  content: \"\\F18B\";\n}\n.fa-pagelines:before {\n  content: \"\\F18C\";\n}\n.fa-stack-exchange:before {\n  content: \"\\F18D\";\n}\n.fa-arrow-circle-o-right:before {\n  content: \"\\F18E\";\n}\n.fa-arrow-circle-o-left:before {\n  content: \"\\F190\";\n}\n.fa-toggle-left:before,\n.fa-caret-square-o-left:before {\n  content: \"\\F191\";\n}\n.fa-dot-circle-o:before {\n  content: \"\\F192\";\n}\n.fa-wheelchair:before {\n  content: \"\\F193\";\n}\n.fa-vimeo-square:before {\n  content: \"\\F194\";\n}\n.fa-turkish-lira:before,\n.fa-try:before {\n  content: \"\\F195\";\n}\n.fa-plus-square-o:before {\n  content: \"\\F196\";\n}\n.fa-space-shuttle:before {\n  content: \"\\F197\";\n}\n.fa-slack:before {\n  content: \"\\F198\";\n}\n.fa-envelope-square:before {\n  content: \"\\F199\";\n}\n.fa-wordpress:before {\n  content: \"\\F19A\";\n}\n.fa-openid:before {\n  content: \"\\F19B\";\n}\n.fa-institution:before,\n.fa-bank:before,\n.fa-university:before {\n  content: \"\\F19C\";\n}\n.fa-mortar-board:before,\n.fa-graduation-cap:before {\n  content: \"\\F19D\";\n}\n.fa-yahoo:before {\n  content: \"\\F19E\";\n}\n.fa-google:before {\n  content: \"\\F1A0\";\n}\n.fa-reddit:before {\n  content: \"\\F1A1\";\n}\n.fa-reddit-square:before {\n  content: \"\\F1A2\";\n}\n.fa-stumbleupon-circle:before {\n  content: \"\\F1A3\";\n}\n.fa-stumbleupon:before {\n  content: \"\\F1A4\";\n}\n.fa-delicious:before {\n  content: \"\\F1A5\";\n}\n.fa-digg:before {\n  content: \"\\F1A6\";\n}\n.fa-pied-piper-pp:before {\n  content: \"\\F1A7\";\n}\n.fa-pied-piper-alt:before {\n  content: \"\\F1A8\";\n}\n.fa-drupal:before {\n  content: \"\\F1A9\";\n}\n.fa-joomla:before {\n  content: \"\\F1AA\";\n}\n.fa-language:before {\n  content: \"\\F1AB\";\n}\n.fa-fax:before {\n  content: \"\\F1AC\";\n}\n.fa-building:before {\n  content: \"\\F1AD\";\n}\n.fa-child:before {\n  content: \"\\F1AE\";\n}\n.fa-paw:before {\n  content: \"\\F1B0\";\n}\n.fa-spoon:before {\n  content: \"\\F1B1\";\n}\n.fa-cube:before {\n  content: \"\\F1B2\";\n}\n.fa-cubes:before {\n  content: \"\\F1B3\";\n}\n.fa-behance:before {\n  content: \"\\F1B4\";\n}\n.fa-behance-square:before {\n  content: \"\\F1B5\";\n}\n.fa-steam:before {\n  content: \"\\F1B6\";\n}\n.fa-steam-square:before {\n  content: \"\\F1B7\";\n}\n.fa-recycle:before {\n  content: \"\\F1B8\";\n}\n.fa-automobile:before,\n.fa-car:before {\n  content: \"\\F1B9\";\n}\n.fa-cab:before,\n.fa-taxi:before {\n  content: \"\\F1BA\";\n}\n.fa-tree:before {\n  content: \"\\F1BB\";\n}\n.fa-spotify:before {\n  content: \"\\F1BC\";\n}\n.fa-deviantart:before {\n  content: \"\\F1BD\";\n}\n.fa-soundcloud:before {\n  content: \"\\F1BE\";\n}\n.fa-database:before {\n  content: \"\\F1C0\";\n}\n.fa-file-pdf-o:before {\n  content: \"\\F1C1\";\n}\n.fa-file-word-o:before {\n  content: \"\\F1C2\";\n}\n.fa-file-excel-o:before {\n  content: \"\\F1C3\";\n}\n.fa-file-powerpoint-o:before {\n  content: \"\\F1C4\";\n}\n.fa-file-photo-o:before,\n.fa-file-picture-o:before,\n.fa-file-image-o:before {\n  content: \"\\F1C5\";\n}\n.fa-file-zip-o:before,\n.fa-file-archive-o:before {\n  content: \"\\F1C6\";\n}\n.fa-file-sound-o:before,\n.fa-file-audio-o:before {\n  content: \"\\F1C7\";\n}\n.fa-file-movie-o:before,\n.fa-file-video-o:before {\n  content: \"\\F1C8\";\n}\n.fa-file-code-o:before {\n  content: \"\\F1C9\";\n}\n.fa-vine:before {\n  content: \"\\F1CA\";\n}\n.fa-codepen:before {\n  content: \"\\F1CB\";\n}\n.fa-jsfiddle:before {\n  content: \"\\F1CC\";\n}\n.fa-life-bouy:before,\n.fa-life-buoy:before,\n.fa-life-saver:before,\n.fa-support:before,\n.fa-life-ring:before {\n  content: \"\\F1CD\";\n}\n.fa-circle-o-notch:before {\n  content: \"\\F1CE\";\n}\n.fa-ra:before,\n.fa-resistance:before,\n.fa-rebel:before {\n  content: \"\\F1D0\";\n}\n.fa-ge:before,\n.fa-empire:before {\n  content: \"\\F1D1\";\n}\n.fa-git-square:before {\n  content: \"\\F1D2\";\n}\n.fa-git:before {\n  content: \"\\F1D3\";\n}\n.fa-y-combinator-square:before,\n.fa-yc-square:before,\n.fa-hacker-news:before {\n  content: \"\\F1D4\";\n}\n.fa-tencent-weibo:before {\n  content: \"\\F1D5\";\n}\n.fa-qq:before {\n  content: \"\\F1D6\";\n}\n.fa-wechat:before,\n.fa-weixin:before {\n  content: \"\\F1D7\";\n}\n.fa-send:before,\n.fa-paper-plane:before {\n  content: \"\\F1D8\";\n}\n.fa-send-o:before,\n.fa-paper-plane-o:before {\n  content: \"\\F1D9\";\n}\n.fa-history:before {\n  content: \"\\F1DA\";\n}\n.fa-circle-thin:before {\n  content: \"\\F1DB\";\n}\n.fa-header:before {\n  content: \"\\F1DC\";\n}\n.fa-paragraph:before {\n  content: \"\\F1DD\";\n}\n.fa-sliders:before {\n  content: \"\\F1DE\";\n}\n.fa-share-alt:before {\n  content: \"\\F1E0\";\n}\n.fa-share-alt-square:before {\n  content: \"\\F1E1\";\n}\n.fa-bomb:before {\n  content: \"\\F1E2\";\n}\n.fa-soccer-ball-o:before,\n.fa-futbol-o:before {\n  content: \"\\F1E3\";\n}\n.fa-tty:before {\n  content: \"\\F1E4\";\n}\n.fa-binoculars:before {\n  content: \"\\F1E5\";\n}\n.fa-plug:before {\n  content: \"\\F1E6\";\n}\n.fa-slideshare:before {\n  content: \"\\F1E7\";\n}\n.fa-twitch:before {\n  content: \"\\F1E8\";\n}\n.fa-yelp:before {\n  content: \"\\F1E9\";\n}\n.fa-newspaper-o:before {\n  content: \"\\F1EA\";\n}\n.fa-wifi:before {\n  content: \"\\F1EB\";\n}\n.fa-calculator:before {\n  content: \"\\F1EC\";\n}\n.fa-paypal:before {\n  content: \"\\F1ED\";\n}\n.fa-google-wallet:before {\n  content: \"\\F1EE\";\n}\n.fa-cc-visa:before {\n  content: \"\\F1F0\";\n}\n.fa-cc-mastercard:before {\n  content: \"\\F1F1\";\n}\n.fa-cc-discover:before {\n  content: \"\\F1F2\";\n}\n.fa-cc-amex:before {\n  content: \"\\F1F3\";\n}\n.fa-cc-paypal:before {\n  content: \"\\F1F4\";\n}\n.fa-cc-stripe:before {\n  content: \"\\F1F5\";\n}\n.fa-bell-slash:before {\n  content: \"\\F1F6\";\n}\n.fa-bell-slash-o:before {\n  content: \"\\F1F7\";\n}\n.fa-trash:before {\n  content: \"\\F1F8\";\n}\n.fa-copyright:before {\n  content: \"\\F1F9\";\n}\n.fa-at:before {\n  content: \"\\F1FA\";\n}\n.fa-eyedropper:before {\n  content: \"\\F1FB\";\n}\n.fa-paint-brush:before {\n  content: \"\\F1FC\";\n}\n.fa-birthday-cake:before {\n  content: \"\\F1FD\";\n}\n.fa-area-chart:before {\n  content: \"\\F1FE\";\n}\n.fa-pie-chart:before {\n  content: \"\\F200\";\n}\n.fa-line-chart:before {\n  content: \"\\F201\";\n}\n.fa-lastfm:before {\n  content: \"\\F202\";\n}\n.fa-lastfm-square:before {\n  content: \"\\F203\";\n}\n.fa-toggle-off:before {\n  content: \"\\F204\";\n}\n.fa-toggle-on:before {\n  content: \"\\F205\";\n}\n.fa-bicycle:before {\n  content: \"\\F206\";\n}\n.fa-bus:before {\n  content: \"\\F207\";\n}\n.fa-ioxhost:before {\n  content: \"\\F208\";\n}\n.fa-angellist:before {\n  content: \"\\F209\";\n}\n.fa-cc:before {\n  content: \"\\F20A\";\n}\n.fa-shekel:before,\n.fa-sheqel:before,\n.fa-ils:before {\n  content: \"\\F20B\";\n}\n.fa-meanpath:before {\n  content: \"\\F20C\";\n}\n.fa-buysellads:before {\n  content: \"\\F20D\";\n}\n.fa-connectdevelop:before {\n  content: \"\\F20E\";\n}\n.fa-dashcube:before {\n  content: \"\\F210\";\n}\n.fa-forumbee:before {\n  content: \"\\F211\";\n}\n.fa-leanpub:before {\n  content: \"\\F212\";\n}\n.fa-sellsy:before {\n  content: \"\\F213\";\n}\n.fa-shirtsinbulk:before {\n  content: \"\\F214\";\n}\n.fa-simplybuilt:before {\n  content: \"\\F215\";\n}\n.fa-skyatlas:before {\n  content: \"\\F216\";\n}\n.fa-cart-plus:before {\n  content: \"\\F217\";\n}\n.fa-cart-arrow-down:before {\n  content: \"\\F218\";\n}\n.fa-diamond:before {\n  content: \"\\F219\";\n}\n.fa-ship:before {\n  content: \"\\F21A\";\n}\n.fa-user-secret:before {\n  content: \"\\F21B\";\n}\n.fa-motorcycle:before {\n  content: \"\\F21C\";\n}\n.fa-street-view:before {\n  content: \"\\F21D\";\n}\n.fa-heartbeat:before {\n  content: \"\\F21E\";\n}\n.fa-venus:before {\n  content: \"\\F221\";\n}\n.fa-mars:before {\n  content: \"\\F222\";\n}\n.fa-mercury:before {\n  content: \"\\F223\";\n}\n.fa-intersex:before,\n.fa-transgender:before {\n  content: \"\\F224\";\n}\n.fa-transgender-alt:before {\n  content: \"\\F225\";\n}\n.fa-venus-double:before {\n  content: \"\\F226\";\n}\n.fa-mars-double:before {\n  content: \"\\F227\";\n}\n.fa-venus-mars:before {\n  content: \"\\F228\";\n}\n.fa-mars-stroke:before {\n  content: \"\\F229\";\n}\n.fa-mars-stroke-v:before {\n  content: \"\\F22A\";\n}\n.fa-mars-stroke-h:before {\n  content: \"\\F22B\";\n}\n.fa-neuter:before {\n  content: \"\\F22C\";\n}\n.fa-genderless:before {\n  content: \"\\F22D\";\n}\n.fa-facebook-official:before {\n  content: \"\\F230\";\n}\n.fa-pinterest-p:before {\n  content: \"\\F231\";\n}\n.fa-whatsapp:before {\n  content: \"\\F232\";\n}\n.fa-server:before {\n  content: \"\\F233\";\n}\n.fa-user-plus:before {\n  content: \"\\F234\";\n}\n.fa-user-times:before {\n  content: \"\\F235\";\n}\n.fa-hotel:before,\n.fa-bed:before {\n  content: \"\\F236\";\n}\n.fa-viacoin:before {\n  content: \"\\F237\";\n}\n.fa-train:before {\n  content: \"\\F238\";\n}\n.fa-subway:before {\n  content: \"\\F239\";\n}\n.fa-medium:before {\n  content: \"\\F23A\";\n}\n.fa-yc:before,\n.fa-y-combinator:before {\n  content: \"\\F23B\";\n}\n.fa-optin-monster:before {\n  content: \"\\F23C\";\n}\n.fa-opencart:before {\n  content: \"\\F23D\";\n}\n.fa-expeditedssl:before {\n  content: \"\\F23E\";\n}\n.fa-battery-4:before,\n.fa-battery:before,\n.fa-battery-full:before {\n  content: \"\\F240\";\n}\n.fa-battery-3:before,\n.fa-battery-three-quarters:before {\n  content: \"\\F241\";\n}\n.fa-battery-2:before,\n.fa-battery-half:before {\n  content: \"\\F242\";\n}\n.fa-battery-1:before,\n.fa-battery-quarter:before {\n  content: \"\\F243\";\n}\n.fa-battery-0:before,\n.fa-battery-empty:before {\n  content: \"\\F244\";\n}\n.fa-mouse-pointer:before {\n  content: \"\\F245\";\n}\n.fa-i-cursor:before {\n  content: \"\\F246\";\n}\n.fa-object-group:before {\n  content: \"\\F247\";\n}\n.fa-object-ungroup:before {\n  content: \"\\F248\";\n}\n.fa-sticky-note:before {\n  content: \"\\F249\";\n}\n.fa-sticky-note-o:before {\n  content: \"\\F24A\";\n}\n.fa-cc-jcb:before {\n  content: \"\\F24B\";\n}\n.fa-cc-diners-club:before {\n  content: \"\\F24C\";\n}\n.fa-clone:before {\n  content: \"\\F24D\";\n}\n.fa-balance-scale:before {\n  content: \"\\F24E\";\n}\n.fa-hourglass-o:before {\n  content: \"\\F250\";\n}\n.fa-hourglass-1:before,\n.fa-hourglass-start:before {\n  content: \"\\F251\";\n}\n.fa-hourglass-2:before,\n.fa-hourglass-half:before {\n  content: \"\\F252\";\n}\n.fa-hourglass-3:before,\n.fa-hourglass-end:before {\n  content: \"\\F253\";\n}\n.fa-hourglass:before {\n  content: \"\\F254\";\n}\n.fa-hand-grab-o:before,\n.fa-hand-rock-o:before {\n  content: \"\\F255\";\n}\n.fa-hand-stop-o:before,\n.fa-hand-paper-o:before {\n  content: \"\\F256\";\n}\n.fa-hand-scissors-o:before {\n  content: \"\\F257\";\n}\n.fa-hand-lizard-o:before {\n  content: \"\\F258\";\n}\n.fa-hand-spock-o:before {\n  content: \"\\F259\";\n}\n.fa-hand-pointer-o:before {\n  content: \"\\F25A\";\n}\n.fa-hand-peace-o:before {\n  content: \"\\F25B\";\n}\n.fa-trademark:before {\n  content: \"\\F25C\";\n}\n.fa-registered:before {\n  content: \"\\F25D\";\n}\n.fa-creative-commons:before {\n  content: \"\\F25E\";\n}\n.fa-gg:before {\n  content: \"\\F260\";\n}\n.fa-gg-circle:before {\n  content: \"\\F261\";\n}\n.fa-tripadvisor:before {\n  content: \"\\F262\";\n}\n.fa-odnoklassniki:before {\n  content: \"\\F263\";\n}\n.fa-odnoklassniki-square:before {\n  content: \"\\F264\";\n}\n.fa-get-pocket:before {\n  content: \"\\F265\";\n}\n.fa-wikipedia-w:before {\n  content: \"\\F266\";\n}\n.fa-safari:before {\n  content: \"\\F267\";\n}\n.fa-chrome:before {\n  content: \"\\F268\";\n}\n.fa-firefox:before {\n  content: \"\\F269\";\n}\n.fa-opera:before {\n  content: \"\\F26A\";\n}\n.fa-internet-explorer:before {\n  content: \"\\F26B\";\n}\n.fa-tv:before,\n.fa-television:before {\n  content: \"\\F26C\";\n}\n.fa-contao:before {\n  content: \"\\F26D\";\n}\n.fa-500px:before {\n  content: \"\\F26E\";\n}\n.fa-amazon:before {\n  content: \"\\F270\";\n}\n.fa-calendar-plus-o:before {\n  content: \"\\F271\";\n}\n.fa-calendar-minus-o:before {\n  content: \"\\F272\";\n}\n.fa-calendar-times-o:before {\n  content: \"\\F273\";\n}\n.fa-calendar-check-o:before {\n  content: \"\\F274\";\n}\n.fa-industry:before {\n  content: \"\\F275\";\n}\n.fa-map-pin:before {\n  content: \"\\F276\";\n}\n.fa-map-signs:before {\n  content: \"\\F277\";\n}\n.fa-map-o:before {\n  content: \"\\F278\";\n}\n.fa-map:before {\n  content: \"\\F279\";\n}\n.fa-commenting:before {\n  content: \"\\F27A\";\n}\n.fa-commenting-o:before {\n  content: \"\\F27B\";\n}\n.fa-houzz:before {\n  content: \"\\F27C\";\n}\n.fa-vimeo:before {\n  content: \"\\F27D\";\n}\n.fa-black-tie:before {\n  content: \"\\F27E\";\n}\n.fa-fonticons:before {\n  content: \"\\F280\";\n}\n.fa-reddit-alien:before {\n  content: \"\\F281\";\n}\n.fa-edge:before {\n  content: \"\\F282\";\n}\n.fa-credit-card-alt:before {\n  content: \"\\F283\";\n}\n.fa-codiepie:before {\n  content: \"\\F284\";\n}\n.fa-modx:before {\n  content: \"\\F285\";\n}\n.fa-fort-awesome:before {\n  content: \"\\F286\";\n}\n.fa-usb:before {\n  content: \"\\F287\";\n}\n.fa-product-hunt:before {\n  content: \"\\F288\";\n}\n.fa-mixcloud:before {\n  content: \"\\F289\";\n}\n.fa-scribd:before {\n  content: \"\\F28A\";\n}\n.fa-pause-circle:before {\n  content: \"\\F28B\";\n}\n.fa-pause-circle-o:before {\n  content: \"\\F28C\";\n}\n.fa-stop-circle:before {\n  content: \"\\F28D\";\n}\n.fa-stop-circle-o:before {\n  content: \"\\F28E\";\n}\n.fa-shopping-bag:before {\n  content: \"\\F290\";\n}\n.fa-shopping-basket:before {\n  content: \"\\F291\";\n}\n.fa-hashtag:before {\n  content: \"\\F292\";\n}\n.fa-bluetooth:before {\n  content: \"\\F293\";\n}\n.fa-bluetooth-b:before {\n  content: \"\\F294\";\n}\n.fa-percent:before {\n  content: \"\\F295\";\n}\n.fa-gitlab:before {\n  content: \"\\F296\";\n}\n.fa-wpbeginner:before {\n  content: \"\\F297\";\n}\n.fa-wpforms:before {\n  content: \"\\F298\";\n}\n.fa-envira:before {\n  content: \"\\F299\";\n}\n.fa-universal-access:before {\n  content: \"\\F29A\";\n}\n.fa-wheelchair-alt:before {\n  content: \"\\F29B\";\n}\n.fa-question-circle-o:before {\n  content: \"\\F29C\";\n}\n.fa-blind:before {\n  content: \"\\F29D\";\n}\n.fa-audio-description:before {\n  content: \"\\F29E\";\n}\n.fa-volume-control-phone:before {\n  content: \"\\F2A0\";\n}\n.fa-braille:before {\n  content: \"\\F2A1\";\n}\n.fa-assistive-listening-systems:before {\n  content: \"\\F2A2\";\n}\n.fa-asl-interpreting:before,\n.fa-american-sign-language-interpreting:before {\n  content: \"\\F2A3\";\n}\n.fa-deafness:before,\n.fa-hard-of-hearing:before,\n.fa-deaf:before {\n  content: \"\\F2A4\";\n}\n.fa-glide:before {\n  content: \"\\F2A5\";\n}\n.fa-glide-g:before {\n  content: \"\\F2A6\";\n}\n.fa-signing:before,\n.fa-sign-language:before {\n  content: \"\\F2A7\";\n}\n.fa-low-vision:before {\n  content: \"\\F2A8\";\n}\n.fa-viadeo:before {\n  content: \"\\F2A9\";\n}\n.fa-viadeo-square:before {\n  content: \"\\F2AA\";\n}\n.fa-snapchat:before {\n  content: \"\\F2AB\";\n}\n.fa-snapchat-ghost:before {\n  content: \"\\F2AC\";\n}\n.fa-snapchat-square:before {\n  content: \"\\F2AD\";\n}\n.fa-pied-piper:before {\n  content: \"\\F2AE\";\n}\n.fa-first-order:before {\n  content: \"\\F2B0\";\n}\n.fa-yoast:before {\n  content: \"\\F2B1\";\n}\n.fa-themeisle:before {\n  content: \"\\F2B2\";\n}\n.fa-google-plus-circle:before,\n.fa-google-plus-official:before {\n  content: \"\\F2B3\";\n}\n.fa-fa:before,\n.fa-font-awesome:before {\n  content: \"\\F2B4\";\n}\n.fa-handshake-o:before {\n  content: \"\\F2B5\";\n}\n.fa-envelope-open:before {\n  content: \"\\F2B6\";\n}\n.fa-envelope-open-o:before {\n  content: \"\\F2B7\";\n}\n.fa-linode:before {\n  content: \"\\F2B8\";\n}\n.fa-address-book:before {\n  content: \"\\F2B9\";\n}\n.fa-address-book-o:before {\n  content: \"\\F2BA\";\n}\n.fa-vcard:before,\n.fa-address-card:before {\n  content: \"\\F2BB\";\n}\n.fa-vcard-o:before,\n.fa-address-card-o:before {\n  content: \"\\F2BC\";\n}\n.fa-user-circle:before {\n  content: \"\\F2BD\";\n}\n.fa-user-circle-o:before {\n  content: \"\\F2BE\";\n}\n.fa-user-o:before {\n  content: \"\\F2C0\";\n}\n.fa-id-badge:before {\n  content: \"\\F2C1\";\n}\n.fa-drivers-license:before,\n.fa-id-card:before {\n  content: \"\\F2C2\";\n}\n.fa-drivers-license-o:before,\n.fa-id-card-o:before {\n  content: \"\\F2C3\";\n}\n.fa-quora:before {\n  content: \"\\F2C4\";\n}\n.fa-free-code-camp:before {\n  content: \"\\F2C5\";\n}\n.fa-telegram:before {\n  content: \"\\F2C6\";\n}\n.fa-thermometer-4:before,\n.fa-thermometer:before,\n.fa-thermometer-full:before {\n  content: \"\\F2C7\";\n}\n.fa-thermometer-3:before,\n.fa-thermometer-three-quarters:before {\n  content: \"\\F2C8\";\n}\n.fa-thermometer-2:before,\n.fa-thermometer-half:before {\n  content: \"\\F2C9\";\n}\n.fa-thermometer-1:before,\n.fa-thermometer-quarter:before {\n  content: \"\\F2CA\";\n}\n.fa-thermometer-0:before,\n.fa-thermometer-empty:before {\n  content: \"\\F2CB\";\n}\n.fa-shower:before {\n  content: \"\\F2CC\";\n}\n.fa-bathtub:before,\n.fa-s15:before,\n.fa-bath:before {\n  content: \"\\F2CD\";\n}\n.fa-podcast:before {\n  content: \"\\F2CE\";\n}\n.fa-window-maximize:before {\n  content: \"\\F2D0\";\n}\n.fa-window-minimize:before {\n  content: \"\\F2D1\";\n}\n.fa-window-restore:before {\n  content: \"\\F2D2\";\n}\n.fa-times-rectangle:before,\n.fa-window-close:before {\n  content: \"\\F2D3\";\n}\n.fa-times-rectangle-o:before,\n.fa-window-close-o:before {\n  content: \"\\F2D4\";\n}\n.fa-bandcamp:before {\n  content: \"\\F2D5\";\n}\n.fa-grav:before {\n  content: \"\\F2D6\";\n}\n.fa-etsy:before {\n  content: \"\\F2D7\";\n}\n.fa-imdb:before {\n  content: \"\\F2D8\";\n}\n.fa-ravelry:before {\n  content: \"\\F2D9\";\n}\n.fa-eercast:before {\n  content: \"\\F2DA\";\n}\n.fa-microchip:before {\n  content: \"\\F2DB\";\n}\n.fa-snowflake-o:before {\n  content: \"\\F2DC\";\n}\n.fa-superpowers:before {\n  content: \"\\F2DD\";\n}\n.fa-wpexplorer:before {\n  content: \"\\F2DE\";\n}\n.fa-meetup:before {\n  content: \"\\F2E0\";\n}\n/* FONT PATH\n * -------------------------- */\n@font-face {\n  font-family: 'FontAwesome';\n  src: url(" + __webpack_require__(83) + ");\n  src: url(" + __webpack_require__(84) + "?#iefix&v=4.7.0) format('embedded-opentype'), url(" + __webpack_require__(85) + ") format('woff2'), url(" + __webpack_require__(86) + ") format('woff'), url(" + __webpack_require__(87) + ") format('truetype'), url(" + __webpack_require__(88) + "#fontawesomeregular) format('svg');\n  font-weight: normal;\n  font-style: normal;\n}\n", ""]);

// exports


/***/ }),
/* 83 */
/***/ (function(module, exports) {

module.exports = "data:application/vnd.ms-fontobject;base64,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"

/***/ }),
/* 84 */
/***/ (function(module, exports) {

module.exports = "data:application/vnd.ms-fontobject;base64,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"

/***/ }),
/* 85 */
/***/ (function(module, exports) {

module.exports = "data:application/font-woff2;base64,d09GMgABAAAAAS1oAA0AAAAChpgAAS0OAAQBywAAAAAAAAAAAAAAAAAAAAAAAAAAP0ZGVE0cGiAGYACFchEIComZKIe2WAE2AiQDlXALlhAABCAFiQYHtHVbUglyR2H3kYQqug2BJ+096zq1GibTzT1ytyoKAhnlGvH2XQR0B9xFqm6jsv/////kpDFG2w7cQODV9Pt8rYoUCGaTbZJgmyTYkaFAZFtCUREkKFtVPCsorbhAUNA1HuRggbAO2j72UBAaO+EokdExs/1s2/5o1Kiiwimf3Fl5lPJKaenrF62Fznwl24G3XqwUR4KiM7gSbp6V6LraldwKxM2QRIqecFxZciCUTN9Q9A6NG4N0pSnLEZjvE6c2UsJeIlMLTH7xWVLXQ1hSFQmKNIGO5kb6eVxbv+g3bqHirnwdc+C7jHEeo027jiVLyf8XLtu6DiwL+oT3+EzQdP8n9hCQyU0dLBEVY/eIK2L6xNeH50/9c/le2CSFhtd6Lgf1bcWgDPxoJmdi3vDhdu2H8wEOySeKDzajOrC7w/Nz622jYowx2KhtMCLHghqwvypWjKiNHqNjoyQsMEFUUFS0MRID+/SsPAvtO+3z0mAQ5rYn8UgOP/Fzzqk6kQ9ORJ+o/KkQSRGkJIwEVBSLW4GCYjSKEc38f+rs7yyvzrzX772jYmw2kboLSUzpaX3bjCbgNOOUbSwnyxbL8yO916Wzf1J3AaJidcC2LEuWC8YGm+J2iwPbCG1fLcDA5lxIi537jkhI/qrzk+oHxsI/mJbTbfMLOVCIrdgpOedKqIYkxr2InOex9Dj46Mfazs5+uTvEchWNbr89JBEatR+UTmRkbhshJ66m8OM7s/SsOJm8J9lOpu0eIX8tGAZKGcq20y7g2PqR7livPQwsEgQOkJseImA6GKL/Gw8JCSB7je+e3OC8EstLISefAKEtRkiUnAmJIyR+m1pfhLmdEBK1A041VlU4RsivHKKOJRRQ1Pvdq9rb+wYIDIZDcAgCJARRGaK0u9oQnXKs7KLKvZvuumu7a9obpzPZtxPROlIRJR4QtoEye/SH3qn1kh1oJbspOMkR9gD48QEPGApJTEuQNnb0I+37s+7+Biw70KY2h6BOmjLOaHa3Dw4I/u9/zf7rDE9Pkad0IxaFBuJ4VInvqkJmAp2ehHFeFiOcrp+WP3v+NWKKSeLgJS1XWpDruWKkQaMTDF7kMc3ZbjUZ+a7pitemTlGdWSf65t3NEpYE/JFTBNwYH6YhdCIgBmBiM+n3JZMH9O8zNbsCFNFmdjurndXObM6s7jmcOmpnZj9ncpv1cP94nyCAD3wS/CAkCCBlEpQcEpRaFCjFFCR3KFpyU5DodiubWtkcz9Zx9k2i7B6b7s3q3ZltPyZzW/bldJlTklNqjqc5nK/j9z+tfNrqDfHwxT5HDswGLBBiRNW3Xqn0ql6px90bOmyKM469TkGaYKs1C5wyNrMBTPlwU/IJQd+nL1XrCsLWmLS8s7QnOVy0p9WGdLiFEK8h3/b2+rca/RuBbAAGhSBQTVK0mpA5boAKzWAVEhMoyhBA0iBIeSlN0mRNyg2QHDXp1KQTSCfSkZoc8m1TPPro23Ema7wpXM97O+4xxcNt+QebONt74YvVWIQx3S0zx5qQkSmCQiiEkSz7JfWTELC2to0ExAsFBd3923efb36+mHTt8EhXOGyQ1FoRCXKk47//PWWzGuzfMSvmBwUvyY4xVz/WsHLuEg44OVBMxtIBPnVvOSDFGDEgdMOYq8N1Y6edke7EQLP5XUsUEFLvf2JO/7uSdvuTtNQaqqgouCKKg3nrvbt7HAxjrv+P5vNzY3qmGSaucDWn5QShLGqzbiCia07EIYMug25e9/hVdR8AQHz8GD92tT73B7kdudwckXIYVWHcSFIgCxqPEPq51/jVkQCT80kNRInfy4tRv71+cOkKgNyNOzu4bvn5jUwYFyShdPkJOgloRkNZoe3eVE+gRk4dTn59F/ExImCzqPyf2GHPB8sozT9IIBGXlocfxFyWzeV1yjATTNS19fEnte26vb7NlFBibm1Pv5jrtt39jb8CGEpsiz8CAQie5XOr5wWIMCwOOIx4yULy+va+QhnH5ZFGiRAUn1/fG1JpWh34/7fUfmUjFWqwEbF3/WhPYyomRjYMrFlxwZIFe4l9P8nzPvd1Hvu2LvM0Ds5oJQVnlGAEpybX5yC4yxIpqaxSNRjlSIx9saf/y6Swa9yp2xyQJ0qZ3k+/AEmI2xO2nV/vs38FkXFPYifWSMefAEJZRU2jAxw2yHaEgTWqEE5KDeUVAU+ITgcaRgtOeCgxkjoBXLrfq0Pga45joGI4BVH0CRNk4RhbTBQoZWwcKzJ1Le7QYdaYZKKONTuiTiTU9iKiSKqPEKtTRrpv6zJpqCKK2VyzaAQ3SYz2oDxTQ08CrRm4lsiQSKAe4kV3IQEuH9fp/SFCUxJDqmcexJ2JY+MOueRzKtWnc4koNW2UPXHGyoplovvxWZELJOtcPhBmTjiAcZeMeOojdgqlNnVt7wngGZ2wYNtOTS1KAFz0EEa3x3LpRAKAHrVa0zCTByMn6qWIbuwR0kdqTILahlgUG8qMokGqnfFnWXOZKrJZytwHx17ZtZg7ItgdJGhifz25FhnPmxOYMN52SDyXVnZ/gWObXwBcWYoD7KPodztkQhYCg4sDToOEMxshJM7n57Tn4t5JfFCYIH4TJhPkA2TFLsgDG9Sw6QItYQfz+mEZCSsrwhOSOboubVL46TTjY3mvnrkji1XVwkZX7gh1vQ3cCRdpL/Ccr5RmfoA03fBsg+sOWFP0OcOEG/cxRZ3wvTNAkP3aaxOI3BVAFycjo7y2Y6y92W7qqSC68RXvU187rCX77kmK0MEru/gu80wa2EMCeLHr7h4evvrqhrF3CdrNVtuCgIG6qOGkwMP5RXhmfkhgvekwH7whZJToQFF7T2gxiRcXsUjBtkbDq9V6cxqNN/Pdibazxpx0D3J2zOip0mudu4ZoZVMzt9uHdpk5hHF8q0+C75dLKZVVXPKWQdIlo7m7AsRvHntsPIbbS7j/up3NjqKkjmmzj/FI60eASYV6nT02mldXbzDr2Qt8Fd4lQfcaamREKSENgKlwd67I7l+Cs+s7uPGm22OXRCPp/8uBTZDA3k56nPIFtwRwsF6PQ0R43sJ4aimENU/IOfsNoWDR0kVEWO548Y0g3ZJHVcjA7cuvDsSZqgSp79baiZwuJQ23v7bOiLF+DOPx+j3/CBoWQxNvpikNRoQ388rnJFqk/Si3Z8Hrb0Ktpw3bxpzAQN7lJvLD2mXuewbq4uWOo6AIbKCwZopfxlJ4mU5bp10MrpsHOGAtM5lztKbBknt/UGoB3hm4V3VjOe+FuK6phBtbPh3qLZ8uRKLcjln6H/ebFQ+AHmSHDM/C2AeisisYXnuTrrlD7veJsW3gxNnwLKaxQE48spAd2tnQ+PKJrx9/Di6NlFbx5k3w2hFT7CvTXESeK6LaUqJ80Ta1C+IncVxU4N0CppXzHB45h0SEBlg8fyTtcImA3gciu+mFppL8JJvStwveLPlwH7tz+aVU084a3f6vYrv/1E5rSZEeX+ahYNXmCkboiB/qV5OfVv+UJdnRdwitfqmkxETUkNnCy90q87N4afIeuHlbclqqhwCZW1MltEeb3BhzYEY844WjhbOsIKLBVosr/vMhK62W9/WKuNiNizl5n2vFwWZikTgy3gZz3n1sO1spZSTE+IlUnYaWa62DkuApmnaPtqk5rAGE4xune9N1E/J1j3SPyN6zQEXj9D58Q/baPFw0JQiXUnbhDKW26eXE6Kra9EDXukPMOFyR+H4pFCNrfL65LmHrb6q62gO6MDBHlHEwHRQl8fzwE6GZaHCLqboNTP+c3iKMKz6O7Oa1JaoLXk3LiphOmnPTyAZxjrQ9lRKwD77u5eSmhrBLETRy5y0q7+cl6NpoI9clO3BQ6aaUaNZDPffO+traDZca5SYUKaliYYTGS0z4QL/5nuR0uiGifjLtU11yWWy6WjbQM9GeSt5vtJhPo1b1O7loJmdPNZJSVIgvffnB0sZ7rqXyFxdBWtImhxlT8+LZdNjK+ZzPAwvNrwHpolDq60OhpBSiMBMItLZELPtwYnDQt9R6KacgXYBJ9z4aAA5RXEJswSK6l14zUj5y/Sr7uwRDPsAeHoOn4Rd4UFW6eh6tfVkRPQIP9cyVFrx99dC2xxCaGQrnDRw2LWAvIkgLCm+FJpJEl0kw/0UyWGGJlS0fqXsONcCBmTwNLH2U0RNgYDb6x+0YkGppounYaW08VXVqWala+moOQlxAjGfLM0VqZnCW+JifOrra7eoQV9vHrp+62d+zjpyUznClxLMzYW+v+xGBMYhkYYv4IJwDt92rpf2ImUqC17I/IGrOcTeuvk3D5s5mZplZtWbLHNRzAh6wGySbnAmElUj9kRTmrGyllvW5v8CIlyglLptyBuPSdz8D8r5tPX4LgnmyY1mRYmcpPMtXhCAvVngW2muptJIk5/OPDELwcn7xhgGn0/A5E942jTDRJv6ZX3ZNAFnCJYST0p175kV/iTY8w+mVx8Lt2yWLJas0rYuO36BP3kDv807h+QihgqoiWrcY309Ee3UzUw+Mx1eLTbCVUqftM3M8w/UZp5HYsw2jgKbxsFxJDjCNqy6gxS0y3a3sz+OErTuvCeyDMNUOtn1Oqy9i9fYajk57hEmZs3xiX3LEZfidX3BTaYPjyhQPPhIn3HesNfzb+lJGLNGHiCUeU1mWhLvGV2ijNkxfaeyDoz2am75pMfEz/llJN064Q3CNScnwxJS+wxIoD6hyr769MKvde2qJGfe6hXKLS7yemeXQom8pbNnE9IczbmG/VDF/XKfDSRlFKOltvfeyvd+Dm5PCRPRs+qx/ZbOzx+Ykw4Xfd1ieiMxVrPwoQJWErvdN9WEibqwOLOQqdkezHZYcicyoE3i5iq4+lUfZDFOCEYOA7r1nwMyJIpRRy3akYhQwKnrbyFBF9HnByYmMPzevJBMLwY7Y8CWeHYlHh9LR5HDJZFnIJmbiByHt+8dhNpSOfKgIKb8OO3U3I8IzyTSQbUrEs9v4Cm/39olP+HCtyIGidjhqoOqZ/HgoS8svWtxkuwOKj3jJxYP9bTdW0V9cp2bXTOU3DHCbWPN6Fh7shUg3vi2rDpa1LCgxS0hirWWQqCxyLRkco6ARcKFMy+/G7aAzPeZUmALGMql0kTLZvFiWazqptLX/CFqANcDPcwWJDnAOiNJTc1SruAUa1es6Ll21t0QilECw9S22RbfMkQYhEJQTQY3wkTK6ybYt8EYZfbHLkoAyQseDko1RGpnVF+AFKXTFw6d82iM0hHzcXPfjqIDwyGC3ZmMQLLafI9QHZ4npMTrZLdYWq6G5dHkXINtd+4eY4OQyr1p+ArGEAC4p4+mu8/Sz1wLHjODWHrWh3CVSpUuNmKu/KHmQAmCROJa2QxrXx9aN+rfL93qTuh2KSy1OjgyE8wEO9WBeK6b1i55uCKKoizO528+0GP4C5fSAnRaVVIHyM4J0UeHYo6kGCDQ8PjpKMMOIJeXdkVphYmDovQPqds2s/IZh9lQvWgEC+hScYd6dx9CTSWkJm1cxkBb88f2DX6mQED4pw/qXvkgilIr54+lwkusLg3w3bRRGtV5az81+ZosRFzBK8epeAMlJkRfcM1a5IekYpdx70zxlzC89znBg2tcM3nGtngA4XvbU2dPBSzjM60/NOfZ3MNPqWpC0fB6K3AR2P5FuwxQJ4Awzl4FmgSH9y9+30X6V/FSKIB+n5B37wcryIErTm6X7hAcRHN811wvBcKaPFLpWCbzfM4fLq7jF1/MPLj3G8czugS19p9xbzmflUuE1q/Od827so0I44ZH3g5kzLrsI0jgUCVlnoSMw3ya4va9ThC8uZmdcChpF4mbnfQ6QyCxrh6KU6ZNn/AYU+yQDuT9YWZMHKo/6lKm6Ebwxr5BwrZdFKL/X6/JSU5KkUbqYdJ7uAzYsoFHjalwI8OM8CC9dTq5z+80dpTvNJwwYSFhdjkWYMh45kIdkpmtZ/Q3ZapCOwlI20dTt9wNREiGYygDq7vcgVoa7mQolIggVXtBgl04zT/KMog/6hoOsW/EddjrgyoQ62ehe2pxy17/nEUDq0uwKjUbFX67XEeUBCE5jzELSF/H9wzhwo1xpr6K11zfP7otn5a0DKu6P0c39LINDq50awg7hW4c2tFSSP7q6tRaFJfJ6+8VAAQYYakFwQk418J4iNFSepeD0IpZ9MHVK9IePnpbInH4z9h7ZDtF7fQJ1V/aM4O5Nkx5q+jnILYJdE/WrnRGZJ2xTsiAv8FI+PKUr50+fldvYH2VCI5VCY9Ia2cAC6GpMXBESo8QtvlpolVvX+kk8jar8D/GEGHGodt5+lmtdm0fDztVURL8/U6nL2dYvGsYt1Ncl3ZKJlNnoNwyI/nemaXxDFstJocRx8XdjqIBXAZsUeAyasSDPDC83BIF4rIJITy+u5bUd8G9dkZ4PlEddinmP34Pr/If7I4WHHzepj2LN4ySTdMccqlLbJCAGvpjpf13jtGE3G81Go9Gur7KPLG4hcsvfSXwywBC847g46pJ4/zbnmWdTpmixCbKTUl5ek0Qu+HiKTdFNUz/mvJ4nR/oj/H7hK52susTsCHY0imQhRnlU3DnxLbJmVmE3aPtCrssXNP6rn5boFyypMrzGicT9FSZ2VEhNcXDwNBQ/AlJctL2yqr5YYTyR2DQQ7pYcQE1prEjURF++6AmbRRFnqs9SiXmxTZrT0WxU/tigSt2uDauWeQ9jys4imUhK9CwgNop19i/atJviDq2dBMAPi5TpiXmOAJdWy9nmbkpu259IXFDFUqNCZHzTFDS5X+iOJGvunMvGwMYuuZp3EuqWyhvCmRQBSaBwU739JOT8HJZ8fWrO1vQ5yNrkpOkTw/4RoW2HfIMx0d+Ynre3/G6+OTODOb4fAevurJDUNXECU/p8hpufeFftORPa3OzN6kKyllZaIbqZuMttp0sv+0xuO2mr7nWz7STmFSrOdDMQ1s22E4zXQH0AFLCktEJ79Vnv4rjkn9SRlBR6qzJK53VA32H3FlwZTfuJhw5SN2+z8xhkeuigFaigm2Wz8jfeLyQ0XV6Vwb8ya4ocaCSMEz0cJQCJ5THuSedC0tiDIIPPSHwIAvhOLlvJTVwLTJeM+2La7drpMU1n5vIaOp1OVi5fMLEALJ4rFuEsuKRo3XQ3tGw4jXN+SVZeDU7ly7xN8rLDf/jYkWrk3NmDLaIJb9yuxa9R5MFvEFttf4igauk9cgOc/G0+8X56NCRNmuEXG316INXvm4BzAItoIiKeh+x1N7dWe1LDu92mALhPES2ehUQ5VtbZpWeGScqOS+xMZ9u2QhD/VA+o81C1J4dLF8/KzKbvCg5xVwWE1pLzM2W2s6USBP9w5IYmkJaI25KJ5kyLGGhws6qn1U6DYVOuowx3+aEKJpjU4oU7ZSiHLC0CN3bKeKMtv9t3JFepF89uWPNVn56HhbiJ6vfGdDiJmxG1kZkDWecRiro/S02fY3S7WdiDvnAq1YeO+okFi+It7YQc7svQkWZMrHzCW25MiuecDX00iXs12RjpoKCjM+GnjB0VC4huirCUJCQsK6NETgfUhC1I7VY+mNdIpo6Y2vlPc1wItwX/lS3RO8BXNgBO+JVNid04sp1GaZWR1Du+jaU3GWvzMrE2JQLWkswPHGFdLDohjcqy2r1FLB2f3ntVhP4BC25hd7ux+YVOZ6GGLq3ySQc5cjpqoIQV/5KMGrA8SRNFtTHwYCRgTGJyx5KEgded6s5dEeV44h05PVIZdiYqUTXogAQwen8e88v4eTyI4AHqg2BNfPbUmZpkT4bZpWlaruMZxSSu7hm7KyMeS0jIRgqNw+nE6u2+gwCnjgnuyBj4iR+njyktCb4GOk0ky3ljoK5FwCVBaZWSBTJdlpgIzGzltqiQiRyaGc04hkkavHmy0gVaF0dKs4MaogauXNUeMhrWmVhiGL9Mvvbwn0nCQS39R3JSACHNMKAToNtMK8BRaKpT81nU0hPX8lO/Nf1fHtgopQYOcG9GmqdUiYcRryNrHE7bvupsfHKHbgazZNdIoAceltx5E9uK5vnu5Mgm24YXeONwsMH34eVb6RY4RxqG/tlkdKyirKOxeuywg9mmBgk4tLRCva5LUCJAMmWMZQPmlAuseeYeeOenHtpqvbicBpVKS8KIaMFYxaxC7H3qEaY2CPnDov+1YD+1aRCRKrxbOWUrYtFWTO9hTM2ZE7Omn+lkDAJCWXAus8+ICsZuXDTs57OFxqSK3B6NZOwRPHeg31ciBgXP0z8gnye5TyUSj2EBMhlO/zkfi60sud+fobYP6iGbxeJ/LtN5f5da+a8l8jT2VcT1XvrLdaDPhuJnoCkCTSWWAOdD9c4aVumpB5qeyk0hetQmkJ287dl8FkTCLKZp9X5SLCWx+nxPIr772Qzkzx1oXDMrf6Py/GGrvRqc4ucEgIOeBYjQaTiTgh5cFCQDITGZTIrlYTZztg16EitNwlKtYufSF18Ka+C1dstqxN3pjRtV+K/oo5ItgsNqWPpHdB+VC5i/wKaVYph+iMuawJMb6pa6d3TR+a2KzZ2nUxJrUNYy/4ygKD1jdnTzoiKeWzOZyRcmtq1o6kROBYgIPbfyiI6LUMmb9EG0RxSS+cInE1/oUiOoxk06LtfsEZ8zgAnF7tZ0Sn4XnOQzend4IMCU2DuYN7rpAk+kHAs4nMlZKQrJRFNF+K6E3y+ApBPUzDeXaQ/gDI0hd3nKNsDqtCSgE404RTDqVGHejPt8QAjG/w1n+urXD/EuO23JHQe07zngOcFz3UhyTB43JqqkB5KRjjMbQnME4I58W28QASYSb3XaU2f31a0Yrit7oUFFv9/la1riCaQiTuKKZOoZNYOiOpqYSVa1otqKlT6rRu1irEuFx86oZikqY5amRzU888xDoJgAn5UuZ/QVXQSo669rlpIKGbalgRcgQTDjvi2+09mjFqapdn8EhlQguAUGD2Q0SyioFsVZcWCyqpsodd3leyy9OjAqJHwy7A6DmosvBEm6yyyTYEW8hujYFPF4UBuusyNxhLCvz8xgAJvgL+s66oDI0tPWJzuN2YlWBocRRCnLtAzOC3LJ/OOP9jg5vneifVsB+oZGrIjLCOui+d6cF863Dpy+oR0r5dLCmmieS0jeXODHmlWKjh2o5KyCSsBWJHBVapl8YzDL7tx7r97HTPPrQavaP+hW5j2nNI3y71O6GcW0dGD1xcZkmf+Jb/zZZKViBlVQBpQXzALwSqV4E9FnpK5KUvhynU+Fuc9zCfMdxsGRodoYNE13mKncHg0P6CIi9jQUMvfh6OBgTcQa8US6L04hidV2gjPVubfygeEujBVmK5NAeE+XVshx6ptqXtdD36qpS22u958RLOKxOEgEOYxaqKw8JrhvtoUfKNFA/7BrqfEe39ZNNZvzH42hXbFNhbhVMgw9EHZwQjZEWGpgqXKq8jz1d5XGMeaZWdA61SDnb5E8vwA5ojuMAZ34jkbA1fqTJBw7Mtac12q0sRD63rrseCwWEssayoGdQwTFUsSJdBgWuLASJIMcVkpmHsFmiMU5xykAr2GZOVCJqybg+NHFNk9vvtYDF2ypPJ3U8+ICGfIZ72RzPSMBM8VzFo+1UC3QYkSg1PwijQ/sWzqwd8m6Xmr5idOBu9BRZWpgjIuXVHGSBT2i+rGUSCajb48boRtrxIlMRN5XoU/7hsL5lOvKKkozc1sZzjadajHwQNnYbnI8rs6+24eGI4nN0kAJiDC/m2MGCaKdHwWZP++1nTwyikTV06YJv+h9r7BUc83ZU8790CLiC1LNCq6VpC59329a3s0Y44f5Rm8qmJWn3ZeHtv+3lrU63fTWG8GTvME3ye33SMLy5I2aDqV4obRdxdvHYRk2HnY17RJS/aDMvmUxh+0kWEyFm7rDCkqJYWGaERPdhizG8+yEkMwaIjMtz0fkIRzLpTizt/I4CnzgVDpT3lCTjAIfuLb18XAcTVKuWd5i9Oale+8ru0/9ZdubMvby12cFp6nTda7n91Y9+lU+LcUBa2I2VZ8SkpLQqXBa4k290E+oYP+y3CRX6ETBeRuOEbnxQd+7o1vANAWN/GGR/Ep/P65mRD89l++RiWSwryhLROS0sTrinEQeky9b5SOif/UkQQzF+yNLSC4ROpWeeD8l5ttW9HK3FUABW0IkzH2eY/FvGOGT21M2YExQZk0myZSAm0E8OooHrnaQnsOaClHSflDfGxB3oZLvW+vtKwj3nhStkYaP+wFgK2qjIFbfxyuPnlIq4wG2tXWjbH8hFA6j/up8/isnr0tZ/jabNrbNXwbrlnVk0n1fA4es3Fv/eXXbmJVqjqUAsLtvJMbjWT2geWpSnBFpKYsWmQZikNSLTGFEKL1Y/VXKd0kIq9q7WoAWJPQ3Atq77jkaufomf5nWNFrD3dYnjJNERp/13RBbTl3FfuZkGEQ/VvD2F1GVV6HNzbKBfXZTPsFODgNt98nDKwNT3nHwuA5IsP9h//rKVSH3zpKv5oYaF4naV2JfK6WrjZnoVfT+T12KXhu/7Aj8bDUHOQlAxeQx5id/6+DZQZ9e/oNt7KoS/ckRsm+xEjqbwTm416OjcxkOmy0T3QBOOhq7EZiAdEQBLcZ6a1O36mq1YTTtn3JjtH96D0b727sg3r/hhHj/2naI9zdbALzDpEM4liM3tnA13yuzhrMgHOJ+HSqFYkpKWdx61rN3K/y1zdkC7xAtyOpwmS9MzExbY2fY99HNbvRsY7iTYf9QiYbUy0irRue/Aru+myR90jlgf6Ohy9YYsJFcCoL0Dzgz5hJZbfAxYj6/fsa9Sq752IKvz4/J/HlCcz0ikobozMNm7Sh6S4kFHPdNf8UijRoISGDlxncItWO9RWSF6jpiOK42KAI5sBiJPO8QyWP/bI3dmB4vhb0W/BBrnZtn6gxHpLS9jAGRsMna4F4CRVNFKTXWR+tfXr2Pa9+HC/J2ib/VzJrTEX1UM/87NvEMIFd2FVRDUF+g9tBr88LqjC5fZbzg0ZROStNMAHtUySGzijaTaj5o+Jww3Qy6I+eG3dlbr+rjl5qpwIbMS8MBsXqTLP4h2hMziKbSMpjnBoG2OjZkPh2lBWhpbUXWXMw98EgMutQcWit7NpysQFfKyq8mEWxDJxLCLJIQEdByWCAUEgchFRo4nyhc48ytMpgtwVA4Dmjo70AOkhRDNAuajTx+s6EG2e5aN2olKQxl/rTF62VGy/xwWuonMTWxC9NeNhpCg80FyDO4bmOZbyMUfrqIwsKycZivUttAIdWh99AgesNe3UtzXVTeQINUTrNUIIUsUypAATfQE9kXQ76vicSr28mFmA/2k5JMDp2oaVGGTpUcLITECSM65c5S0aq7iKVq+JIXFzmXBRXiMYAtglmZl1DHTsK/AIpcJrl5TDiv07nN94kmMMtjksF2CBTwxolcjsCKofJKtUHKzTuk8lE7HJVdhYn9SbRNOAnZc68CqtgUTWb0P9SwBxyhSRIYmrJyG7tyIdJLhjnRjzhw2X1Rv+y9jYvnZ/sthCoPc221fsVYBtdQGjBk+E1eCLXwP0TFGGRJgm08hqhwO6F/BnmOBiwi26amNq3kdspwB1RcXspu9Nv3vn8FM22kPjikZUOu8dxOfRCtzertY8Og5tmtJHM327wT+pwj1bU8U0YtQbqnoBTkhvl6rNLiibETzwqAQoEJKnu4BjZjZx2Jh7FUeq1HB1gfMiuTgs322Rn/YQe2nDCbARuGpP8HO+YcIJ1FRWFHmGTxzpgABte/wFvvqk0AvKsG4QquafAbntMPZ/TSOkKIW8QJVfq5rRIzvRlKOd0NMAjKD5pJBr4yJwlvq/2T0BYSXGWgJTReNX2jhrYeAuY1gtQLHf0g0jA9B/MTDZ7BSsd9bX8f5BN5sBImqaipzyKR/i5j1oIJVrvxfWXnSt/a6zo0MnFgR8xP9KabLRMUlfKcr8HjLUKUi+6ZSpdGuOlZw9u+ojN8/8V8KcnkDorg8wasuur2SUfuzMFhvukPnqIIK+8qve90dFARYu/2gu9B3R0YRG8/BEMQjqFntHTztPXQO/K4xEnLXUcdhZgyUkU8XpVtSzOUrPcUpyvhE6w73w2aW4uqFsszy9r5jxlbMbC8wb15hHa4hY8KFyN/D6rccN88atRpQ9NhZuZ+XOcbR6QDQ6U0G+7C3mR1YnQgQqBLl8L10LFRbb0TPc5hm6abVHE8rfZeeufYofGvKMveuZZHflHbvFpvTxj41mPnhuCUD3I+UqV7Yrq5NKb3y3ZNnXGEsxGDbCk8i1aUe8Sb5pmQsTJQmQD6VBmAJx1E2AwKVnS7ApC8zvIVnYdvUK1hVZLJ4zZgiKAB/yLCgYFRZe9dawRhLd9ePHhqnzzkRy7b2dV+raW21+vF6fQ127m9269d01b6Hb5gOM+mvo4Rl/glub27ctceeaN20fQOAhgCm/OSnDvj23Bj/xn3heq1HP3om/zK091gAJvZmL110pnB7RY5cbnvcRCbRanEf6kZ0rnmzexCxRnS5xUUpwfbNtjHkQNht2XcwbZF9dirT+JZlPqtx5EjOnnrEnAcAoAQxukvIS8cpb81c5GnllUnISDgf+sifIeNpULjoaqoCuMPdFwbj1QjGeLz0tKdTY4kKzJuX8Xk3iCRur5i09ocHOJepyb1sZCSqpmPyGUXw+kUaZkbpmPgSeo9FRWE+gV1JUUWpqOMyK3z1pMfCs3K02ZqsGHYuNaQoJPOzUXA053gE+KrX9FlAvac4ChyffKebW85Gbr7VVA2ekgkZ7A0BPHZujapUPP3QEDiWA0oMc3OmM0Af+F4XwlKeb17lTPa5hMDrScsvoPx403rMW6b2BWFPnbwT+r0htWzhv34xGr+3xKY1rByzTHjZjRjc7pfJXYlbJPjS99aTmmSK1b47jPfJ7ekxNTgfueU606bTeBHQEjv5B1C7mIr0/3K7qd23VZGcUAYm92xdUtanWiqcEDs7UUw9/iBv+R1YYGXzvJTWGSE7oVVuJOYS33Ur9I4R4FYx0sCGWlJBKyC7aMlmgvH+4MABxl1UimxRZ7gkkktqNqWOJzGfA4xB9YSy0cSgM6e4OZmNuvIgO49IRZLwEY2klFmHltYsRXS2n7AEPSXX4/gaqJcXurNi14Ua4WUmp1gk4j++UT4tXP1BQUGR11+luOkm3kTB28QAgGKfY5/0TsraSWLCBpOfYdRvJwwv+X+1KXtVb/JdSlNtt1bxlpgIp83DbniGg4/L1tD5HvMbPGCKfIkGE1yifXAmnxeugSRCWGZu+K3EAP+pzqIoM0i6daKndthCcJsAvI+G95oAMfheaJ/gBRh0c57njI+r/5DUK6JkLBMxQ8QIJpqP9FuCHRn5Z7Y010DphbhU4i4+Ph74bVV04cFkSgns7Vi56MnZo/mZzDTg93qGJXETFBBpU10ZBUHzCnjszLDuuNZIdZ2AI4mYG+Fr/4yElBbCxudYd6UhLs1+8AMU4d8IyuAsgE3SgWkigojG8i4zF+r1WRVqaQ2I1YZRK6GwJtCIkuD99Z8ohq4wMEZFoApAm+Q0BCqdGv9bAOa5sgsrhT7bBHooesP81Uf7CnduWWYNYE8QboIsB5cMJzrnl/sN9jZ9u1efnvYJA1xUoLOsGaTEwH761AKEGEaIWaXtPkWWFWDsrNoWBvyomzbvV7B8ToonwNtoD+SxUA9Ymhnmd1PzZZ7LZNp0DqSJ7RBFYs4P2fC8HpIRnowERD3Ww9EI+OQQYwZLvbguiUntoB3rT0yDzMapMm4t51aJ/KhSHiGk6q77psmB0mdkjTQMUnvnUpppK2/m2XoepTaG8zTzY+X/W/i2bSbj3uDqYH+sGnnw584HQkwW8tLuC/uAx9uKu2oYTXzEdLt4bCJEOosYwKQmKzo+5gYsRLXK5rVQb63B0JEcmxEb7ifEfEiJB9UaNpUF7WZiqI55q4kxuWyo+n+J/fy9rz44RAwVognfOMizwWSmOLrgPShHArAkddTlkEPSiGU1Y/fkdI2xkY2UlyKNhRcv7s5tAgXLfhfPabBUbMiOUlXLlwuDnpta3rLRs21VfR4Dzw539DJkaokxjdp/EZT6e/P4f7Kp2LfgkD+26jqlH36z3XlAfRv9qH+z768Ed7Rqg8HEGq9ND2k7v6646VvZVVLC+Z4ZOlXmOu7uDFuRKVYzfWY5XmWIo2u6TXlgJjAyoKC1xSV1UsBlewX0fukvxQtpG83QiK04BLEmykemKV1Vwzi0R9FwWg5rBABwGIpGlDkJS6WJIRHnMEoQCgWkRHxdaPWUo0b7GZMVCAGz6obSjYN6c7qKQ9IKnnT3/EL6J89ztLMUQsvq93S2HVJLr0IujyP2++QwRgslrByI4J5BHy+AwZsyTxg+sZR+QfqPcT71PnrqUYkG+ir0kGSdOmYjTLa7JRkNgFjzPOCV8el5IejNH72Je92G2IZ/GH/0JVfQ9Wu41nebIfMqM52GnGkGoBzECRtOrBH3/TjXLxXW/azqbNDCRnlbPH0fQ/TUsVenzJKqUk23lj8bDmh6K898f/7gxGMYHQH/dOR7xUv9ReUGYNQrNlqZXMinKlfrA1MGY3Ed6dtq8t+wKZYFLrizU77Fk3vMXi/1RZ/qtmbIwK46k5telMP740lYreWHyzv8uOgxb2bfrJCne4JYP857/VWdTZVqn3Wukemfx0MrHXxbot3T761A68csOccZnNDl1wcgbIIvRzP/tvPZ/0atBOHuP65s1aX686mro9Am7b94qw6ql9gYyt98f3+TJU80Vu0kCNVq9YqH3zQ5q26W5PbW+Wnmeu61KdvuMrJvAK5v1w9R1L4SywhWzyLvkjjP46FO4U54fjGBYE6kdRJzaMrvsxh/pj5Ib+37SqPyD8jkidH0AfjPZ/txFE2FZssGuNny20mO7aHiNTz187rudlY5pWFMPL14Qr5wB+Akw6d7AuPO3FXqXHNJ6s0jK5JC/AMQ7Vn7dzxzoNZrWDGE34dYDZpeBEwDk9HuhlnYM7u3lt+k+A/TkPgUUDq+MiENuaQTs6BhKqeQX1qwI5CYfPBHDPtxaUp6hXDz8u0OnG6SasA7a+ewR1nWr4IMs92GmxmLN8Q0KOizn9Zv/OH0a7s3WLUqeoc+Z4Z2Vhvw0kSxJfLnN1YqIGiDl8nAcQS8sM19ccVXRpKhLj8MlDSCDkysKhDzYn61P8M/UDxmaZDpaCG+ZsYNhRFn2XRAEJAiwsG6KzfQZE5lN+HwwLn5se06HkGXQD1BUjxCQeJAy0c4CDbYraoOQ3R8E8e9RkwDHV3p6xJ4sjxpgI3SqZ4lcWrMq/zXMoZVmY9blaRVoCrpNAiIzmTrNZ2OHgK+7ZtFQ8UcEFo9tMT6HnikTOCu3BRCQ4l5NB0Xq+R2CB8g8KCXZ1ZQjhqQ9esbsQjBybLyYcL7vy98Mq0dqzLklChPhWWTwN/oamnBJOTrwOJebVVQXQy0F+34P3u8dHuAwvybjUzZSqDgzG7k5N29BWwtN4oS19ItXZWy8qJM30SByzVxkG0Q+BVxo3YghKUQ3UImavJdA6s+WnOLV25YOYFztbp+RvMN4RdUuYPDSF6c7JO+5Z0owSKkSa+xcyJzIRrKbzOU0ylzfSbD4TMua55ETeCqiS0sM+lREquTh/KZOXsIonU+X85HOkK5jMxIEnNF5daKF4oDWx3Ng0v9UCOWYpCjl7e2Nl9sE9UfjljvmPC8o5d+ZqVe+Ipy9197rlEOO0kE3sT+/DeE8d5Y5YsEsqkgHv2dEG6VzN6EEhJuqttw/BExjTcpFUE/dpUM2SmD0nSDp3zRJIpDRKM4EnbrI0uAWTrfulbDC37S5ZeMoBaYwyT2grdOP2Ddb4sWem0XlzZX6as1IHBX/gr2hdjSqXaHCSjXDI6WlfmDNVi1EKg7Xc919pbMSdOA59ZVno0kx47s/wol2Z6TqfEf+BVgfNmKH9w1pngIXjXI4OX4LbPTKk9IxbFi1TlaG4F02KL5GHLsyLWxSzMVOJcb9QhgvBAQHNOJabWGHwKlcfndOjkWGq7CWobs9MJv1FvNbr9ip0amLmz7W+PZUYDKRlvEPn0gZAg6znLt8864WgqJ2NK5fXlrY+YvFvO2XsSyIQGTmalbnqZXThGEb8v6qcbfJK6Mcp27Qz/Z0DUSjqxWczv1bZOddo6omTq5mhIrKLw9m8Kofi/u3S8TZDGYISEUsyNv1L092nBOnxO219QIqCi/YhCQLC5tMggbWBhnvWLojpN/QuL0AISCWMyy8WoPMgVpv3Yk7SWVQiPT41TApJcnYEAJWFcQQW6cOf0DOT46oSv8rG9ZcZc5shBkqypqZsuzLB7p9brrHeGx79+PGRYSWjB/VJOvWdrGnbg5m/ce26m1JyifY3X7h5IfGWsaVaVV6mh2BzHP6HMHCPNKEs6tLkHbR1gEe8m5kz+eF5GrpIBKyel3QOZ6x7G2Jxa5oWJspTFjxoeMT9e6wdFDgSmKKDdnR74ROCpyHXkiRbyNq/hVMKY7/uQE+3BoUxTjrs2T7Fhbe/aZOsHypkOeccy+ND6mXySXthTEt5L8KS9fSqMMkwvxZgEKRnPAGgIfvebwvJcMe3JIA1EucyFjPfoJKYY1TGTRy/OlW+pgDADXgzq2/qH+198cSzBrQx8q/xg/ty3BwYqevB8lKbGJ+x1HHN2FYNqKB9x4KtSq4l6TD7RzTb/jrqZv4gJ+Bw7CHMygxTFi2D4sYVXi2D9VHlQ92eoAWVlMBaH9wwR7fQwMOp9L8eUvI07aFt0R/lEuzXWXkW/xiPjaPfIjTpmPwn7BXUzejDv2o7vJOpUqKieXlTPQWh6BRKXCZd4CuhJew+B3TUbpujO3cCMi/gn5HLC/BmlSwqAm3qObyBs1qI8up7VTmyyjJ0QZqinTX8qzH7QVcqPh1fz2l+fBD8HlnYeOyhBgBmFqM262lLDXv8gM7c9NtI2PTLmbut+fWOvvRUHkE83k1gMhpXgZLqsAUoZ1nyP3kxQnN6dfg/Nhan68TiaK1FE7PTgXK/U5tKtC8OtU8MXXKc991XZdswNTeSFmh5jImH7q0s7z0GuHBY91KjEmqmUudZrgQFKhE6AcJvoTSVBUmDR2Yg72PkoE/u9hzXDEFeavds9tQiLhlkgnWct5F4IdjSB0Fh/rtmJ+oVK2EDu1z34Y8czxer87H3KKikSCHWS1sr/Yhu8VLkTRpobJ9N8uU4zl8G55kXf3gCyzjmJu9qqKTGQ0CESR9savfdrOJKtNpRE7wp+SK+4vUdwwAQlqEZ6M+4ywcRNGt9KomFa3tY/q2ON4G4wnik/i2jhBE4XgMB1ns8fmgWyHf4LbTMfSI5+ssEf28oxckT8J72s1tcx+57gx9V/kUtynXSbcwFK1EoPc76j2fazpn++1rhV1wXMz831BRCeMrT1FHJeoCtoTnpnlrFsMCdcHC9lkdt0WNSQ03adbCDJaudjbX0hUdYdz7yO43Qj1OZ6iLYjXRbb1dofoR/PldfeT5zR14dqReE6kyMJ9zaBbjo8kU7nEM3RdcdpsaaN4RjJe4V63hgPtdcxyp6k6v7jo+tVVsnybP0MK9Fhwk7wwler5I3JaLvLKU+nMnltRWzZpK9B1tU3H6Slq1lRcPAV9gaxZkKsijw4ip+FuzsCxh8Fj+X0lvgnZ0tSNW6Z9swG5r0LwVRACa5uvCq2F4MhPRZhNX+JnqyioYOIsFp+Q1eX0VBeRFgtWGanauj8ToDFsRC9cTT/TxIGwUlAFfnoU9IS+sD7ffJYaC/tPtwsYpbj5/M4ObXJ9O4tOkd8BVcFkZIp3d5i3x/7Qcfq+DVHk948KtmV29o6xJ+jBiEUXWdqfqtPB98m/4tVh07rork419sgrviU5YcTZ/EMXQctVxpXfyhX7IdOSbwzusMaTtLGDmdy454zfLeSbQ3ybY2gJz1bbpTtnqxNLD/mjCSwCNFIRK6TRLItrttPGD81dQhYrV3Lk+wU0zP6Eh83+T6rFyrmh3eAAWc/mqiVKiGS6fj6SnlUokALVbNnztN6xdFJ8bqVz18XpAaFN9Im8lx0jBB/8EguH1nxWuYoNFkn62TCDNdUhw2RRrjSc7wt7HF5umGtEjcb0w1bjYQ2N0smw0qILyTgsWMvw9R4jBD3vVsXxAGhgOG2jw47f/fEqqJ6MRpGdvinXUeEJ9qP6lGvQlNPwgP7iQ6V5bvt6f3QhiTQARN5mSjeE/BUU5P8LRgeO5ZoxbF6vswRVJrIJUTho9d0cwSgiCKJiT3qZ3dVEoF1RD9ioRgkGh5aFnL8Oej3R7zO6zyZjCb8w5FhPMV2NZ+TMNFdGWYlUxfyiQieYR9/birx1+vYip2dHbNv0Lxi2s79gjhwSjmfwYLY4qCawieYLXPOQIZy0PDrhIW8qVSwuqVBWIGkBkkM0Vw4bV17g09mC5VgIxzK1hNYs1ReZroZNffUJycb2ezE7NAYFvhXyjLPtyB2xXNF4lx/nu2IURhztZ4omcuQQEHoFGpSFB4qWuj8GbDlYZGIzLPoHFNsAdGWolKMW8vcnGS8Kimdyam7nMAMUOTCosS9SHQYo2/9vDWc9DiJyS6Ewl3AaMtcc+DQhtiL4QvaAxDm1z8Y9VZz8djoaC1VgyeJI0X2Z/KJum1d9MQyTmpXbBn2cm2pWs3jEpejw8MjMuf2QkUYNzVeXoekA2E0B9oExXdVqe1LyydnP2dlk3/I3xMyMTPO5ue4zMe4m29g1NdsS3pQNl6XIIgk9yQ5ToqQFItXdmcy+UgCz4+Tr+ZDUu/fnGE3Rg6hL+O58TPxXDit+61GhFy5L3oMUMzvLz/9vewe6Afup+n1e3jW49O8912vD7O+uwD5iesXL7QXXjn6QDdjo3/epQ4aRxs8SBdvfpdGivIhzDaUOoZqmSqar05i2mxOebqJ18NDxGNHodxkMltkN4ZXNF3TCtE1wDRpzTKppsEqGoDdaNHv+3C5HCqCHR45287W+W1Zbdi3ih63a2giEsmLxYqjV94LIfmoQfCKYW762UqufOtW1064Y3yHdarbH+9qK60n+h3T0Bk3tBgVjsgUC7jk0igndGNuVoTjZBOqG1VjngyM6vcpkEnilbXA4xs4KCn1S98PGc6WOdtVJ9ccGLSP1brBGmqE5j9W16RAQpIdT89F4BBHDRks4GNDpCJRW2K4JN/1FTkZdGTShok9lORYpiDgZEyDkOoXTf/l6c2LCLKCaN3ps36IyfjKbKNjji4U5s/Qtpx06HHVDD9ZJ3sSJ96I6kHkY1Px/VaBTRj2JalrRJgNrHvGpu0YWOQ93jrrxip8pM28ZSLu7tHa5uV+wORPdgk7r0dfUhrPnv30XLzU3EeRJDQ8FKuJaWXFZjN/vdLGUGi0SLb7YjDS6DbEjlW6vpIYt3P7wbK0TNOonxqXqFEe83xfUObRyufcM8Uwnn+Zucv2G0QerebiQ77TBEjvoaEcounGLH9BMV4n3000i5Ibi+jkAttdJe1FSjUzzuiVgg0rzapCUB/JXiRSusZSCkRCK8lNLe2yCbFzAtrgYoxSDIhWRmVQBZ87N4u6gq5J+ROrb5fbbbXCXqzUTaWK/Ypr3wzFKytfm5WioMBbOUuekhHGEthXpINSugN2CxB/26etFxQ/ZshxMsoFc6rhnn2/WAS5QHmaZquzqrrCydoWxUjKLz33mJsb+8rWr4xBfiD+rDAG1cycCPUZeHJhoSBHRL92q2y/AFGsrulaXFyRRCxolWm/SuIUGV0mKEEvjSJGYtwXE4Bh0caavggNDIjpbTKjbF2C5Yl4JOz7kuhFNXjNw5AxeLWTe5mQ1wUBueFBhTE+XjKf4OZflsbCQmWaO2KWon7z1oMpx86MMrNqgIvQIA6VcvE4XSeHN9rzsA31i4nJIGKMQ99ox/pU5sVkl4fumLUM/SkEpisLkonFB21EKbL11S41hzHRLRQArvwbznxZefXxkuAqEgGxum+N2qQc8kwTIKQG3/I0QeWluT0CCsTx9lSDmLhAfMxYJKYVaRpuLkvcSXzuUoQCoPdA31CChv7mQIWR3FCP470cKrGWG4phspfD9QS2a0AMztufjA+Vf6+jlJftPUmahAngPZtsF5vBAbuOW7ypvNeSIsRo7Fgwj1HSnAhmAaf7y5Lc4u2Olvdj3B48HSM5YHxjT30kbwE+ZalYPIxgLPpvvpARqV+x6EuJMwvnDIyNjoMVcJZ7WRKxBYeV4R5BblvtGTmrTdsIDalUKCEivqgGP1qwXQODaQVFxG2yC8Sewj7VJ5aGmeV7R8h0nRqvIKrXKhF+pvzrmnm5letgiSerQfs/2ZgjAfzUKQK3EG/GKCTi9ePIiduVTJ+N1Px2WU8xbx28nPNfPOwvx5C4AU3KKLmAtBRXf+iv6JeRUZEnXuobIzD6TXyXM314N3SRyTyIzmH+1kC+zLsAy0idbI8xxz6BwB6fJiAuE9Rt83aimiEq4PQpJPN6n9xtcsfYdL2FtBUoiDoesLeDR4gcR4diZVamd6JpJEO+TzH0+BAgkNDbY+da3FrsPEdjPHqs/kCxOgOrSi3A1cTfX2DoqQM4gKGZfg6A2oaIDORNFooJp6kD6CkNdUWNtLORAnNZMfKNjEK1ozcW1zR33zDrR5fTNYnBeo3CBUEwH+980KCWn1un5ECcxFb3z9yf7P2fUc0WcV5AVwGcci2O/dJVjJ5P7bcD2f7FJDkn58hJQmpmYDUNmyIU0aYOWXjI+Frv9CCBVe5PLyY4M9/cLMg4zg5rrDLi+h4mp74gJ5k/mmVFdockzhnVTGCPQhCJJbY9s1SHvWZ0RjXlr744kS7Fzxu/PDE9Po4wy0fGIAg3AgF6QEp5lq9+wuVwKWcf1Cxn7dlZG0wuJLksH6sF9yCXxi3ePKB/axfO+dL5e85/efxjKjCuMsYvcTGntc7h8rvBq6KTEr9nwg/ruhaBg+DkSxa+lfFNJsBSPOgO5cc3eEPmnnlbTfSWypsNI826+QCOo+dEGHlhuf6pM1yup3dmnndyyBFGPEeaVz7ZxLi/t00Ts10LXLOoTvjYHrBzsVfdjWSdPNOh+9IAg1flALydCKowNjTf/nQH1ci079B28Mi7MD7UrwzMBIjv0DsgBAi9kylmryOvKgmiMjwC+w5o/c0g9x9+J0IYwnesC5IPum2iSC/iGZy90+y3A5Cv4XdxTbAdD/AUydj2b+5nDBMQG0MpzLU2N9sj5YhCxlOQ+D5fLRVbzcRMfFK+Us/xkMvRbBRRg33uHFxUvkgpCp85RmGxuyJe4GKmQTqR3bNRNLG7JyDKPb1zTwkPoQMQw/EngxsZQAIumujZWSY4egqKLGk3FRqytaPq/TN52ME7jYHrVX1wL99JnwwB6/8LeFb5eNbeaWz4Rr1axepmm//L+WhY2mOHmNTsHi5iDOjqQiqsfCa/4o98Z6u3ZS/Ka8h1u/52XF9Ih7aenmKCoAwH+mTZcOFHm74v60GaffPACOOsrCfs93jInK7Vi+G5O9ZF8N3Y6QrLIVe43N/oBAeAaszMe6rtnNlaSSTfer57T94UcK8eO+d4phKwPde6mHHee/3T9aD1yTX6bDK4M0+ODOU9ARn5QO0TaoZqIwwT+EdZv1STbqE++SberA6vzSODz0NCz6n/ekwedXm1+d1sf1MfAu9hvWGXpe4wx0xUdoLAM5biLIwyCuVzZFQBcudVfUXdA5Wc3WwAMeC3eqJgWA9hKmh7H5pxGml1VeNc3hoWqiJM/rrQtED5VJXWWNlSVYe+RgNn9l1z5cTdF0XBzhSzNatWMN/LWKzSFi/G73XrtcZrunqFnUL1vCcH2YPASrp4GRuizOffHAnmSXrz7gGA0jf6ipH1jZLSWf6GzpXtMXS0v7Z5r4i3zppffYGhfLR4beNbBMB4Akp9evxs88j+RJvXVpf7hnLz12NzZHNxunblW5HjtyYRjo5gn29Vtn+4vmzrPwc8HGrbQ/QhCU9lEnFCDpO2PZlK3FycHmCexExyseWtiOFkMU1oHfdvq3fR0blLaQbqxKPqZIqVKjteGNKLyxi/JLW1eEix7xjHVbizVWBdR7VrQ63qhoLm7PezAwaasf1PmO1RU4VDleJ3k2+PFgtnfuEfeUc4UO+Ze3tIrr8uJPX7F98VNsUhFhF9CBxkNCxxHz7kYBaABGxstVVNQlKTuVBlAoYy5kGNMVKEueJI/HG84WwIQpBRv6amJNJXoyWJx2Lit2hCibL5DsOaVhxAKD/8HR22f0b3CJ5BmFF9PEdE9DIcwho6rA9lQJBm1CQiA40XOOK998iNRvqXpplm8+u3NWC86nupFcCCDEv09XV23Fymz1jntSuYn/IMdghqE4XgtgJeND3ezzAzT5ODKODp+r7aMC1Jh41mS9H1UqARyMdvsJuCT6i8zWnjMhMGwinYhgcUs0fyx54KWDzREseYZcds5+oabaPFU81coOf2h1DM3CEh+m947iTDKwwXiQiDBD5kbO3F4CuM551iipsQ4U5JTQMWw2RUIisYDoLGjLmwGG8w7cVgxBg4OcH+18/8XHw1IN6j9LvYpijH+pOgi5LYeQvxaqVxlBltKLLs94Dm0zxcR5EJFd4y1wfp8WRUnhjzUJyXMK/06CSIp7Zuz+UfQKEKAsSSIQHXWAy/47qVn5aWHI3TTumDxhlr1bOteGlraZD23vOcf92dzajRmyIwP85eMuW2WEbnjSx7c8Dmcl9lEEBWrvoVksHxknmfZ4iSFP4aEwzOTspf52n0CI6X+3cCcb07WNrIHEVEg6Bcoa1iMRoeR6OSKLakEI2KUnPXwJKqVMXL3fQ8G1zaiVH++ZECMnRUCYM7l58LYJLV3FsbB9kssOpBa76jS6PqYkRsI+NiOM0sXZlpXKybsf58a0OJ2eXQeExxfnIW3QrUzoY+fIt6zIy7D0KK3MPJYZ/oYsT3P2HfEPCAh2EOZzO8MKDoDtLjKAlq6twiRrVBKu1736PLZLRdxZkrWEjmlHrAc//Z1vcL5QtaqQJT6eJMHQ/gDnU6p5nLheEp0tKywN1uuEocjkVCD25TvvbsD7Q+xKbxAhOT+sLNCW39aCzyUs37593SVIp+fek5LAmQL4Klp77i+7WvLu6EAuH9qkiAfoUhxeCFy2DS1wJF+bsPvBh4GfsU+BRP+duWINsbbQR3AUmwbOqntNGRVXqdevZrKr0qfG3lmcoCKgsuP/31937l/L4NyOVj6/i5wAJocNfTP2XNWZdduSpIfMybMc/0kfnIZT+pVjsJ2KcJDjIRmlBRVoi8kmxXNm0cNU8RpDMbJwPbXv2iqxx4ExLgLKjSuRuzYSlU7JnzpWVV+65zMTCr29kWhGZ0ORcTgPyAw/4c/FS7rnvSIbCKTMCn0UDvT0yOl9V0x70hyQ76uV7jTCF0reZpIPakll64+TpDEvjMUu7WCYK9mfBLnP0NEj8yVMnqWXj/26lGcSMdMIWKsAo88r0Wr2jRrc76mvXDKZkG9a4ba2VzuWG9VJNs1fENeIO1qsn/ATm08b3SZI/JJSv+s2I4WP1ayiDryDtnnQN2OAxuFzeTz7vU2GGTgCa9XhyKwdRvnGJ7dwlPT+ED+xU3v2rPr7fYss6ewAXDLOl+ovNXWRa+8Ni7ccOOep0bsI6zVm/Ou+lnxic1wo33KKvqItWlDMMK/kGW04MGW506lNNQv/F8udOSKz6k8iPRBjI/JE1uZL116sCoZdFTn0oln4yt/hJl2J5+nf1Vn3GX1fEYmgq83rPZ0oh62QVSbuDQvyw3hAWLy7Ho9xK199HFxT5gF8UVBgrNL+t1RhJnh4cTT2cpUOeVSvSFXClYG78EayBWRiLx6ANcdPbX2Mpy0gIj8th3RV2zcxqsOlmgI26HmjjBgAtMbSI2RBuL2gqOHFYAG8ShrkhgUSDgr6Kq4KjSr+6tURdrRwzT/10B8jwykk6IP52RpOBVDefQJuQZ8nyGYZW5vQJfR9yPsX2bZGmfIZA6YMi+BeWF0cEbofj1WwTtXCxZqcRdSrO6/hnpz7nfkIisxMOsfru2l08QEZOeHN5BJT6dC7bxmQRd1eQTMlCZbDVwuOBPk8PRkAj2gVvKgDRPQJ/CoREsAMcA0qyKh4MtgywZmTS9HexYN58tIz+QM5K4BH97Hh+L/akWTc6H30O/jTHOOKMVYb2vHlkps02/ImvqE61h5l89NKdKcU2F5T+izG5oNo5rih3JnJgQnVD/GiAQCZoyoDuJMwyzZ4I0AR7VjVrQptOpp0da7GsobY0McLZ2q+umDHJpWhFGzX2KuItpOskv6/uaEB2MY3pQn8V1VsVROUWN0iYnzC/sC4eRduWc8q35BDyAMobf9NuK3vaMFoXpWVEpgmouGs34SE6s+6LaFzExmXPN1cqXremS59iL4HvmDZ2lJ3yta4OqbFSrJe8x8uqqix1Dpc/dZ/ZRVUpb7ifyxFX62JT7zJ2X1rZ7vzgx6SAfio1ypW6a7+Ka0rmFEs19HbrOCgU6ExEALMTQudz3NhpYN6Sfru+sZqzBGmWbJwUNB05NGaEVMnB8gjTZ9HA2BZC2AlZu65OBcCZTPchbLSDfnvHgv36dTmrGSZ6wnFn1L2NgWUFxNpot/YtZrjMwI1Z+GmgHc4b+RVBUO6F1HZfwYjbW+IZXRCPFB04xbz7BGeopzpip/0MbeDSMJLUvaghsMfcKeZcu2C+brfIsl+7yjVJy1/njltD3W1lFKkcQ0JXiS20v/Xw3/cfu/Avv/N9TSbjqglPGl7hxpkbV1+ONufiMqDb9zBUFOgVj5vpWcwfCC0DY6neagCvaa/8xgcRjzRzP9WHDreLpyf6k4XceMAs6WTXNUbQiCsCK6p8rFmciEiUqHqMyGgHpdMv1mmCNR6WQ3bSlDcBmOmhOM+wWM8YWXgWGfjxQEANN+r9aAMsEKneC+cbP1tKQ8kkwoBZwISJggVBT5gILTOgDFTYLCjasT9zUE3sDJri8rWAoiQLbhZITBb+5TXELtGFQyAbM2Nk9UJvrWl9do95wdvVXkX97ba9oOg31VQx1BiwKQemHajn0XverKu+l1QQ3I+3AQ69mpQWcXbcRjBAUZ3KLe05ZvLK0IDWsjxTEHiSgT4AIZf4NR27FxnOY4SSKjFwG72n7YONE1tjZ0e0/tN++BTvyAOrod9zM6zVVgnhqfu60zKbW3LWGqqf01p2fPod506nf9uApHNJvKWwq3u6RSPAtHZY7+8j0AwMr2XyRGNIrW6WKLdnYFVpHrhNY+WZ+PEaJhsRfzvTMneEc9/2Of3IdvWZeBRBSzAW+Dd+CizQvKSuO2DFMYTFQFUV2fhqSOitMPo4STcZllWI3DzWkt9NbCd5IbxZ9cBADaTh/8TsdYH+UJJA3vZh+71l3ojT35VJ5cAZKknOIoqoDgr3gwYeGAn3YISpZZtd+kbDxsOqmV/mBXbRUS1YY4DBGefnabIMbiSQimc9c1vnCQRq7g0U//qLUBFcNLN1bYvISHjBx+eYQ0y77fJfMeLVaHo0vysuBBMGV/12S8NVQKjQaA5QkKiiTlMGJCBlSN9EBtEygJr6i4BLlYGdvEFTckS4ZoiScVsyHiWgWtVXuTPBIbqhlvvppX60igZPYA2/fgQD9FrdlKm1i7p3kRDKao5Z1e/T0Ht250YgN37ZcG5+oie/Yv+ip7ITZ7VqnRMfcmsb0Cnboev4OMVVshxDgUmwtd2syVvl42dWRO53YgDT9MDCFPdSReI9+3r3aqwMD0dcMbzICUtttf9SUuNc9f970X3+d0XLXH/uWWiaW158vfxvfuKedr6GrKOfNW83hQ3voJWJbZgOFLuHMPE5jMEcyuNq8aqv3fkiS5WlEUJzCY2Xef3w6UNw3acUvcRiX1dct2o+nG81/+lzsYtE3UvQ+r1xsJH3tVhG1+ILL99qGH1X2n8gdKkIz/WyUDhRSUGbrCdFkA68nDr76zTxqxsEOFEWt7MLLH3j8C/ezfcQ2Zq1z0BcoxLBTyMsb7mV+ATSeBFXY4OgpEdNDMeVpi3MlQ/WscqMaSCL3M9jmDtrYgx4pCZSLTFvY6NOpKcxtagwUpQHmA1XthhsD29mcIvz+xdlJiadSC/C3xjbNVzOulm5QpdfRSI2HtdXfmzVRN3Nc6kC/jhNTd5WvrlJoFMaE+GVx6tyNRzA/3r1+/NiRWhs+1Q7e1gJHTO7u5dvRxWMBW8Nk/U4KjSVDOYtYpTz6Ue3tXmn5u9rvi3AsVSDIkRQXCx9Uw4n2fpHtVa4yFygnd3zWL5qrQjMUAMLqsdfo50oILLt0Cuoe3PGsV2dMTiTyIFvIVuP8Dnzevpl2wGgwWJ1Y/gzp7JrP0Dzbao5o5/mcthmJajDQzntyTE5ts63mW1tMHvYzU7EkWQiDEfel8cqIE34N34elf5KRS56wuq3xGN0h1VFFKNiLmpOLw9lQOiZ/l/l7r8a806w0c8WTiYVXTDNBjDaFUg0RaXYtFTcFUxA6n0yxM62wZQaa8e65PV6qi4mvGaLFpjTLs780BsJPQ9/pUn7ckIyFTkswK2MkJjOWTbH81ul1PDqlIhVak5ToACydisduMk6WxtTORUeWEOvRJVfVqSFgEN0DNNmJwof6Gw+6X9rOHGDV6oB9tC7xS3Hf9MV+m0rHa6andLnKa832U8N5KssNs8r7KfdJjPlrJFHuhoze9oZy1XEziVSUtX8pQQpSc/7IPVtEuApqORxxqu/idh5/z0Pcbm8D4p1LUh4yhnbfKcbN1DFknGN9RJkyazw5P8BdDjvEOP2hf/q6QlIpePbLoztI02m0fXvNNzSezcoXNM+PWxbECwzeOmeaVgctfUC4IN2hGl/XgEpQehels4/6h42VWDuXKWFESs0/pY+cXBUjWJLB7HLpmud38G2+yc3+QfPQjjJcqQ3dPRHmNjlqiVLwC0xtiqGLAi5JwmVH47X8oFKwJ5yIdvckmAlQ0Bk+NWgMXwqAqgFj1dKgV64/vIYr+sLgAPX/vPfjYN6Dz4eyI0O9gJfLCBjFQuqb6VcnQqvDfrOrgs39Y+FiDQAT0v7v2jV+fWDw1UHWRSgSKHKiG3sybWU1+xQKdD5gdrPDAwPvZAIsDHAqPa7Plca8ARgn2OG5ByBvjiTdpao7ZvJgosyi2Px0sbnJn0qvJN/746pIH/7lWuUABBJLlcPUioOxHM9rA8ArEEwBbe2tFN7f71IyHqTlrjH0LLBx4cfD9YiVh0Ye7wvBo3CSzLktl71KJWLH6x+glc89Z/VW9aONXol5gZC9fs8Xw9e89RUwfi1Qx8/Xqnv8xptCovjGMliyWto/6whvRyF4zW4uytt9Ja59TxtvCV++P2K4G0rcEuGJ506++XYbsiRibDt66c5ghiZLq4d4Xl0iEZLlFcNkmA8rEeRnCwFlSTKA+a+LBPYg8oEUQiPwKGlqTk4+U3dGwQxXANMMoXyXA2K4GAn+AojAV/lvV15ccRMajz+/pjE+BEIATNAvPdFpUv/bLL7r+ODIY3lrV74YWinHQlW8oI7Wa2p51Rs0WP71x0vD5iwNM/EK7kYAAvvlvDkY4nBL63WOr7DVt4MLl4zZcZBA95yYT0F2/nlHNPD6kMve3i4sbbmjI0QiXszRo4cBOGykUVr1pTH184Kr0EOUrp/oXKs0b0rcqIzo7Z6KD5WmoIUdk/1kRDbnaFumvHwamddM0Rxd1Vb4foEuhtc6tukOjMYSzNQweioFGBz6GRWaSFjXLIDPv883n5F6rvZV9FFOvGUuNyQ6uobFLs3KMNajTb3larkT6zn/F2eqC3sy2qxDjRv+G6tPGb2i5aK40/v/kE7ZmH/DQC6L1FfUMQVEsQd6HFsQwbDiW7BNJVbmNexyITQmVZlyqw1z4qA3JXl/AOdO2UooP6VuWW2JHiJUE/pDjU1tcvsuBO6Y3bR7YlNOVIwd7F0qGX3okht2YKqkmPuilTHqXkid5e6L03aTTm/uVduGQVM2V5lP2YllC1so2s5CEQPlos2dHoV0bzFiz6sVWkiC57x70cD1pH7LToB9Vh3Li9m5AG+ykhU8iz4jx/2ib6rw7r5URkQi7xslN+8zrqzXLvUoPxW+ZreSg4rl5l3f0vVgIfWcwLH8wL+8MSVV7/RxTDronKeoz7h8kgT7QDgn8xcrrvVWqLZXHnXboIKdMH+LC8t9ICtUL4nuUW7pE6DibBDqnn6GY7vye5dwq/5h7T2m6KNWOiN2bfjpfpDiyDHugc/tkPZ0CTCNU1BIgV22L8hq4mcvIbuSiBt7LxujYyDlap3Q98lokYXiW+M9khBV1fpAyo1xi0lnNs5Nlq3/+h+XlW1x6fslWTjsvmRjf9VgIheN2liRdK6k5QGznROkrz6dFwciA7f7e+KFxXJpuMUU6VCdTz/7rDA9hi+/ObPSRgHtE24eVn2mT1lbEtWcDxu9ta8iSe7ZCul7R0V6CWAp04dyyhLswR22T29L8f9ZAuq6p/5T7+nHApU0AzugpbuUvuu31B5MJ/SxuaI+4bBj6MThkk5AGZW94KrxOCDhF8qLinvsgpV6FGL2BDgFX3gIVuLU8NPc2igeWCJdzpSsxJtNNnf+LKRm6GdmlNMrzZwpVKrVShtVCHQ+DS3oXXp9AxuGb6MqkW1HB8W2H5YxiVPNHYw8u7G6u9u15Yf8tyaqhRU6F5eZUYN68Ujt4Wq6vWwapmr+uUwB7hwN2EYs+//B8PiPYehZqiInTMushsm0pbJiSnB79ryXNq3Vq+akDmiT5tFdE7+NEG2qDf1F0j2uC9J+kupmobvaBEZ2HIrf6odFu2BFV2luFnV44DghR1ZZ5z8/N0te9hUrm1syt5bdJV+sbXfkunPDWrXq6U1aP9x24myes5M5o7lmpIhPygzPexz5sqossyc5qy8bfRUADVR95cwb68rnNtneVut6w7T/dlUSuVvi0WRUHixfdepWyu2j5EXNK0IWOoF44uFhj1kuTDSNct1QyzHyIhGtoW6v72pbKVhz1hE1NI31AdsgyTRz5VPKNt3Bq6LyDHuZKAUsiWtXqocQ+wqrOhpEbaoz/Iiwji8K8FTFKt0f1wWpeiepMR62b/EnM/8Y+G+Kd3zQixSlqT3KWYc8EAoEYZ5EqG2CHj9GX6NZM+dmAl63TBKVZutmJxoVQNQYJk03t0Ywe4KM55USR6eKsVTIQsTRztMvrx9muNV6cWP4XS5MLkkRsm5eHr2k2dJXoWuU1ijtEGgait1jpCHInPrrrnziiiXYPyXA0Fz9hDbdFVHGwLRuKrmZMMAC5LMnGKsZJ4qNjtNXrmjEqeOfPfsA7sWdTJYa3ENnCFIE8ZuZjImmOVbulOrnjqvYm0GlENOaVL9R9a55zAXEjSZp/dmjaPWc41FKLCP2fGTpqboFes3K8aJ8eVlItMjn7tF7qkZJEiWZrE/YEegUghZSRJIm1mvqJ84JF/WRKKis/fFr1c23X9x14VhUBYGwNINK3RRvrYHddMeggPUdYBJYs3/oC+zziGwE2i+E3i3d1KmqrK7BGQoUVEJJaqLUmy8DnQqC+ErAbjAspsSnWELE991Vup5I1Wgd1xdGZagCJQzWNo4lDNQvEsbBtcYCFDomekxssRlkS1S19AqxXrxHds2KosoPU0E0ijrkRMEESYEG+d4Dr8qvkfDoPLgLliEulDE/Hm5U5Z7gGch6HQdo1JPlsLUMn1qIQuQYqvKpF5bO74evQ24W0u6XtR/57kmdngD4j7OJfgMr2+9zAm2mOLlUf7DFPWYhY7comksbSPeK6oNTrcvoSDchTPBTvy5ExAI054sk/tl+Xcva2bRhvEfpAppzr2kISzeQwOAif2TPuH2/rIm1mnyfe52p2NywUZI33nItD8odeaf7x+CIzIJ6qxVSYVbOXQh2NHS8lp6gj4u/sAUy+gjt5AT6wi3mx+iuqFlEjtuMGe1T2ECqJV/RQihG1hPj3UhrZX8lJgQ1+9U9J7wbakYsp/f7mLpH9fRvV/gQOeg7/Cjv2qSQwfdY0DN6YPdmnU2D1Dy1ft8x6sv5YlL0NnSm6BQwbL111kaaqb5JahHLr/vjyx5Kb6uIScxxqLm2xLQQKIUbrmN/A8eYx1XvyED0uqvb0R3RoiMCZc0mm7FWlbP3qczzeSgY+gnye8ynS3Wkz+GYV0sTZQGUkFoKXj4od0RJphmS2xIV37l9eMjeCv7axrriNbxnWYBHMqYcMg/I0/smi/P7ngzTc8+DIXEZgMpcCaHBnrysjI4ZQ91QJVWLDWZi6xP1BfdTta/l2ie1SIVMYmnMLJxzteRGA8C59DbkBKauN9+8ROQK5qZnHcyjb0dhKWroUy0mnT43lNJ5xs/nFR5DQ86WCGniXQBNUhyToLsMQfEajzCZ8AwNS2aTtEY9eguMxmcEZ4oDr3RmmzcXS3ggkFvQEuWrHwxMXi5bs6bUrT7zWtEBY/sZN+QWEweNhTM2/hZjHs2XmddxzAeyd6y5KkND+VY8t/wOXSlFjR3DOZqfKajPm8owbJRTTesfLiT0YkFTmOqWSGliEyV67LJx3ZNWEAPdzxvet8qAGDfk9is44Pp7ClziSKZB4VoeACNblzjEBaQwnirGDNFyH1stnHN3G27beFAr7pSoSEVs+xmH5VkuL91rNncZS2KuP/s41jhH9kkHAS7fC3WhAZa3ct68mWw5jw9Fad6c+AESooaZYIYigsaDnpGPyIefy7rz9iZ2ocxJzNsE1aJ1KkpcW9VeA2VuBvRRBSVqCT97625XK5sQszELgrJagNjcQ6vyCRbSJK/XM/evIdvuNur3laP+L6VTR8cgQKk0zowdGUW4IcNSGmSeHjhoZz+D00p+EY8QorJ1PwtaaaG/RBiDhzSj7Ut7aiUYKYgnGbcFeJrpTWH+/1l2a0V0gixs1gTFAf0TYzrJw3fhhVhrfHwy85yFEuskwi5FeYY9HwZ4kscqLUxNmrlfFr6273hDg9PTewXAdNPniDQCLp+mPBmgBFDwcvHNmZnhEXO5Mbm8L5wW1U4dOLB1daK9LtO/U6pfcoRqq124XK2lmmF2XpXkG6Kp4XP281ERiJ4MWsWc9S3F1ESMAHW1U90PGI1nizaDhA+Gsnske+YWcg+mMtrP8AD+NfM+tvgbhSwJk4doD2OmGxZisUrWis8/JHtvdZVvPs2o/qR2Q2yhkii2wjzcLzDnePsoDkQnf2HUp9hSmTDc3yLgb0CahqikPk4ImznfllG5XbbiqBp9uLcAM4EoiyB6Hl4pKNKuZbQIfUUxF1wEAt9wGp1CgCh5+5VmzLcTxUjw8c/IWYTEL0hJ/o0AOyz/p5QIccKrPZWn/ARk1sZ/PHpssGhpIGZ8QZfRZsBnXXlcxegPOmXU5P3OfY8fi8fVrxPnRq7ZTbEuTRelLUzaQ6PkRYhm6bqsv6x17eJcUSgUS43bhKBSaq2ruVL7EseP0e8vtfBbzQS3dQ5UT2IOpItEOxND2LdjAo1Fu5a9RcZUU3HD3fxoM2SU2y17BfxmWHAWxMPwNqetaA9dornbVqNIYTM8rdXcAHaZ1EpAWKbi6b7n9s1NxHpkUspMYgWjM6KRL5gC9AiYh7hkeqgil/jzP9SAAx9n2jpEX6Ud0cJQqL43va3CX9mgy1NjFX2+FaGWwv/fqPTKlfwwkCT5nTACpaBz+7vgm01HJV77lljiyQM1093+VG47m73APiYCEVSmBDzljRaZKTMIU2ZWMfPl2pMnrP3UdmiSyspE5vSk/AvuboYkNG6rtbcn3HJ9YhIw7+RE23hv/FbqC8ED0PxVnUpnSR8YTv6JnKd9BrLWNIO7LxLBG+6KfN+lXJTsJE2VjHmBuyKZaqZ9BWqPuQDokcNpCH9i0/kh1A9O070QU0K2dvNDOa53cJ03ferKNbH9+KyEHnEy6NGq4MbStAD3VcONuyzr1em8gRtJnRb1ff877d1ZzZzInZRESm1b8Pbl0E+srXPepSRGbOVYio5+pj0vXxi74VPpTOyx7BdKxNPdJqjHXigNcXd2I+vjvwke7+qSjvv/LtFQ39nlFjpiQvixZhpWiDJxy2duidmZC6+LBWw4VtOFuLRi0eW0MBeDYUctT1RsTz1BjGaTsVfsT9etT0qf/h17m9XMkc2yuWfG8CBrGTqH4fntSf7nM+TPKnoQFeabQSQR/4fzlb3Mimu+UA3JYObms271Rkd4KetH/1JQRSW9NcRc/X23rtoSwLypM9u1UnV1m94IV+ctzOjxH5n+mN/6MtQU1Ob7ufr0pUeJohL+qw+dkov0Gg4lds1vTf/dzWsgeAeG70L4dUaO6U4314JrVikxMvBkQiEINA354K4uCpKKTpEDOE8sZr36pxKcfzJUaVYNdYux5MRk20zyru16eaf5G8p1mGfR8MKSzDumGUtz3ycPXqSnEqB5K4MaN1VVT52o+0KZ+NC26iutJLQlT7s5ZWzVpSqR2mNAqokFRokE9WM2FGdnBfRNVX9f2X4xZoSmdr1WuzUNiRDzLVYNm9wwHY8YwSAXKV9E8Xu989SzYjEbGZYjUXzmg2ueOT2tP4f35FBvmcGeY9Zzux8fgyQm8RadfdNCb1dUh+IiTcIMp7w9oER5JCxJnNcITgEs2oaxCXeZA0nNePtFjY8RpzaQvXjgbqFD1EMfLaH4HJksnc+V0trMslkNOt15pX6xzMqdyxfYjKiOPVmiB8PinmPPLFR4ZaFxVaJr5+DdKk/r5lRx9FyxRRzYB6yAKoTiLwDYki+Jqk5T5H9VHmY67PWJlmKN/D/VxKunSNJ0AyTZtlVmdYeGZEgihRqkJLYya1EMzC+Lrc9XF2lY+/7NGk4b7rbOeA0csHI2/Zy6X3l7PzLCF9q9zfNDfnuT7tp11TjlmRt8hg7cgRy5U2aV6Svjou97BpbqMxeYMGC7dxdiY0Pz1Q+RUdj0K3rGqlxUn38tDxzpH3v4Xd4Co86+NtXRrsJjkT/COJZafnyCJsRlE/McrkSdljlxV5MyUixZK5a9E7h5PGBPd+9BmmJ6Nny2Xdw6cafkWt9PF/dW1mdN8dLMpWljzGtKyzAFwD0snvqJ8szSNNosYW0i0x2IGqb0UkMj+NssY+EMZqKsGspaHjZSY0e9xaI6uikRH2WMCQn9msJlSRe9Fhvdcg82LuoQ9Fo7l81QsCtP0ymI0yQWXMF3SaJW7MIoaO/2YHq0eyXPZnC6+3hsCX3opRpvn9FuG3INsZU3miXTp/8cuHueH68NmxPheAOqbaEdpwa9MW/QkrP0aYPxcROw5CASStbK3E+arydWIYmZIrcSsD2JJBUKDdGXNITC+EtTuivqkcLKJlra25mDkSek5oalWY4O4NBe2xa3BWW+BQLM5n7///d94pYshcJ4JyJzo2/frmSxx/2xH6PfvX17Lgjna+jIyFRKWTtmZuqW74WO12qnS1aSuBy8Qu8r0fZqxdwBHXFNrldMryKbG2X1L53Xtrvfu1lmmf2M9Hh3okn18jpr65FJ6+hxLoaHx7IInGRMV2lt7vy4s10eAMmX9cLH+10NZs/iuCmCQuHqe2yy1ru3wR1g7oyxymrWfqPeht7przvEgTt+rTexxS16QcHv2NdYwSeszg50Yp+N2ByDV0/VLpjLHyQA9AZHUzBSyeQTEWGhESPlUbje/gj9UModT8l82lBbqpsMhuP5JWBDEilj/5rFwCIX1s29ZEQxyn94cF9zKjXFYWM8m3Yf+shQCx/b7GObcWB7RDiGU2h2EJLskGkg+/rOVwPZCafzd/pwa+7g5lISfBj2vRpPmjIvbtBAkjZN4bIAzVLo1atCfKkQmFwVVW6hpAtew2yvc93CBbQ9EFt7rJcepUEDrgU/svEMekpfEFI2AgSt/lNBg+W/4wm/jPqPoLX8b5io/3dutpb7fuHhnkdLDyv3KHVoS7k32QMB+uEULLkHBg/OFudIgQz/4rqUx/nIEYdRuNsvsJosv6e/Wov0eZIoTlro/Yz2eQqIi/u6yae1s+b2ZSt1zmitQ748xi/vLHMJd3movyPxatfYSefwwKbor7Wfe/HSjhL+tPrJLNm/8iXupYPOYAVTIls7tN39X35gGyE+7F363I4TKs7adF04Spl1G9e3D811T8ENidUO1aFIPoiKCGjvTGtxN2fiErhSMhb2LMqqkboYWl3GfKCQJKxDWqWs5G0Nttbu9K3D8nGiFwNYAaeBCZxMclP5j99LYh+fzO2Znv6XEtMlSL6JhS+6zswad40+D0ebOcIofPJ27XYP86BObk52WA1OCtCAYHC70scOwxnRKwPJeyiku3UDXB+cIHMEjLtRyPqzcAuHDt2oM7mZccVckvbNn5zoJBIZ0e+1p4o7UdhTxZl6wQ6JW2psCYo2bpggBjiFRFTkG3216bnjlKj2UIpFAgklgbpCV/D+r9itFhSOWasadxeFty7A7R3R4rTliSGhnL2nLxResm1kU1p+aj24KlFnZP3iqI7RMHTDxhyxXYafBQWigcNxFsEt7i5Qp0pCcJbqMQng2KvgxGF0/2yJL/qD8XnycNf5ccZ7fsfR+FRPSNMFjKY29wTX+7QdCXWFTqL/o3dZuXzD9gpBmFZyz+x3RAhoNEtrlhai8cErDeEvvkANQNXGTx6c+wf9GZS+SvzsAVpCMVuHP2x7+UrVivyjrRtxpDlQdq1vAFk2x0NKsIK6uIP3qf3MDtLJ5yS1t5RIYDcGRWmNr6gpKmVLwaPYglkIOH+pl3tWu6KrKWKn0AxwTnYvQdkl5YI73XUdaIcod8yDvGx9oirRNMt5fHVWOgcm4CpQO0zxGFHumfPzZyp9T77NVzsTeFS/Ibi62PZGglsMpfmtb+kNbJWIvir6GrCntMBLBgGVhEuH4lV2tty8xozZq05ZNJskR2QrhDOVJEvAVlrRGL4OuEYmEUZ1Uvalai5HTpus25bKNca0yghyZRkTdnYWnxl2pfz6BcisMk366kNbzCnPGHzI3wFlR3liEBine/gp2rsDjr2QLhVJe2zaMaem/KBDwAaXZYVzWuh0EY3DaNHGybuRUsOmAUdwxsMVNz+9uCinZLHGV4RePbcNCAqgxNkm9WbwVgO78c2eB7dpz58SXBu0h5FHF871mjYk3gWwJJK4dVA9B2/ndTg3v9QeveydW54lPmA8FQ6eLvfLJMdNdNOXtkIpR6pqU65R4+bGVWT8YI7oU7YiuKcfM7eZHcm9hX1N17GzVAt0aD/0FzefsQbtXZvh0PeE8pdpokVI5RWJn3rFn/3lfBWnLZ/BGRTVdGSGp7/bkSz9OstEzweaG5KpFtBqN2zB3QREADbZpxct/IaPArfUwSunfVpVNJ9erud4T7XdvJ2fZsX82FEeSPgbFBALjcLqVTsiSXv3KZHcMYUEjVrAsPgaLvXYF8UH4ZQSQPOImzLzhJapYgMrcbp681bwmwuBc17GPp8fHq8EAlZbxbWl78UtHxg1zna+gKG08V3omq6Wl9pjpvsi/I0iZoj5xFyl36yv45w8jNuLY3kerZgjtsVRap82ZHJ/IwGnyJGzgt4USu3LNGwSGvJPFgbu38YoeQ6HFu9O9c19JG2ODFuaBC3LfPOT1Igq/REdlFPxilz30ZyN/uiHiUAS/wvLQArd4KQIqGllJ5ptgp8ncSSdtBJzJ0IDmn+BxuCpu0GpuWTzKfbwLgaIKgn5X3m2jiN6XxcZ0Ktf7g/P8fR7vRPqX2GsXz0r5IqS04zPnidQ9Ny6dw1H1Eru1mwui7r9cqhx+1rIdh9EKJ1EQxkYR48m40Pp2LHDIRGh8pOvPZLHo3o0hYKKdiijJDsDvHsGiBsyGhQUIECPaceY/HXf7gdwY9JFwxTsChoJaGgACXPkzz4NE4HWTLZe66Jm79q7d74NVFfen7b/B1LZDcwvX7lJHqrEpsRNJ0J/Lp602CxQmi3o+kjKain9/iVQf/m9vvREcDLbyF7tXneNYEvWq4FL6ANQYT7Ovu+rpWrPqGfq+Cn9S1P809m8Eu5kR0ZZR8wkkxWqlRX4WGCIDDclktKAY7JLkdpRFk+5G8GPgSJC1aEbQpUnq+i2XhAu62Ai8IY7ykd/ogbT/4DIbGXUkq1PXmyJgzqZURmhPuw0NWUbFvgaPVs3JHq9pwWDtH8M4Wm/5UbwXCpC9A4UJ8edxkGWDAVrb94CuJDnTUZjvMDdEL6EhacCFzN8gNOsJXbxoj4h0hy0r13YwoCln9j2iSchCfAe7306eGmJFy/qeGNSsV4BV6WLSav2hrbf4UP675um33rk819gfmP+oppWpu9GdmaPXTVPbhT7rEOC8j/F3dK3ujesOaGfJ12mL2d9oeeC1oNpBIHeVUnIg6muT5J0Ftrwvq3MkgbCP83Va4zn5xcCOtLI1dBb+dw+VFNpw/ShEKAEmJucHEU8N/caRS3vTgnYkHc7521ECI2vddbH5FvFHerKxdMGesQrOarJZ19QGk8kH97LVVlOlIFbuyNqraLc+w9JJvXD0zOWXGU0boXP1xGFKR1SdmN46y/0VtJDxD/dS/WHnYmbZ3sfR7n6WPmSsrYiYhes4yjjNs4LvMqbvXy6qfbyCVLwctFJnMngJsAtTtWx3M/5Kqc/joYyQnBFWVAL0RdbAKTdLv+ghXI//WdPowFokr8vJWzkr/1ST7gTRbwNumYdIE49ZCb+dV9xYsA/DFjCsILcE2YEOtjMSi+sC5N9Pyh1iza+i6PPUJgi+LNMftdpVi3fZzHt6FlCHGeCBgkUmBzcGBT8DP7spH0XSKRLMqA0Bem1lnIpCKnbocgjfHRpCOtAQKMdhkrmUhhbxRnEaw14ppPJD9hjAgNFXvHg7A7ySTLfuLBkVm+VcVDNH4e5a1phMtvXSIIvjhs9KLhjW2xXJWnWG7gfo7djWACCY4gPwaNoUMZxt9PpNokSGWP8TfI/vgt9H2lTaIdSbdDoXR750BU2O/Son5aN2j8nr6zyBINCfWfF2U2rbfTux57r7MtDaix2tJzP1LGvoD6J+qcPl0fwwBZ/kit6WWw/R+jcpip7grESLuxtN+RBx1SqXjFE5SKlO1KOVXLwoBCEImJo+KYObHF3JJKx1C9neb5Sv21acIclFIswQs4Vz50jNP9iwejoXHEwbu0ICe5OXU2JPL5x64jOTpfU9XvUiIbNaMxA/vwxP7vbfot0+fLA6sI2zZzY2sFUnbhrp47VzIYPHtKZGQ/Sh/tcTQgA5XzAdCAQ0zVPPDQ+IEoO532+3hks/1EdclEqza/2m0FcFSf1KXkFetQnhh0TS2TYrgZEjfZXZGm8QGd6dScxXBV9u15xwefPSTwGPmVe1mgpyFEqHrn0FGx6rX9CgGw/C2fc+bIB1PeKi8oDzUfW7lqbGhqCvjBgErMH5X773QfqkzmjPCE6BJWIziuSqXjboyIicKpbhVfFffePFSLiWXzKkpGqPvcvaWUrVbZyrx9Xl+nRV3M2CpRn7SqdRH3seoF5bivhiIV3VdOL1onrzWapFA9HvwMlIam7iExbI/6DItFoMplmbWj/0nxGcWJ9KpVIiAipI3qctLEfblbLtICZXfZ4QSCYMY2uoqVtAbepH2uxCgnXglYSEHw9CMRAuz2FwU9CB7B6xlC8ZPPAyTVWcmwkAL2h0VrVhDiQu4O0OF7Pj5hxcCg6QTZKNVBZMgkJw6hWHpm1DidHlInOzHBl5uGdrVy2qmhqkxYfHQ6i0nChMWGEjsp3xcqTU7lBAwgkE9N8vUjB9UUjN9GH1dLgtNx8/tBwst4cKurKxAqbB2DlRF1a85SMQi2SgFw2yxNpVw94zIhHjQT6kPr+7w5HR5IQoNeufo1ZukqpvlQ3TXFewui6I4Iwgafk2MO1cYe+BBrz18vqYoswmktWb3TxWw2KGdWWbREOXudrIBdrtLotZMtw2t2ff/+vXgxK9N1k9jOix92VRhoTj0bPVObPutuXnTlvk1xT4wI45wMZ0XFrEOoigQLPg3hMXzqv+BxQnIpMaMClMCHc3mnLjA7UF3vo6DgbtTq5nvN6RQ0EIBiuT3n6q4sv0JjgbA0sKfO0R76G8ueNxXHO8lG2FJgbUhnzDmCBsFwVC0r5PluLGwCUpqFpcCbVgEChrPGtGq6xDa6pACSviQU6wRBROLKioEJ0OkBgez68p4UWJ/th596ddTkH5+n+9zkQ8J4noAEIqUweEvlj0LjKxJFIaJH0ZM2e8ofr4VlHj2aZqQEEtqvBEtbfL58JTuYCPfD4U2a7MFSrO1dKJsMgxkmcCzK4tPL6AuwzMZEA22vDiXJgyNR9spJBzLau/Jm+qxOBg9T862QIhLyUQB0MXHEtEJ45KNZC7KwsdhHRo60SQUxYwnGqSFupIclm5IUtdHz475/ZBIluuVDOpFIDXrBiwuzV+MNHT59mhQA9K6WMpOVo/rSwV/BEO0tm3ngxgsheFwtVq12SM6BAavxLOHtW2y4gIms1AoEPHRGw0f5opUfCvrVwQ+m5krMq+TYEBmmq01Mr0L+4dTQ0OTXqZGqQKwyGnUtrudJOcelCpRkCBZRN8IgTDisrP3sHxjITTYObTkp/VvF1EPw5MNEkI2RWnC/VLCmRzw1BazCUxoJeG4yHgflGHJTfm80FwNzcbrECi/f7upQ8JaIRnEqtwJz3jHZxACScm+oen8nor2QJQOR3d/W4P50E5VLA/RhzkApEMatGEy2gX/FFMX39emPjkRbGnVqMGWjQ9FvcER4HlMbPJMP9nSYFAERXeBgmZmXFJentIH4pCX6OEoNYTLd0y5vd0oWWjkoGS90vLyiXRlsMmEtZPTvKH8rYlWL/+peDfiRWZLhdmqI42tx81PcaAoFiStMWKTp2IP/6oxgzUoZSl1G0jwR9y7rkf0/tDNYJawbFVVDEwYt9s59TVpWv/QzMf3h/cwBRynJvr7GfMx6j/3rnkDKJRhCkjNL6J9avo9jdbk4/8B7XeyJd9TEWQisfxNW1pQ3jsDsqqwqK7dFlT13C3dYtztJOfrW/+DL1zJzyo3UlbMUoWr6tu6OdYn+hOU2ZaF1aHw4zJymiFDmgI4c+zCrXAzxjjDvaHNSafWw+4qf7Jfspt1ZgEGxlWRfuLjUq0A/ZD6VEfuotDIn2B2Q1SuHGWvUhUQO1udOmp15mAVCAoy9mar4LgVTKWJESogRYJihmIQiIw51eE/KYZy9qPAmzL9rH66WDUydK1pM14VZeCf6V+t+fv55exBltvHugjwYyvqw7oqUNMGk3BCQB4A8HFibiqbX+07WOjY2rj1hFT1PoH8B4xjUOHsexvdmKdCKOFWiqEYh2569fQ9oWg+VTlZu9fkEkujyGQAvRAbzlHmaKXDtTzGGMKZqmNkPR0V+d3t/OigxnMCg0aS1rwhM8BQojNXSLXENDo6sZaPU+DDuPIWC2CJCpqAsgM6rzLdcABTaVaHQPiURdG+lTsGVOh6jq6w2NfYN9jY2LqOYird7OzxMjUW6Tt7IWumBGOp/DGRAEPhWhNzkkbFbazGV+zMvHzIgWShBh+iWTiXF+1tyjs8u0r6deD2yHQ7H0swMNZisvDq4Luf7htGVCYbvoEzztuie0IFwqAEbzmUPbO62NfByEYw23htqAmE66f/ZmviHg//lMMml+gTxbDcXYxe1w64QIJprRlUG+a27ubrqQcr7ti6f97Okbbia7Zhd/dhxuam6ULc3oMh/cNSgh7NHyovTV3cRyQ36H5IpEBLKXzSJgXFSfJ2oJvsxQYJIwaRrcT82a551G7GtyZu11yZn3otqpalwnrx4zgyFCuklFbN9RP6bzbTEyPFS/p/MSUuekpXzAWH3f9ecL73aFq2bpKrc/X4hLfElZ9d7E+6OShXu9JW1gKhA13ES7pNFgjIdOgZ85JCOTY72HpAzYFKAFGHrhS4vKzxeEdLHYgB8LZIK6a9iB3TfzB+xbgzOoA3qiGdyQLJ6mwb1iPPcafFM8l37Yui1WRYlsD8ykqgLtaUFAT1u22C41PsRwUfWlpeJliz6W4VLHd+fYqkTnLtuL0N7kDVhOI7EnTqKkympqAaKR0L40F9UhBpmxdEtfveKTy2alUoDAIUDmo7xDEpRKLagSamHJHkgq9s0M4/uNgZ1O7stwtEB3l1a0Wzu73Q3d6uKehHPsccLl0UiKpGyBttqcQbs/1P55rQkiumr9IYDkhNY8f9xVtD/daL3lwOV/pmvhpzGxpm9h3rv429Zl6f04U4CcMffQneSLhLYEjCHT87riOZNohdhJDRiH1kKO6woHETlLq29fKABbAWYZMLe4iG8h/AuFkvkzMR2eQ7e+wTtYDpZJaCSlyYDnprlAhMVAMFdsDR/dEV2GJilzNvDgqDR38aRZkDNjLvzjTQJnC168FMgx0sfpuU+zcXMjTXPxgjNaTkxNafZ98PDGDaE5jX9Vgn6H6LN4fnsWriQ2ugicqANG1cmsUa9Fae4yV3aGWRRGpgxB2+eeVhBsqAsUuAbt1uQEVkRYZXLiKLTAsFq6ZZ6S682wkBYzKdvKXHQAGor5NVxe4SJy8hnQqOdzswrcd+4dUOQ1jqpmN6FO30skZrPIXnF7sCJMjZ3cXa+IGXpgQPiVRFFol8wE5jZmsp0WlRx+aKtHqTXGdVUEN0fk8O3ruMQVfvcKwbjj9S6IIzPxUBMLjvpUVsohvB9uf6yv79qYBVBmNqDViT5s2zYJOUDd0pb3ppkej6UC4DXPmjYy8vl0QDcKnuFMjs4yCR321xcgdPz17SfUr8BiSMrk79S8AYh3EsvmV2by8bfJijc9zNv8Lj1ieA0lBWQ/Dbp/we6NYbPKyyCSOeBl/3CQp4u9SI/SqQxLyOX3XPCQxduP+52EnoSMJKCwmOObQyWWMKiWHMHmDcnGygXmgwGd3W50dqO8OoC1Tchg4bORQoSN22FzcJMmCykCIi0ScWODo6oJm5NAqUnix+jzYmvc2RS5nanMBTNlUJwWRjjdAYlabVVMKNkRKHFQMDW/GW4ZJ7ylwUP4x8JWibWKacC1qpvaEpOhjmqV0PDJvwRYP3HpZ14605vAW1tQsFY4qZwZsguhnzakANo9ScmJKAi1YwbNR5aaFdtAqRUXveBMYiFst2wF3MY436xNdtr5+p12VmL1cd9+FdzSEi+k2s0lx0lpH4iFwLbSgs+h1qNU8509+iFCs4MEUAZTBjqmbZ11rHaL0AQFUASfyHPPz6XvO6e/F6bPWgR8cywWR4UPyzrgxnBI9oqvZ9npVhV1gKMXWghSPmbmzECd4gBlFOKLrkBGwzw2482y4C4dBZO6TIEN1hAvgSmTWJQLBDMiTE4+lF6CbQvUFJh3J9bB5RWVqT7b+tQbXONDPOvxhUP9S2Jgnigu9u511sHWsJqBpdZUnhgnyCCCb+/VBvNNR/SYex14uCQKdgasG/o57wqrfOieRrCNyXjKyoBhEEBRSdvWp/Mn7X89z3p8Uflv2PxeQuxm0/+iLLNaZvpX+gE05qkjnQgHNJPOeYFJrAeVmDkj2/Q1DA5a2q0ORQyn2ebAMh0H4rdwkyfG2xZCh6R+u6X2VbhqfRUa26MQV3dF/WDuCQ0RbfcnP+gWIaxAIACAg0MgMkPZHvnRAHBjrcQIbBPdu0/Fodgfeyi+QzIOyeBrQ4mD8dFrgfYnjFWYIq4W6UM/CL8MVPJRXpDuDNqduKRrS/HmbcUzzult7OokutudFoEAjh/NrrC0XeA8aSgAUSZ3bGRtWd0xnyAPc7voM+yVaE8BSqal//E6nE6JSaKVN07B2CSpehbauLr0CyMjHARvdDR6z4q5cOPk6amanDCPpGv+eOUMyKxVqre2GM/DnEZ+Oih8tkK5jvyUy27p6W3GCWBOCy2rlY9kzf5snZ05oy8ZXFTMJjGJzMIDvhcBOZtWPHZuHwYDtzp9O0Ir14cOZN5TjlxIoBHaCAzJbDUU7SBqi6imZmVfiIzW6eZOzIFhxDi/gnx8Z/WAwHjM1FdGjGnwyCURQ89GASPt9k1rp4wxl+j0sREGnndKJSKDEVzTvjfF28MXpFINGBnr3Da9O5R7PLFVS5E5YNw7JOrRvrU84bt7YvFhKk13ZtSxurOoT1/uZ6gyww8O+UUXBmqJXVYRFgHk1zTyWJUMKo/pZ+9TMIxL97yIY/7rjkGkgVQa7VD53Y+4YH6PZT+hFkb6W766brpqWMxu2LHbVZSVNVogGxq8IqCSDnCIc3OZtNY0MdhAt4TPAQaU1hBHacA8StvEPHumyXrT5QGfDgveok3WfaAMYZvPIUJlOuHcjW+5YC2TQ1zYLnlrrBr+JAP27IJleMezgE7wSJUBHtLokCiBy8hfjKO9nQEhy0tGs6vXCG90dlfV2Hct5cRztEwA0j6JzF05YvOwCYhKbhKZKXNunHRf8vIZ618PeEVLrZRElAYgpbxCCZkkZ1mYQb9WPh9nJJUlTNAwTCPu43sbJs6dmJZGdA9k61zApVCUEz2c0hthNOLKDY8fDzginDzcnYqLc/xMXl5O39zyRWOcx3a5rO1ILV8+6Zfyp/HWi9ja+AI7fCuHY6nIIYupBL+2v97qCzi+H08v0i7op4TB90puxji8Jqgs7BGBliXrc/N0kF02KAtrB5ZINvEMiUZxIyjbiVuWeZeMj6Z7+8EwKJNe4MoL1r/BYtb469ejrMWsDgODkoDkFxQA3NoLnZ39tJEmZobOekNxSYnPEhAV3TzOnCSSqygoaFzSRUTpQ9H0HwEdFa3dHNzz6WNf6Hj2L8GDRYIuOuQc/fxpXvjGK4rOn54xfxjXpsnz0oJKaTRAYGyHeBBO70wk5pCYNsPSVJeqxRIunZY/0OqP5A80B10MjVikMWh8fWc4PDHIpDwL7kBLAo2aLxbH9aIvC+Ol0TXtcAHIf9ecym/r6JF0kq5whxBhIGrppXTgYkWREpwLRal59rcm0KY0YNivEYm9tSTSTIcEnfkiq4V/reeDSnZpvgzBbO4AaqNaJT0nKb6WOJYYZeaIFMjhYDj8VMrhx+wqj03nOPWbuy6sgIe7jdZ3uH4PyeL1XChIlHSkdgtyqyJqRG+9RxBHDeaYaQP+soRsA0hljIYlaWEmObNkibbPHGQ+8/wOLWkNt2xNEu6+3LDZFqFUQe+UJLacVkhHfOez7AqIFyTHDwsL6vk6HccSMVIMFXNc8FogFCSRUGrX24e9j13Zi8Zn2Dhg57CGIBb7et+S8qTLVtRYjxkVo92VeLpydFgvoEHRcNcytA8IXlsxflJ77wjrmqyXGbK8yYeiOmsOQxFVEic1bpiQHCWhJ9dDWAJQMDZHg9uukftsW+k8lhtOg3NjT0ZlUfrKLZJnaSTzGFJO6BOy/W8ZN9JXepoNX3S6uSI/6no8UdXrbCa1kUIsNeylIvp9ElzZEdtpXpN8fcPwsaJSn5y92BnotGwPO38kiYzRu/knZHh34fJBKsbNujEPX3fwZiRvcpd3plalFSQKyOlUHdtIBmn58wP68tNMFtviFvzkbFYHY1ygp7y+N08L7IqaDrf0xblShkQp113u+LyMQu7RAdPktj0zlejpcUbJTU3J6MiThkLK/Ge3ydjbCq1PTVv61LBgEhD0rVdbcELOiXQMu98Cacpc9vFg3nsZWOrR8S8p08apY0S7Uqf/UHZ67ot4n+6mNDlIE4Zfn8HZh4Uj6boxovkm0+tQwi/W1dahp9Umrn9VnKh1jqjgKZbvbDn20K32OiHlfcmRvD1b8hIqspk7p62yAYR1e7C0sQPrLhqklnARveIi6iHq4gYs/rx8HHYOqw9uThmbSwwT7TYzdQBkPoP2NoyXBLvPeS9IFqJ93BMekvHRkYMCe3FMgR2c8SSS8g0K55zgLcTE9GGhj1uO/vlzdAvdblOMbjKOxJ/gQKF/ku4a0beKjQ+/Dg+PjHhITnDBoonH47XeEB7SMvHQ4wgmBOHpCzMDCafxhPORzcDGZoz3eOMPKef6DBEBV1AnaII3ZvI+kdoglgJzIag7FfxwgdUmUf2xt85jDk4fBD5PZ2RI90XeMXUJEHuEzF7L2q/8VuR98ejjMttA50rKSAWVU+EWHvYUPiF+9RabTOleZBsQCZjmcsDSNS/nHZBHeU4PV/4ILfVgBaSxG+LkyZpMSgOeiz2p1ChSpVYyw8iP7E07vjqLLc/sQQgwPBnIpAlMwwcxTDxGKNJK7q30FEwOhu5DbKhZ9/bDTo/8A1837QA6KpVcOM2P3ncIoOoLDWQ1J0yy38/lpu71SPdzNU0gnjJJRI4lnrZXUFxweXKifoWD0o3pKXFOMAfFRfd8KYko9UAB/NYoIjuRSkdakCGjo5dVpdssV0yKI0XXrNJFtq2EhxwYmU81Lkv6wZGxkab5mVNsc28CjMV6iWSSEzfj6dOzOyUFbjyPDzX/Ko8UD/fZaXW4jrY/b4yTbUmWlyJtkPcuHecUWEzz3vfGRqWRtbWRjhly4sf1cwzqlgu9n/m0jg04syGiyMt7TpNjxnnZl6PtBIr5TmaA5zLj/SH8bhsiNWhVxEb4hkon0GSEQgDEMuXyc3Y1Ed4J1tfli/DKQ6FyEz5+GC6BrBy13KQQiWtnx89MaW5O8WSbkI/zvXUnrfLS42ZdoR7xtUL7cxRMt7dByQE1U4do1Uujduacdm4tyl9lvDkQZfVWByJtk68HiUISOu9HA86rvnjWY/VaWAquvslvGhvp2nn+5fkA8sJIEEtnVJwcfmNOB8K4F+3iAIdPWks63GLcQQeAJTlDCV2dw2/yFcqXF5i5yNV32zGN3SkbKKN0uJhesj+xgXWAxqaYAy0UQQGduoo5rxmLowCn6TlO1tmEHUyt9sG9I9pBMll12unh4b01x8YvXx4fPWYScWwUysdq9sbl3oeIvxG+y6E/dfb9QXKpWpmaFs0C0V3TQetYIBRf1XbvTQ+8jzFWHJa/JhlQXO/qHcU2WKOTMuvrnW035KWxW2zSjye7HkGpyVE2UrsLUwvtUX3r65StU4fsZX+V7O9THFxELXdMclRDXbnTjm9ybHm93YJYpc3bSl5mb+6jDC2K6Qvwy7CHlSiVWDPTUj5c1iPqlgk54haJVlDppZhR1ZDbkR4sHmH5ZaTP5KZYmyO/KoXf52dW7FRucfmPzUdMlyiYwlop02+ETfPBaY7lISNa0RgEykgFLoPQJPGJyYBX+vW0oK9csHCpuBXQKsi29Y0LFy8PlJUuZ77SeSA5k+9MMpeBGnCnKNEjWi0paY7BuPO13WrrtNJq1K0ZPR8avDBik/PyG2BuozDgYV2cazKTSSm6WO1F2zhmlm5Esc63uyU4kkNTLt5v2hWLxJsY9k5n3yd/ZN1wrS2d2UqTPWG6ir1ZPGzc7MegDKNPGllkYslIbF9MAUMKBl4bXcfK0h3Rbw6q8cfgjz6rybnYqKj8TmuxWQmlkdS1PYGa1MPj9RdmhedOpazsA0jOXpW5A5/OGZ9m46g8lpcfiSh84kXT5ChTTLXXXPmfij6cdcI0D3ZkTpfpvvV+tEhO8gCrW7FuRMTMymVoL9qIKDKpMaJoZV/KlFFuVj2RQ+T28JKo+Uj/HBt/RY3vZxtpfqclqkKl4zE1/sbgY3rFlQt2DYE+YetZgPElsWW+JmMhoIkVcElCDcs40LNdfkEtbKE2NMMxpZiSLxWwW1wSXFoIDEn1ClQ00BxXufnwYWE4J2z6iHhSWazfTpJl+wDGajM63O0tBjpHkNs2F+UZdtPhYWQkJGCDTSzclEP09r4EevAztyFxhjGTmPeP4F3Ti9kX324jeI61Qg6NyufGwGxduL5Lw163D3QOlfS51sITX0BZ0PwXdeycZ1P6tWuu513QAk/GpJcmdjr1mB9Og9th+kwZ2BFld8mLnvUtaFl9Oh6owXhpIE+5BSCVinh8K16Lw7GyQ3EBJYR/A+a4XXtbWxse2HEimgnceEBMB9Z1cNWUHdXDarvqgwsL3NYtAd3oo1s9yX+LwPWT2KayXAzxZYmLanFb/iXvHLNeV6WHlBoZJ+JIatN5wmPq9CVKOIoYSW14lcLlPehDL/pdLibBdzTNRN7DLMaYF84Tyhwz+bnqlCK2epYUn4NgxVWpkBbqwQ18TTofM1FjIZNfx6Pl8VcoARhXaoeQ0/lx69ZT8iNmKEc0R96XST60p9TgheRu1dqERZIGDvzZqf/3jfJehJuSgOaXy5eL2jxEJD5u8UhHW8cWTYknyUPUJpLHuCdv+HJVbQgFgByKxhH7zU7Lz92+f3dKAT+JEuU2l1xBPIiPTsG29w5aSzUSokTBKZj8he8dSGk9F4Jp2XFsUwXO1TqcQhoytiZ5WZHtXhvZBhdi2K51feYQWStsf2P8vlrbbUzH1SU5pBXjpnPBxsyqWe9P8jHp37pZRDIOTLYKv/2/yqIl+KL1YxUrN50HVpRfLnJzSXENcBvXqfC55bogPhAEyWJH7E56lcW9MrJxlliT/UT5Sa7WYYr2ltonSP8QVoNUoq3snLyZnx+VRcl0j3z62ke1M5YoDW9PdHJKbA+XEnMCPOU71fLcMylZUfnogWBnd4c4BSJvvSbv3zc+F+5j0a2CiF6i9UAmC+bRdOpUkwcSfWe7HLEkgn2I7LAwaLpovRMpiEdU+gG+AMdzlON5NHLsxwANIBQAf2/qDU3ySDsLzqZ36n58qiAhKOvv8vfP+Qv2htngthn3YWTYByIJuZEL2y1zUWcj4iwxTbAWnHyvrS+pdc1o9lKUsdMtxy5rJEf4SyzdhTFhFT1hq/yMWVDHQcYscZQlIRHW/wpPTgUVenZONtdepcYDPvDuxqxB6XbcSodG8NO9zSmwyQovnZmK3qpszJKpQjNHTRmcrydbGJAaLG5cFr7njFwda97Row1tMQWlaG20b7U+IdMa9Lvw1WpNMEMgPKbp5//zB+WftYC5345cvby7u5G+YEt/fAdfeE70ERFgx4CcuJ5wVx0dSgzoDGpITPZND6k8lOpflJKJPQf5f5+qkEMFFKiKBk1AB1fehc4l6om3Frj9x4aC9OGTZhSXf6OOJeSnTW7YcOahC1oA1DP9QD4n9k288GQN/lm6LEIEVLOXdbHCSvU6+QMbg+bYbz6vtWJeHdW54ciRkt6LR3iOul9X62DPBEgMBI+SIj20z5+j/gF6Jj3eBQgcQP4l04xI2fPYcWmTeBewREi6WHjPauqEr0sBIBZ8QAAEUVQWsMZQqOQrBxjjOnUe7rJj3X3Qnr1UspvLC6HwhUI1jNqoygI4MYLWaMipqqqcp2G3mUZ19lhMY1uhbk7XqHh0Tt9Em1jYxSoRTjgEAv3wxtzhw3M3HgIWiRV8+PYYhs0yDX+QBVJ7Pn03OPjYLsfhuUeOnQTVeRHVgrCfT2fBI/hRDpaRmnHzJ6BnEgrPZpKquBLCBxhL+FmItGCyOY9o8zLqwoTJNtr9JH2THq4OHiCXgyjDVD+777IYfUGtYPcPNxvUBTiU6IAYTBlIRlISA4lHigoLRf1GSghYdyFTw0vScoYdjgAE3kBFS2H63DLL9ie+6bHKjJQldlvYn1s3voIfU65Gs2q8AehqhhSHWzXoaKFNBnQsobnhXv+h0mkj2uFDb6+0znHCp/tap2Xo5vOavXSsv2XjGVdp/pW3h+5wX9d0qP9eKj6yuLH5Vmxo8fkXWppRo2pYB6fPHELf46iqgjmpcQI31kD5GbGLgq+4J7QS0O0WHuOe4fodq1s9ZR4cicRIK17Rl7rF3uphL/VHhRM2jHrVPPA2KXnQtoflREjkd0bLz/PjE3bl+voybka9KSXDZPjz7wO57i6dKeEIFMbblVA2XsO3cgmN4wR7qmj3yDyKTMo/s0loLqe3mI60ZGh0WySd5R7jFl0J7OKyZsWYsDkmNC7aOwDmczuPQoyvlf32ChKaa/b1Gdzm9fWVfs8+qGopz7B5IlTL4528ar1NVRuBAulkzoJNvN2xrbRb/4RE8Wc0D3saK+HdnR+pjAKhFzqqPIM5cakCtwH+Qc9/FAIFf6EVdwcJTH27xUE9wqM2Exuv26BldvjdQXURlCtV+l//H/ZR3jNm3j+f5OKVG1K3XJcIMAVSxgAYfw2kUl4g8yz3mOtW0XeF3FeiGx0Vgn+y7jLiYEEJH+V2qUepPDkLD5PKNG5YO6E/uwuJP/KnGyp1VjD7q+S00+0De1sBNCKuEMPOgiy2F8TughUacdO8sec87OeSUkuaK4IIB98dhms1yFd4Y0bshPAYUAhP/H8fPSrC8KU7RRL7gwWZ1RhEg36/zzoX1AmSbVxBtr5w+LLa/cvrGVxYWKcIZLf/q/Urv0gOazb7/1pi3uzfV3NYDOSsL9TNAyRfuq1RhBMS8YRaX5epvWhokEz1dXzXxhA4+Q0JwtbkWpSmwtR98UlIwjrGi29LfbuMCsxhLy3Va6PzeFZxMMQCwnLKzn9MQ5Bf4IQIFEQQNmgm6LuTU6VxfXDfqPI9mhi4fjM4vhCh8V54jlPfoWO+qNU4VW0RsfdlfjewuLYe9JlWVVrHOvR2xq8L5Ftt6T6FvxOAP9MN0QjgcBt99F8G4fkQZ0sGQt30ofrDXwol61+kZz33SWh8Lt2lxIXy/lYOXjHkk7owCSJ7k5Y3hoNthnPQOcgP6pums/TRQuD17E6elEnBE3CHzGl7Cl1KrCDqEPY6TbiqpdJ55CWJxXWG59UGAL/6R+YEzf9W1oGhArUL5tIBawJrPG8pGs57PB1P8UdK16WheENOajMty6obqu/xEFctNxczOYofQsaSKFQKYNpQDB6qr4hYH+m+aYqRC3cIUeU65Z3XwdvwgDbjuCkSIlMRICMTFrct6I8MCI8sriJ2CQj1hFzuGupkfm4VsJEycnIyT2K7NoJbllSB1tIKUhgPq0tjy1nz54qL+K80Y12RPrQUpI0GjHB54KfmgWoGcDoaBEddr1rQ6NjIJBIwCov0+l/qTitNN/pZMhhsFQpAB3iH6jYHcZ3hCbedNJ/V3zU5T9TQopx9EVSTkHL8ZjX6nzL/axYgdAGq37K6fbtwxFVc0nVyupu3sXNWbLjXqoVhh/W83rKODX1Wbdrxx34z/2dtho3NLBhcN219lS2OwYQq45oQLEVIm3ED5yRZeLg9DkUVmPz+X1YnnvZD6hmyUplph05Etfo59QOdkS8AC0MZYrKzwdj4eJ2hQDhgwTJJzKosIfHRwgNm3YSybkXx8zjeYvH6KxJRkJQy7KqY671DWl4/R/f4Vmbi7PbnoLGyBPsXKELr4Ell8/wrFIk5rRbuOg1BDA4Lw/Wc7wr/vHaopdTQNNRSQrdIINd659Gzeex8/3gbvq6c1qPbVz+ARRv7Ehp0tNBGTw7P3JThk2Me+5Q99ZoxReUkVihU85Ka18F9C+arclkYDqMhSBxoUSEuRi8NZBCe9vTVq0e0g54w/+/U0TtqFwc4NnQd/sDE6qrFFq7s0Ak43NV55PgL31FHtP0vWrWQYTMGPQYKy8/0T4Gqh8Jf1dikSpqZUNeSokmxUnOjWj2OkHzavEEjkYysrIzwDiORc3Xr7uabuzsu6+ndGga7+i50itepOupLFklUJxeBNpgalcptN5jSIvI67xrs4r5zBwPFYhLHcdd5TOJAWixZrwliZ5iO3cUswf6/bp8G+4mYew5PuDtdk8mqIV/jIj1jF/jTugKGmoJkaWqbMqRH7EK/WLUkgOO14Hypqxd/adshsaGCKm5U7gElmwIT+zvPFSrqxfbkXjPOL2PtrrlFwJ8Tc58INPa6QwN3TGp9KRmx+eI8KIaeWXBId+Ld81eLXpL9SEyMLQt2y9twhPnEkUABd97E0J9wxcy5nVX6S7iXwKE+Meu3gPHETMu+qWbiBDBwidDOjpcbPdRf64zxnyELCTn+ccZburrBxq2u+XSELWNcDdUJQNVx8V2ykuBDQUq0r3DNUGFvfB55qWxO3uqRew9GhvMqM7NG0PjLeEx/VHaitNAw1JtWLJGQu+Te+/PUakj1QShcyfTUeOIH+vufvgd4dFC9DfWvqlKlXqnX5eUAU7/vaCKRSLDG/UpuI19wvy7CJK2yAhmNczLwaajx+0LM5ubxe1TRdVpLC3Rc1EwaSYcZJb7t8SqaC4y/UPg9Fnv5YuAiVbhRhyJW01J9CT5agtbxitIMpYHFik6xs1bdrgLpLftKyexoAgzPg+HNDcNeqdnVwQwRjDuSpkZRw9QsKivorSL1ItUwMCm2Ojs6VpSnElA4KmUoN9JKbJe9joubMG9IZV7GiuLleSWBYLyTHTSnx1nSW2VYFn2yNkv8SgXLqYSREswAAF4jPMmdyQjPSd9fL+6uMjMtQLFsszSWy/tgyuxQ4j0B5ksmPS4p6c3VnFh2TKqIxWaxb9kLnYtCR13ero0W0isC8ovm2IJQebjQSY5uqVZg5mstflOMxWTQ7RFk/QLYY1W3ly7aZ8aXJ90gMU6K/fWtMFAh9AAIoc6vgodIle2oXUhmsBKeD1u0WsJ4yx3ixQVcLsIgkeCAvSuiXF8WNBNimKZPdq8a/4KKkiO7rvaxiMV2IYJszAQs1Hg87BpEE3hJTgItRhOC7GUsL4lcbYLe02S0UHmYEsRJcoaDx5AmJIoRRxu8S/FLthaE1ocxxHESl3pHnyGvo7K1QQXtu8ARuTM4rRHMjc0EOTdVO8i0VmXmZyCw6d2MHr9Mu/jOkG+cdHCSUjxzmuVrMARV4C0LgqLAgrDmnD1DmMsBvkOxnp7R9hxXakGcsrUM2k9pw+2fjKWSaWwwBxhHdGM9B1SjCax1NZ082YTxhfonTYo+IwWOqw3uQadEiBaiw+S2hRCiKehtgyLHm/EZWCEQDi3ql86cYb5SHpWqgrmZX630kX0pO807NhPF79CfsiiOjm861pT8cUNe/fnHle2p+63btemtQT2OevkaT+8HYsoJhWSEfvjKxdvb+7aN1+5oepduL0p+mMeqxaR6U+gsSoKmSiMyxa3D8xBpC+H/Wn5fontju4weXW8HlmJSOvR2Ouuj4vY/ZT8JdFpd1rjf1aDfZ9WqTWsO6hYUJo56ep9xsx/lJcNVQ1dcWd7au2Vz9baGN2l2ouQHuaxal2TvCBoUEZ9UqRZW5qxRzEOOHCRtBMSMa8BpDN13tMa/BRIj8+avOw/N+MyLyQklectHH604QDU6eXEptKisfOKMrE7d5z39tMbsxd1C1oHFXlz+qVP5OF0HAuv1ql2aP3u8oHJX+bXy0lt/Ley5K1cPGKRx2SleMtX43/3HLcjMG0tLoBQwZzSJTNK87iZP+bJTULxk7eACncWeLW2yFYAFxz73uN3zgIdu7HgbylF5WeW0jgBi4RziiXmmQxJRmgibzsf6QQDPGZMpCJiPQsvrRGA8YJKI7JnB1xizsbLwBem//jeeyQeRuyVmIqVZiRaTFY37PraS2dCoR13cVH3qX/Pi+p3D6shUGMQsYX/S7N9eJnjUoKuR5yx2pTSYRXBX8MK2n/JThEEU/U7v4oWtCGdq3ineyeziJqqKZJkADLo1C7g0rX/k/ijaBAjn5CTB/eNzROJC3aZ4nfBPn2gRqlhRn8xM4rJ3mAWKYO0fcY5uHVDuiHNUoRdz29UnQMdUesC9LO0yH8zoSrUqbmreiPs0X5h9M7m4F52cu9eZx2rF0qstqyVp+ajypb3pCoDytwG9wlCST/OkRj+PrWtqU9sj7QcER/on68pwG/Yx5o4dvUrDGG3qYgba9s3VYVvvMu+x5T9rS3EBHKeyIYyIQC1eWTk39yqdlm8w8IGRacVN0mzkPfXfuvy2tO2qv6WS9r4o6Tdnqby/X6vfx5nHBFfl2KOk0y4u+40KjA5wzdse6GukjAOfrgvuIw+s8/j4wWNdBkDg+QPul5KNcQOLb5pzFl2sdkuOwGld00MVKx2aSzbWCy3tLydTosvoe1aq4UYjcAXGpnVPJuHlZx70eompdfLgdJKqeGVMlC6KqHbec9xNZu/Rn0Av484p9nWVsO/IG0HjKRswIdu9+AApL1m4CKLGXyRtVT9Tf14V3glHcdEB2ssTyFbEi2oudt3W8VVIofMwwcptx5XW2CozEqi8h9BiB3QzgKPaySjhzyRGI7HEUINoelqYsrJvEbYU2lyiyGT55rKgcG0cTJF+9kwMag4TYhDLbRBtS+XQxwmocXNO8bYiUV9RaDnRCS2RG9vjs59DVc8DAdGf/Y9P6j3ehvZ51DXxhNEMWWvI7dQfisNOLmUcdZtprSN1ueXakuCgoLmtknDVDCqT2CGh9ENf37szjNVR2nCDYXoEbaZnGuctloyZCbkt5Ynz9AcAAmsKCziJq1oHxMPojqcWlllQlGTMH02qnLHxYFRHvLXQHGjRpF06q2T41NBWTs12AmOqVzp3mRPrjXxr0oEuOtOrHo1P3dqRc4B3HCBwAFQSytIfDIC2JXrOgdmHwSrsMCnYDOoeQQcmM6+SE1BQUV9pLt4tWukh4Y3R9r0l0VR09qj4ZjPra9e03iu08LT/ZoPQ3TaLneO1B6ULq9U2bVDQ0Y9INLHXhxiFwzL+1fwKsXVtTUPNpQbnoXBtKlnLrauL0jkOAcJfu53y4hVKEVvE8/O6Ljm01ybz4SxygEi4ad+DOMmFoO9hws3WyN8Zl1u/Th6YbrP+PI5DcnhMte9y+Uoy4nZjGBT+5D54zQn8nO7WEeRKHoIjdeOkB7c6blmTFp2YfRps9HrC06606V5ZO5625LF6tOqzF9OJrDHAYDd6g3Yvmphf55yTsMoOe5DPGz0nVIcgYErZvF0YAvjIh1XLAilLe3b7W6WEFLDVnXmsYNctMC3TP52awV6Cmv/HW8ltAw9TxpAewj35A08jX0StrZ1xyHEajm1SHzAOzRrC0ymVCmmiYhFKnbF9587t+Dzdd/hv4mGBARk2ulue9oG7XkSF3hyEWnpgr6uc4My2LkTmS8/yp3/NGj1isQUJm8bi7mKIAOSdbK3esnftl4JN4hia0wY3ZBjWhqWjCIWAFYDtI3dRXSGw9tjLmJgU82cxfUJK2jmJhvrEwtSO8Umu8z1DVlKNuSXOTNVNVaJdQyj1KyNP9zFRrmRqyjK+uX4SJsdCJ9mpcL7ZY/BR3hw0zBsxI7CWmnEdyrhMj8nMrq5Mm+KekhYIm4YZDkdadCpqGJYeSbZg6BbbUbWijS/QAkhKZX/WbLnoh9If6LGOlZuUeFswlESj1owxwsBTVEuJYWbUO6IM+NkzYBdMmLB95I172KdKESY1s4CxxNnqSoRet/z1tEe9j4ahhusm9faeeK3usiVuhnEjI+lHs6E3lqT/cCgvOPmEndfKtkobR3nRG772ONE/lqT/sMgrPkkItKWu+I8Q5YWLV+K7VNxtCkFqmPcvYogHpoizWUZOR/91F2P+BPe1jlyuwYuIzzrraSW6luFmVSxwF+aCSeyNcCD/ll55tuuVHwj3QsBjeMIyitDsG/fKFg1WYuCnNk4Bv2QL1tmN05lUgOTmnWwUxleGe3TEiFR78JboUxEeL6VRlVn+pUv9jhXVN7fkIxKuu3AWUWNHb5He8Gf7UaCARz9lPIDztOgFdBmG/edKoPjprDi3M9dZtbXeqPxGXjqezIrjfO6Oypo4YHJ94FHnwWhG6TTV66K6aiKzOmuiMjtro84uLO8m/tZ621RJRrdUefg9nUuZwjvCcHICJNzRsoA4Zl+bk1RJH1ZbhYpbAbLFumD2wuYuTg8wzlW4qeM4SQBZnpcNx0Q1D5U39m8tChwh8212OamPHFwvtUtSmZ2x4iH9Hoz/Nv+IDIFi6R7JXLUrJ0nnZS+xnWH2ykZ6G823EPu1e+2L8/BQfPO1d43DNGVqLaWgdMLboF7CXN9TS9crJ7xK5vtSm4JT9I4AHWaZ8A7I5oIDNL6W1JYrxmX50Mci04PWahpckfPKjOBFzS4CxT5wtubtlyHNXOy+9UL14LjDfXbahk4hByJmxeu641KLMHLWR8Dfu8AqudD9HyCtxvaVjS9KleTz4jYbmE2a/vFu/+vKfourfX0YPPHtjh1vE+Gw4JjnbM+4+3Dv/L1mJe3e/xBuft3YV9VY7lXhvGwRQSG5y40h06vC/f0462lEKrl6EjPJ2UC4hUVZb8oFStJO8UM4ZqQEt5IsA+NSHRIJnMaPg23Wd/CsRRsOwfEoyWn9d0yMBd9l7uM363jQrLvy0zLt50x6AKwgQqIIwSzkJxpcbkBP3qRsC+/3/xhvPGmRveNZVcjXyqOWOoc4lt5w7IB1o4ha5RM487kmPuZzNFBjWKFZ+xOWxd/P7wvlEY99dPKscI8ttAmJjnlDHCbqH4N6pbHKCg5aYDehKao8aZ8dqaI2T2dndH94vApoVEm6H3cxYe5yzMzeMztlrhceu5nlMHT+0Ov8Hv1Zc212y1lF9o3ewxp7Ka5LHpKS9lkbaAH0ox0mjduRx7aF9xtYnu7W4bE+VCmrMP9qSqL52NevjyQ3CqC/k6KA27dvEsFVY2uXsXfx1Fk7OKC2PszrgPErZ9E2dyYkHdE+3oJ1y+u27vo+G8IK3VZa68GISrQFo5EatLhngsu/5T2K/oM+T4sB5Wnptl1AnMkB/+VRWdb3hvmn99hP2uba8r/Sxr0MQUmuTiVGKJ3gmgRZ/jnMOaPeStVDCDTOUUBK/bi2OaDhda4zcD0FgjBBo4oxCrjkLF4Z9T4FhCi12khSqdRCeI21TNSHiGotGPDt72HacDOt//s3dWID8E5WNHwHEXWHoOegi2FsZQyNmnoIovaoSkDq1TX6q+J5uEMXB41RQFJScYJP+aewPC8d5CbxHUlHJgItcEBfUy+7bW6m9b/YwgNjppBaNTv1PHkECRjjyxgv6aqeUJbIZX8g4J22+oGtAvCiBJTTB5ZQLldr9FmJRDTOATztH0GK+qXTF6aQTseslZppxUSV9g5OJH/CNyDt9y6GINIry8BnHEmcZ6HGOrUjP+G4pFB1R5cXcSs1PCiTGc/ari1Iu0pEnxuvuOBVMSZn7LvOviNZuQIYI33Eg5CJBy2Uc6MVPEmayrmNYM57NsKBcNhTpPuadUHrnG1tFotHg3A8EO2Z3Ppz+E9pYzACyraCdb8Y+AWdlJxmHsI1byMPrJKckh/a1S7vb12FbK48KH9J69WWK9AgWxRELZax0xJkofEEv3Ed6p274SkZyzxVUHF5b1FeNDlLHJsSIwkqwb/xJV7+5vaPIlYfdoQcKi3C5upz2XkxIk6kIcM0xgjwXFUk0Z/Ki1utzMBNfYHfkU++f3ICPZn1Sy2RBwqJvzgySeWt/t4rkQjKKLEdWWRtaK+mxZCInAVMYaC8JFWZVJeuCvaUQ/coBg8Evtrlih2OHScgSCgEeA4IGcsVtQr2AwPKPZ6qPFhVl65RlKTKA4nCBUwOKUZNi4deqz6GwryFcMXeGIXvMQPMQriParAqvQ4IGU/ygO18T7EODBQsgu4Civ2R7jDJ37CvyrkC0L3ziCwcde6JgMPohPzAwgq0SHP+EjW93sSy2cpSpdXqKKWH8/WNK6TQRrtMxx8/RmgjfkoX9PK9MQ/1lJaWAhwLlLShEHApTyLNLUrIEv1xEA2bAsmDN8d1NpXXKNuEor/3q+z/7pYhUECB6gg+GsOBMZQKAKQmFBknjnMzrdmHhlgs6zlZgxd8v3Maq9NByENFdnDGfMy6JRSYswQzuDcff5RfKnhD6+Y4zwo8oyKMHxsnIkfBtfHn0iEH3cKjxBCk51b167Op4HPAJjw2RC1tno/Bm6GLDoF0rnSeeuhxNf63Im33jK+8Suvc7H1f/CheDr1t7SdWoLObm3MS3gLbtEb3PhIPfSpz1lbJFdOHAxYisKagzPdt/Le3rQbv/Pyo1Rb0qTlvcai5p7rR+XvBlG+skCEMPA6if113B79AYQ7wI2GMxOm5WddZfWnBopTEfCPScu/SXPYG8omXSQwClF/fmYlXK9vLIu2Rjv/cTtyegjCXfJfnpzmnOOjWvQouxXlmkKS4CO9u7P5zy6EA6GKYv85+HXAqNUUjAfIFcwrLdk7eOT7QY8nk6LNRR9Uh64DDmscPgTj+/NCKkXmzNiaqygy9LTKzflH7lssAgVv0YeG5lpjr0L4pNdUf4+PZ6V9bl5F6719pHu90quXzYijfrR4aT6SNPehDL/rJ4JwM7Q6wGVA0PwwPOeZUyywC7jEAoq/VrNIUhjnRzSL1Zr3gyVDurKZdU7v12x/UnH8oHzB2NPtzz0oHc2K1mW5Rt3vp7PwGfc0MI8FApP3y9+7Jj6DxnxmYVdnB+xO9pl6+nFIrGIEvNvcnChKkl5AZi4sRyEtop/ct7d9G+HOBNZNY/rTellj8eVhR9zOI1f4H0ukNgLid7VdL/YrUYiKNqCbLw6LRe9Zb7W0TlnDb2hpaor7i1rYvyrKWw1pby9taLWwk3k6KZZRXSFcGz03IXxjRClbTp+R45nOT5ICxWA0p5NYcH5lvwUMmqTbZbJhrdElwiaFdAC5AP3caU7mehmiXcy3ihiThOezobrFQWwO2n/j1sI5wg1mP07JH5vUfOvWlr/X1mUXrdNHX5+4DYia4PA2YRehf6/HRcNEwSnR6H8BYDKetQrSy9awuUvbt+vUKLkXC4sSOoJR1LTBPU0LDvhhtCeLb1ceinKDx4pPsGgdddpQW32SdYLd/y8OdWBn/UP/gnOL6m1sNF4zqVu5D0zRPEJGMkbWQv/cwJnrNzXWgwDTGJtEQ1EWhypkndNlB7vbNQsG1Jdorh0TLjkccf35B7XjWHvC8Q1BLWqoAl24WrJ/nvlJnvLx4wivO9BtpfBu4b/HKnOLxkjist2+cF3FKs2ADnBTr/EcU3OF+DIaJyZVvIFAK5zgQsHkPdXGC66K12cIIzPrW8JCgtfqZp42Nn5nVjD3Gtp8Tm1TcwrduMnCtErm/YUEdL+FGWw1dK3BetrVGtRebxCjK8/3CP8msM2dnAfOz9dkOBOxRKbQBw8TEirUORExtNPeYRzu/Pzgx11vRq9RU2D4gPbFROBrjE6opypLeNcGoY2srZ2RSvvYAhogdwxJBfIZ25Oz9Yequa0Jjev/t5VuV6clDOJReJ7PVpIbUz08HgFMwt4MqICmbNXKP63yfgMikipNezD/4en23W/CiwIFTVwdV970e9huxBOxUfRqBjT9M18D2+Q5VzV67wIzNfRhMCdI2aLg42w3uYuKNx45F2rACbrwvhE0B0dlBhQ4E7DbK4uv7tpM2TWsUPOnMdTmNbzUpP3GpCSPGMDE5daNBLsptWAIWqWnIqvJmZ8ZRfxqTt7pXb/H+Z61AxusYdaw7wwnJbxcjCJalzPUmj280jhFPkTpvbtP0TV6pnaI7Pp7ncoIwti4nmn0XvClY9eQMIqI5mbpP5wywiot+qS43QDO8tPLxmr9ffkkq+o+VYPqFDuvWo8GxEnGtFMHKXgxRKFSGlc8D2ATfoDH3YGAGwvN3Mo2+3sZ1raTgr9WTBa/XBdijCMvaxTAGEoxG77UoemM8uchtTKloY/L1LXATFIY6knxtA+neLseiuVZmaEri6k34fpog7VvQtbR9/PRyisoyiwS4fvzooHd6SgWQOtWNe+lzCRCeMxH293jUutcsR7cgnU1LZLyasHYXJWLtsW++g38H1nwC4Pyt2mw2pXoJXmFDRzt6Vmy4DiB8X/XDD6b9beCvt0WpWlFsnO5aHOvuPme36RBzU2+YrL9sB5sDh/NQj+SuGzj/Q+g0PkAVmo/ygGUxYhTPgh/cHZzgCSAO/sx60Nf34EYIXbU1tgNRxoOML1kN4XZBZkfbVxJKO/+oPd55dxZAvFK/2+X+cboZXAMSa0swezJ0du0wBj0idw0wf8RO3heUA/W8cg2vRO5u2gaDSmAzxDf5JS8twyqdUp7ugC5VK/xbbK9RnYY3SMIWf8HX8zB4G/gve8eGAXGwkME4PjZGsr4OJzAqCEdc8lHbYdckOwOeaIlmFABFQtf8p5lDErqWhLctYBkwgd0BKfCPg3mUW2jKkZH2E7/EVuqVCkgynnBDihm0eFG1UMKl8Og5mhI+Jnpn4YCtjyqVK2vJvIQnxRS/yldfpH5J+bWOwVBnX/cQQ097YvHizsyWiaOqYdW387ZOycgg8ND0Cqf7fkEnDpUvAknZ5e2Mn2+ymfXqHyKnDNrcrBoqMHcCp8G587CB645LGqNPTHiL+4lpMcBNKn/LgHrcl7F7mSCbbc1lSrohLE8n9qhaMk6KbQ7CDwbiOqi0jtyiKkfHYOD0eF1z0rYjZkRcmBD9AfK6FaPERkmCnUh38+1dEquqAJJJC/uikT+4NyMVyIJViS7xNXc1ya7OUj83+9YXkA+u5DAckTq9M6m/bhMBcCY5JudWdXCwHbSkQUZzkBSbjBtVYztJfbshXI8YrlV2whu05X2ohAFigr8PmXo6zc3OOXke3CEgUtnU2NfOvpPuk978qcoKTkApiTDfl0RkOyhBsFhytFtC+RJO/mEdHyuW43vHzT9YgYcT/t8vp6pK2r3VnHbW3bbDNvZs0qRnjLSHTyW6pcFQCijFL1arzSDqag6E/j5NVI3yYzc0YsmkXux+XuwoKXnHFEm9isfY0IRlN2EneIxVJHU4lZHmL6Gc4pz0TvLOqCcWbrrgzmjotJGeNTHb6Bk7vl5uNIs4677fllPNcc9GO+IgSngOiaTcyvBd8F3m5v5ZIO4d1k1HLVdNqMbVX8kJSw/jpsfpVqRnR2cXx+Tj0z6Eld1XJvrCGRlpvSYN+wzJmdujzro1y1iYbrwT1hdGPmdsYdHip7KPMMPmEcJ4KXuT5RviONzcfT47fM7EOQlpuCA3P8TJa07BvBvOwVe2vabm/xbis/wg+dVB8vJQ+UVq9odw5aZZ0nLSitIT8h2SShbhEnAYN8N+VqG72sC3OOC0y2+fP5ej2u+7y9f+6yCHq9rnrfwzI0pGCTtTbDYQUUGAaRLdf6sEpPEFQ98P7GZ/VDBZ8nceAsJJ+/e0K37UHrRbl7BrQh2xBeKTNNExTPmoW6Eq88Y7L2rT+kwBQU0wWOV9Pv0QsbmksvUu5HTYunUVyMN0H2qNssRpWo246jbE7KEp4xCxpHUR7B5k+Jr4buOu/ATAuZWrv55/P5S02crKFe4Kg3xuNG9au/M4SNsvo9Bo1SGr3QQGfYNJPqnXFh/e/N9k/uQJ5H9f4xUIWfYzo3JEkHdjNtNa+bXPS+UF2Kz498ZBHr87+J9UyfidBQEgR1gZS2I07nAAOkk56Ottjcp7Iz97/8dYJfalQ7CHS0074YzrwgBFjSh7dlQSNgtMYZtZfcZq40+TjNGtVPbQsr9gEHUgsbkAhJXtu8sfSsTa24P1MmaEMfbfRJrp464vn00a/OhSjTGzQ2KHFiBAIw/EXiR5SCK2YwPhJRvfgBvkwJDiLhNNdL7YQpvJbDcg6pTVXoSnyF1dXb0qlwK/CBAYEmXCZ14xOo6zCXYidKq8xTLt5T1NQGZd5026zJ9EX5zxd2B00Zj87wKGwf+mbZ2sqpXIdR5Kd6UiQmibloW0TzuTGxv81r0ELoSFd4kzLMNlSvtWS20ExEMyTEMUedOdT9gHEUz9gVWVe8ovXCKI5vHvS7EJaIGekKoJv2J4GlqIv+tMUhK+mrppvU/HKD3utnzS7aT8x1Z9iLop8LXXvp3gW1sB6R/aUPZbz/Pu8W4dzPPkMuw2WRedS6qVCb9VGEwTmn0DklcZMCR/2oNSOqCnDKVPAP0zSWq6KM6SH1LWhUqNgAvwkSmnndQW+e23prGxBfsGSJtJ+4PZbpxTtyjLZ5hL6nALpajvMptcn4+mDm9O3e+BHXlh6Lua9q/BnjiUJ+SQ2nC2DrElG3/XAUurRUWpZ08YxVs6KszXuBAAzw9wupjis4cEV94f3vr8GcfIRsvkdPi1IQNX5W/j9tqngiKyy7IiQ9aAb4jFb77lQq1K5mSGlzsnS82S4F9f9vqeaKF26ivb85MXDAyBZMCBA7bkyN6NiosgJwF/l6ych5KGVpSv4bhtrBmzDqpJLl7Fy4UJwbweON/wQp/jr3N/rWaJRzDY/jjj1bwasirKriC8mRTqqZCtEVTSlYSjY74bszaIc374B6DuAkppbbAXFumxFqR4WX6t6lbTKYlJurfGmxWvwCsI1OEeaBf884HKzpzFO131nkWexNAcQgFB0JAFUZmJbCKUVdXaf4bwtSzeQ+wp/hDkJ2abQ3vcS0SGXdpwIygcBV7xzt8eFbrlefcOcz28mRg9Vbncam8Wbv4Q8GxWZRT2dcn4aUorJM/aZMVV3SO6O/W2BU/r7ZwKCT85rzKcC5U81zuycT5vCVSvcqQeeCbWClu1uyct0nimcKgwaqdb8DszDpxJd+mKDry1gDZOPzubsTxtJyqMeETX/T8kQeDKgvEaOA+JZiIiMMbvu8paSfk7jKMgX9+iVRJjR2uoIskMBiOYKwtRRQn6oHAPm1hkC3zErcynxiF4M6NmMvb5W9D0RoOH18lL4BHBb2EAneYMrUt+ttu3Uqk2CdxZw2Nq/NM8hJdMXegXgyWh0hHSVFPLtlLnT42eV8O2YmO7wqPHZdBQhH2OUwwCFr2uvBBcFvXcCh7e4ftUhB/d9tF14aQgaMGMudCra6a7LngIBvt/ewfI6AjfE3paCUoOVG+MO8c45s1IyxCviQ6Ay1AfXkVzVAoSJ0ucQMHkBu7PBPcMCoR09oFC8yVGauRkQ9N/g9fXqgYWDW+xHaOuhkBYViuuF+PqsHouBZMHVK0UBPMiISKmxhuN1MNCw56y4AK6zEbziy5+i1+HHJlhY6hhCxs7odgADRD0OyUjCU82kEyb9z1CDR5kWJiZ4W/awAoI9N+hvHPq7+VMniEuiEEynVL3IA8gmzQKoxmpmII6HWe1X40qW3QEl4j0Uypdjr82FewsgRtPObszA6ak47bfNf632JYjXqGebIMb6YFtvBcEk1vKZaKF0J++qAVXqAoHPeg2OHXHULwb3aTkX5fnDdnHTe7UcIIiB0uOfXEUndxmGW6OVn0UW+BboCFxqGWLrqMqYGcgaWbN8qB8FlTsEdsvXAt3hEcz6wmVuXpD6lVsco65s+K6zs0TUUjkJHH+fXJglpP6b2ceqtWaZ8lPM8sZPemqxPq6K+V/G7wb3Pke9sa7gd97AATfTp9iAdzzLXCpZ1ty7zqm9I+Dva/r7JbwfkRmGiywFSGzPqERqUsGmqOaOVlSMrrwdvFy+UQz78Qn+grD+JkPS7Zn1YI/aD/Lcl/61PhLJgxgdM2h8Z+eiajO7Xk3hdQmLp8+/XT1AfR15zSY35vNFEe3Crnu3TroXhZNinB2hO932rTcWXp+HNqH1bH3Tdmq5SHBUlebZMU7syP03wleg3oc18qIg7TwxQZRFanbDHRco1d5ArtcFE9KFzE0vsc6NdJcsv4M8JdTWFSFt90g3ZMSHJr5Z+d2tx5WOY9Va1gsbbZpTbJc6ui2/g/G7ihujp4+RZ1JD6EgYbu370nnaYVfFB+TvSyDmNrix+ofKPcNFTsuc54psD01nkGeSZ7pKNzLd1ihZ6d9NFmTlLGRRHDENJesexrqanEoUQrMt1pKslWNWmaxS7H1KsV4AEN+cCLSEjKvrHKDI+skIQ6MSh6GHeR6WgVZ0S4OoF58EmjQ/X2gnch6jsAbslhh444VSaeLqEWqWGfQdF40q1J7/rNmFBqKTMkRedN/cAjR4ZqayQYAMd6ofLBPBw3eFDLb4DXeIgwM8nTJVeOSQenel/KVQPb/EXX7G1Lkof1QGgROtljGMaJaTgaB/v8vqNyov3im9v2qlUlRr8OXBwaWw18DBI55NpBFS/iqoaUgL7y6oRG198cgY3VElm+/uoA31aSvCdD8B9Yd23wy/NBW5vxD5QvOZitIjL0KtTpgvnef+QFp8sR52/9+d2u45ZPWdEDLNE9FXSz7PLv6/8nNpj8Pc+YSoWIYMS2rhA3ySr+S38NBnLSnqIzS8f5BMuDSLT2GyXTt7LmZQ8LDtcyN4H868MAPCumdQmGzOwX1VxfpkkNFos6eFnL/5XvnYMkmicQsHyf023T/3ewVjopbOMEXceGJde74Ci0ox0rsXbuYNA2o2vOZsuvKuTWr5/Bhefy3Cmho+lmx/Zm4Lu/+yzSdB2omsLYakzTf8oK2YfYcovYLg3HLJyiaC4U14JcVEx2E8rgUcxqKWMNH9GpXQpnsht5+rZKFyWNtCNu2GIwv/ZkuATYdymH/XxtBNbz9+ys9ZLzc4ww+xLlfLhnuqmjPz8joOHRC4XO46DDED0hKxh+KbJzhoWxbVUg09nYuCbvKPl3GKAprjDkuoCBVlEE6LEEtFay/xnfmhXnKsJDSicvxVuBqVlUMnF6+mIF9sHx3f1RIwdOYLB8DQXHIMDss81pEKq7cI3ufvK1szEg34NViHlJY7zBDgcdkzXVC0aL1NdJkqD3NVrBcVD2bUTMAE4s3bwvtcRNBzJBB+4zrT/z8Bmzu3L+in+ch+617X3VEDEdfk63Ocmv2r9+YVJRemJCifVfQbykYLjgamJispXxnVw9QlUNl7kqfvfaceO42TrLT/v8H3x8ow352B/xfmTuizp4Oqv7gUz8Ii5mLVyMYTfzLv9/XXorbf1PpyBahz21H/w0bzrhKf5/tUTUwBwYg5ZlpujylJiuuyDsXHoXxVj30S65yVYS8CpwfZQ+TtoOg5sQj9gKnLMsQdKyeRqRqw6uqws6TGphVsgTJfE4ndUyk4sMcodF4pYcmiikKqTZ3cnJvR+agNAEXDbG+3kzbUre6CWdulIhaYZ+jucCUI3QrFTLkPmlmIQh/Es+lvRwRKce++T4wJCbbywRxpMC82O1xSllckqfaSQLWUyily6Q3uF4cKw+tJ9XA1hmDxHeU2ZrqemUMAo0h+GWVhi3L4c/dmXuYhWG6BY53HAPPhMT8GCCk7b1LHCKrSmQNweYdTHkiRonN1bsP41CMABxuiCkPh9C289z1DHeXLVlVuP82TPo4Irgh0aH/Gd58zkYV/Go9Y/ToyKDswIDs4IFFne32yM5S+tDDeiH5PKtuVRc8pFFjquaM5/Da8Pf3byvx/C1gKHzJjSCHyO6hTyzwinQcCxZjUtKHE5/Thq6eBYovauRu7UA8l1GgZ9gamxir+fc09Pw2n6GfVz1ajdqSkjmZrp00Y0uottYme57b3n3uOCNa81jzHu1XVRdVK+n8UUfO0flR89zG3+QzLOTrL+AlikVvnKMCjt/D3ocOFNW86A7n9JVkzTd6fQQNIx1Pt3R7eUQiM+GsC7vC9EuezmSulfAge0N1N/2QJ9INGkMpboQwex7PNKxrpq2QKHwJdSg1/ZV1KSLrfLYUViD+lFdyFJ6c8GWuFPFu3X9uk97rWFeETx6ke4+EkkJ1mVdVhwYfqZIsMkwhjSiLS324ouSK9j3v86OGCbJb/01QKeJzMvHbbKI2JeAYag0jXEp/ZzFhXhw5UewaHx4XLpn92EbOLwr2Cnl8eKTk+CaOPnrUfCUlTqmIe5AGObS1Y9eJUydJ5iPm+sDcsyaRUUa+5YxutuC5lZISGaEMIRpKxoRlA5llkW8cfSzd0FjWTTBj7H8Cczld6ZjDZQMwOHX4eKzk48Hevv1C5KaCwOJAaH5UJMUlCj/uzy0m7Lk9pd3ERXObAqZuz6jb7GYnJIL20IRgOeXPd6ej3+X7dsiSnN+W09LiJHNOebE3etSv6TMuyYlBuz6F8mO+n/KxLHaZ/EHo4sU/cC0/2vUj/kfOdsunpmhtLN0UUXaWpkeiPUvUvgmG/268a0BwKoM7cvTeUfv8s3ecWroq2pP4x6TN5vQg+jPOvZPVpXdS8gEthWBRelzv06eNdukAgWP0jzyAcwgAibjQKil/4sbfJW3nv2dO3Kbuuq1JebJ+I+flK1Vg7re5foJVj87t8q/njatsJ+N/LQdxEvQnEomE1qOi1QGP22gmyZoCLNhCv0wTpAfAPK9n5E1JTX8JANmnAOX7jhIYCOHOwkBuZuAAhlyg+H3BtGQeHG+YwoeJjO2MWxc2W65CJKy6OS23nlJd1YKT4gYGVM197XUSQSSbK8Fl0qIUNMZrAPq7jnYn7+rp/J+WXksIzuzSyhwYNg1hOzhkLXgrtdXhSgdfhnUVXzIMzqJHrwEHynIDZT0dnT/A3PvbKLb9/QOBihN3h5QbLy+UKMcCX2C9Nfp3zi+eLys6WH23WvxY1sIucnXIkFGWgJeBVybtA9xlVXM/f4F68H9Og9J8amoEGl/ITXczMYfkxxEfDyNxFkpbdf9XRvB4+dSOsH0IB9p5fU2Fcr0uKXLovjEriRu1FykJ86VRbrUifEQfwlUXKV44czbc/u0M/WOrxCP7kg+oQew7fZcvC98Ko8IJzxu50j/vG9ZLf+TwgM64xLvsR5+f+k1n3Wm9oA85XiMw88872I6XEkpiGIuP6piZ2Nr2I7I8n+jrTet6fR50dW3+uGv7jnCHlmFTFqyYrp7TFiAy83AYLkFeUzGeXy53Rx9hbyU3rixTVVeplNWVCjfnbWS0JUX2PSzbUIXe6qlb0rDT5YqaqvXtbIrt5/FLkD0zuj5oOnBaN3/Xnx+7Z37/3iPvitQ7HHhEr3Tb30+7pv582d500rp91NUmWTn95+cUusaucGJ1VVtdkInxmFS6otjOuSPC4apV1kZvf375FnnO1aWqpWrYzGBh7rLq5YXLfqouOxUmXFVCwUSuyAgZvZM84aIS8ANqwJrBNXmk0YNv5Slduo3vsSy9hLYr6F3HKtFEjKw4ObvFvOKa9hWmoG1Tit1UpUnM9jniurkD4+zbIqr+rcRfS0tnaMXwJsNcXmE9pAsSWIanHhDG/SiJHHVg7rMdpW1nTxssi9OJhgJofYH7kt55qAYkmQPbkhKkJAzfRcb7W9PpYpLH5gyzXB3aish4bH5bxfC+ANHTbDqyDumIvPYstRKz3c1nA59caoEbEa1nWRPqCY6IJwe0HOUmZinhi0dMfJ/GrSrhhxxR29xwcqWjg37uGjvOWvG0kn/DSV2s3Q0hPPlhUH9Ct0nu8w5iuENVeNCPHA72/UVn/8ZDf/8opjwVf2e3ZO/b19Cgck17TFfSrkcHaBI3/DmzV/dGyZwsc1IGhcvflXpIN9J6z5nMRnJjSEv8//ga328ZU67h40ZhMBnDFq16soGVaMdDqhzO1zorBi+hna/V0q39Wy1XmMAgcAKUBMDQMxR26O1cdXHHR0cr1JtEWCnd4J4DJ9YG47cmTet1GcaX08ObfkWtvN6IjFd/F3Cn9ts1AkrZcEfVoNPS9LQwzOqMX9XUjaqOAN9xV//EmJSYCn9dNZh4DJIAyfagnhbg+THLeXXSJuanDq84SMiPJxOf/juk0kC7PFHudvU4uYSMrb51Vqw8Hua3yaZFWSkWK5nvdG65sXzO37LVS7X0lQzUH93ptdUzKonLFqjqItv8tgL23qsjIxv6HvC42w2S0I5O2WkiTUOjRphawXVUCArdwYOmN/TtEOp5XD330Ya+0ZFjBJUPWFkkKuZe2klO62jucRwFwYdoyTyHsOyHotLqHFu3AOethpG1JcGJxVVZ9s5B7kf0OJxtG16O0HMfrbJ1F9bCtpOTJDYJecA3WVZQs9++1MDQAwL2dEbzKGp/kTqor8HauOcVJGoaGsHC76CFltF7dyVwaBHsQrZMkd0e8Vw9QJIiMB24i+E0KVUWEKoMd/EEJyCqT6p3HjQHysr1Ix/imfBOPnGiptmY7O4Lrz7E6jBTfNtfQWWRZ648Msw4EP1ArSvpsTWUCTP7Z0twOtbp8KxFB+pM3v9Cdv9Lr66LiWr7OuK97iomeoWU3eCp+jDiDlYgCz4Ooc1HtFgd/kNKo+pJ8k+y90VysgOy8OMQE1ff7cYC7WKVJJ9XK8JeapLJkqz7+/b1z5b2nhCIhTbgHUjTWCMxOAuNy4w1mJEV1gMUl9SLovSW2WCi1qmOd0euVRfKAyzwt5/+MDMJj6Cr7Kv02ufMtTELwdBRmSbIHqKcZzshj9BddppY5ut+MJxh9rkLuZvB1QmP+Fy9TYG4/KGGRjRDJmjimSCNVtTTvtOXfI6sruaAmXc56qN9wZw5jS+17UiGFFm8tKWaMermlcuatVcFhSjUdTJpZxZv1H05qH4hVjcb1judOkipCfN4x5fXE34I47K/p4oPdgVX3Niy+2qhyw37d48kGeLEa8qqZZq+iDFaXp1XJFPXK8S80ZosqS2rM63WByHsY23umWgW/Lo5lY6boSUGIFEqOyWBX5YP7gCoOIhGViiz1fiGm3P437dmzDgUZPWbnRefEJzYtGdtNUBAN1bWibXJISmR3sJeYKzWI22ME9yKpbu+h0exa4IhvQbjBnnDdeiophmz5NQoK8tx/tE63sKt0UTdiTUvgMtijbN3Ge2e6/DyifnUyGIrGe1iDxaf+OGOgZrtu9c2zn3rSK/Qm4dtJJyadGXWMS0exJsK7vy1vLsIR11pudyY8KiZ4Lkku7pROm4acHnr/nOGx6mJ6ULZ4HE4+aZ/SK9yLTuhLWP/Tr8q75qNpRJys0pdFWPE8vPo/UfWG1n5zu11Y3lVa9t1DNTKGL9EUaAaKY2fOjRenJ6tSzx851hFld6aLhRIeKNy5LqeqWrJ+M6axqHxhgX74y2bXf3JZVU2pf+jeKxia64XE+QeoF9sb58Y0+Kwr3V2prhvTA6UekEr1CRe0pVcd+oCJT7qW6FQoI9HPKqamakyGpXT4vaPPL1Vx+Tlju53sJWcmK4rPdynVPMyYnfdoHd4tr2f8grIYXmZI0fl5cGo53TGcyvHc6rkisrK8Q+WW/KrVdFZMYvNbh4spiwopzSc92MkoVXMU5nrOZORnULnjCXFWv1Iq1xS6LcV1671whlt6FlahCxd4UtIklvaRbcQw7/H5C9sO99mvesSCuifJIA2qMIhW2FChXLv69ZkB7da9QyMzFbPem/ZkogEgW7QSO+l9qUdS7BWFlWFJbbOD9LDKUeSjkKZJL5FN1xm/FnWtVTkru24xwr1Bktn3t/JtzuiNxvvIHevqUJo/in5a4XNzTSyjZf/6Vzzs3I8wnp1wat0q1Plb9f5PygYI60IIqQqR4SZDLYdugc8Sz++JwM8aevz+JxUP/qZmu9abQ1syxUVlNex/n9rpsawQ9LrZLUJQNJQtkrqixoe+vWUrHVVuSA3IkMIKokAqKbJbM5lvNUQgPFBtUkY5pDgyBHlzK5CWnxH1X4Q25nnB9ngUba+AqzvZWMpWEio3yMPu8CV+pVrhrqe6eYzpJNLVsMgPVsS3fTy41jAX8bH35Dm/e/pVx/WQ2+nmP/YRqt4tiMpyIF0OOatNutdm+VIr853MywRa3mrlNGheK28woHKLEGG17cJZeKpyyOGhS/U6P1023N1rJ0j+pzCOImz5+bL4fk7Z8yXDJ3aXcf+HFuHf2RgFMZvs65BgQhsiPsYZyO3IG/9QN5eHvPRdkkOo0O1uYYS4c8X4GvP4xFyAoj8a4hNcAsW1dSA4fNLnY3ObW4OSvg2pNHNIcQJe4V6UUlWTp5ygXJFzlqWunDktdJXpXcoW3ka+R35q7INKgpO+UP5U8UOgyF/IX/D2KNj1O6QhKP+wsItca290B5Vd0r7PWoswhvwBZ3Q2Ou90GwAHu2xW15zTe4c5HXnizvXm86nvzp94b3SnPUJ8QlxZ/vhuQa2+84X4mNOaJv7lP1Uwn921ylXm+NkwskZ7V3HXccdKknZHccdxhKcbr6kD8HlTfM6xTKx0rGBdXjkdoc+6w+nqhmLRqGsbuNEIeokAVOreDiQoDutisTPO8UoupMApX4bDapXb3W6XBjLHQdIdNoqR8SeDnbKOqrTW+O+TNdymN4toKupefxH0G0Ka4MtNksXvz2COQHYRD65R2v2vuIOm2FEGO5sOeA8at0bVZgUcq+dADcLjKzg9Gq0uSrtBk5spbvAFI+TFyk4wRFqkDKU0GLi6VPLwB4tYYqbc/Pv6DRkICwZpgFgBII4BgEbHmowX0ZDKrgSNqUUp4kqv1skX1wgcSc7GEMybETWSdL5Ez0j4hfxOt5WcC0oX5vpSGHMuSSkJD13vyMWbQZDKkHhMUqLGdVQuSWac+BkKqc61OElCX3ouuvRNKpBUjjuvMQFBoWZk/h6H8O4p8HHwD2BP0V1LHEtEReutdijgYLDzMO3pa71LCGWcI/iTtD+mTq+C9rFkDXZ7LlWgEk0qpSihj8+qypLMoPNFIvtSjhPc/zTHr+PsvVQIuWBmRPzYk7bJa4NvhYEcO4GeGPIzE6SJmEIeY17f02LbMaqBzMeI0yNbU7MlSbVPhjs9LM0dxLNENjVmd6owxeGlhh8M5Hg5JbafSutZdX/fYfo/qbhjfj6X4PIENcsvixBy0zo43W0W5manPkdz7JRSjXaJ3qZlQ+aQE7Unc9azImnRUTOQKMoUFZkbJOsXDhO6SYsnLApSV22ZKvmpE7z/s/eWRY4K7vKnupfuwZ3oATO++z/deKliuw41yP75CvzMQJk7ThzNoGSA/Wex6wbfeWjrwyf4tH0VXmL8mZjkMGZuCvK1PshKY3IprPeMZu3Fb5b57JO67D06td9M8euSUes23Vdjtt4ft5ehcqUmDQKnZmbcWTp5pgDuFsePpQse+yuMSPxXjOq70lE75vrPetxBySxJfKgyaXC8zpBKoHeQ2cKC1LJwcRADJVClIZI/Y6YQOQhHlRu/ZsV2ne2bOLNy63wFdhhCBSxXe7N88msssMR9AN6NRObC7XSGPEIe3rfFsXxMdIEUiaAj2yeXFfRn5T7Z4LwmACSRUnZkXQphx6iCIQ4kFKoVHAqA1lNm9qLm0ZmUr44VpdZwmJKaXIWNUbEjQlONGWsZ0glpzyQ2bylDYS8CG6KasxjKnaEnTzhp7wVIC/vq+PiVfbbamFvLmxHBYvlknZBs3ZQwAKy8gTYoIRaq2qqifvqObdJZEHg53bqxok8n48Lak/v6zO1r2oaD4k1z0to9GkDTXR8sgaoB2Vu3yo9LUEAQorzmAVR9fiV8B7XjS58pyI/qePDj3O57p3YXFre5fsbJdL+G2eS83QyXkyQIztLnjA+O7Ifw84hkJMS+VNTSdXH/AQhIa/VB0iHPqBT1RTOfLxCvs+1xbUeUU6vCCwkqxYsSu/LLAGtn3nzYY4+QaLwAvciVAfgU+iDTZ3P1g5Llr7+0e0HIsNJ7KuInCupOzul07zopVvv6eE1kK0qXuWeMSGJ3TsAbcktLT93Yl5lmaJDaehPFXvlKoKdA9lO+EMv+o3vLk1/43Mn+M4LH7UMtvTQZit2mlP4J+vMmIgMgQIKVOtrT/RIjEyWxFTacFKkj3MZhyMyBByUWd/WFECwMrzmgU73Nl5Umr8pdVvMFT40KG4j4xEqd5/CskpintLd/64kyKSV1kYP+lR4TTMEEywiJg303LR5ts9XbRvCAQLHwIHODOeq/mshb78gqoQJ5Rb6LAsSy5LSZb6qjaw2mUeMR1xyXVUyJbboOMxXSO+F5bAKQ/3ZHKLEUW/lqKOWKbOfwCrpW3piwzLlbqOu/LXNtKguQ0w/m9xn+p9s0zLbXPWUI6cuV5iq8llg6R0eV0eBwT5yOPSOphPuZTEbirrP+u5qrslC883j/fMN/9VVlZi/cTilYHsfbF9kPEPJaB1qrGiwu3zRdvtvHePQTDmmocDf+xdnigat8eSHhKhiyCW8JreyaMgg3njA1kygrSl7CxcoZm/2m3/sUJtIGZbrnsd+bBeWkx3x2DiiIC1z6rQzuyghzd/dQ2sZYquFw2VykQpBx0XSSNXz0Iptx3G12KDMrpB4ghm2wCs5JlaeHMtITGHEAsoOsvXn4GpLIyMwY5Vlo8VbYWJozUD2Lzna8+Tx3Ep5HDGeTUv8uzrkNWKcb06+S8JUkr9oHnfa59hRHpfGF38JurAp5Z2B3SgKvWmYx7YXJnA5kZyQmJzdHkajZPdJgMD2U/CferHV1KKl5wLWdXGbFxVn3t206VZE0Vr0JmD/V546Ou0qwv5e6yHdVsYA/3B9nYWZn/lhExmB55XrLD8Mt/DnOJDQEBYH5pmb/EuGnl+Vr7U3zGfiPwTQcpsRVy5V5VvW5BzFY+o+mOc5KVy+PK26/rFywS4tlQ8HXogNoEJ0UkDku82TxmadBDjxd/HRBQE8X0nI7oLArRgFYc7At8LGnxAYzKIE+LMowYERQ5tVggPcLymrXFLWDn773h+CP37bqArDv7dkWgzr7ata25VHxpCD3hgRkYD7cmfCD9nxt0pwX/0ifftJZc/1Z6asuq69zJIWNi0XBEfuO5vRy+IOSwvGPqkBJG7fHN7W7fgMyiv/skzBW4CRb90ioE6fPvSJjfG2r2Xr0FmRZhqCm0Mtm70CXFF6hPQlgexzZewdHWe0p4OsQJ+5Je2p8PP5ByAWSfPF/rZe2IStvM/8i9jzuSrN06yIlRzl7B5E54AGmDySrcP1iuUhqtgw6U8hDfR3IfWVhqnennv7f8EbwLxE61Oa4+zTci6g+n6n//5Ctnrj5iuFH0Ia6m1B6ir2K3m9rwv7HdkoawDDyBP49XfrX+0zZNwf3uIWVq67ef7U+TQv3LrC31mtgJloc5J2hHpK3gUw72HhFHA2Gzefmli93jaknq/FCZ7pecVuAc5vFaP/m31sp4ZrAfKDjm6ecjcKeXloEN1EpWJLpfRT609SNXClOB/spy5UrGFbDKuRWbtoS0hDSl1jQLkv5YlzAS0dYM+8uKKLRbaOYaRHa6ZZcpoByoeFSzzzRcPBCGWOm1fwVgOQUlCthfx0rEcrJO+N0LT3ILSK8eVSsJNioM3Nhx5Q4MdURVtq0oWPDd4O9Oi9EBgqsYW1TlW2plqa8nsBplY8ytX3jvS2DK0cUfHmyv7grdh3/CqTP5vTgzdO6pUMc/tPo4IUCWqTJIAwYNux+8GXLxwOkU6cSx2fXc+rkl0NaVo/Oxo6d4iB2f4fPILG9Ien9dP6N9KGw9KHlR+836a02agfblbud2znfUTFyUGEJfx5do+YBIgrhHckLMbIWGwbDz7dL2r9HTHDJw8kWacQRp2XD/Vc/IMoCP34yEHQg+pdeO/BafFaa5Cw4yQ1oOwFVdyIiD8DWqq1Tv4DOjXcWr+/AQJD5gUnWurcpMp9HxR3oafafkhF494BrVZOJ/NPOqlSxf0YqHxKJawSFNihGALM1EMuXuC5x9qO5WDL2mfNkCgzIbaPYQ2MWzDJmA4QwrsAI6CoY11qodsbKZiBYBIb79Jyc0ohpSpqtgUSE2P1CGZgFJS9b8sr5g2u7+0dGRkbO214qLy4eP+BILUcMjxzxhU11fqOQINIVMJ9ia9ejeBQgcg6FXV7/R6sUCe11+3Z+C+1uq0+PQ19CEpLb6ublRkNYQrlqepYTua6LeEEvku6AzsUeExAQB3BtomUYR2L8CwE4onIEaiqzHVdHc+6qZ1VLFn2O0ntYdjLr6wlFnnLwlwJiBzAI7kyIqBkucERiWFF3rU+UJV+rz9uxaB2XXdaxO/MWdesAs7vjrGw8IC3YSmI5t4znTN0MtDx4+8P961U/v3bt01O7/g2Pe2cP0PdudPekIEHZP99MfAZeSI59WdW4BUOysuaIVoxA7FxeibfV7qxd5WNLWajUpwIhEN8Sw/CPh0Owf6oJ99jdwBBP2A2JCzYfEPDa9md7eQw6S0+XPcjqMu9yPfC1e+f9DVLHO+wTGnSVG9t8cxcW9qpTkpYdY596pW1B9uhGJJ4/cbDW0A0q3WrCatnhvf38vuhAOJAwB2L/Cv6IoAFk1IuE0FTkFSbK64HOFMHgJmxM3IKUCxx3ZVWXoRmBboA3dNimfbanV1kfGuwChp4dFEL3MOkPaITOuIIBHFDL9G+30v6NuQ5QM4RzKa0/zjbg40pr+M2Bm3Va4/Pix+FEnp7iXb9tbXFQxIL6+1HE636H9Z228ygZPi8hQ1sQxGIyIfnYJdoFpaVcoCxpK78AC66U6ceRttt7tilPjLtkYi6lW78mVyPeQqWvNkzw2vYGpA0M2KRP++C7HPNTmqXhuTph/pUhYgSmeYl0mG/KbT59jKfELJ9HjcK/brqIEmUnewKfUE2bYUibyeCaUxJjB2eSQ81+bx54JfjPwCBhIeBfK/WVWUth9KizGhi6+c9z6oGE9uxX9ICKieAe52IEGidHjNyvOrQB7N5IjqWVUA+53HC23xK2f8h7Pm1gJX2146675jtp7Q3MhBazp28zQldgnAfGyV9BY4ZgCxyCeRUD4OW5cSBZbN12jEndA6EzJZY+23k2alYJDpEbD6AT8Xy6uoFHvP+7YVLWB1bkju29OGENEXLaCHIQkGty99qF68TWsk8fDpmsRuhogOsXgOLT5vvaDWtgAFhlSD18PyAhK/5S7KTqb3lhHUbkIWdpC9iA3qsdJqAd36bOGkk+ahvb6PvdLJeBDNRP3LV7UzListmrPdvy80ISQ9uz/VI2BWZzR1p2XFVZ2fqjeUp04emFGke9S0aYav9dWnMyzQsYXueIG6+WSSwuJv5SO1rShlj1M5KCAE4QIl0MUGSeY/q+6U4o1JRziko5w3BcXL+PLXC6asnVMT/lDJRVUW+81SIqIcUvxeiDNSrCp7p0ipEPCEElBLipZhg8pSrBbldkjBe36IrPcer9apJfAlevhJP/WF4o7snl+OJRNBUUxJSPD2eTysSXy7Fy+OoirEHowi4u2T1lyfy5Ql0bPw5ibqnZTWm5CzGmRJPdicHegV6uHvEU8Jd8heqpnjjC70IqttqCkRdgR3DoktxbyIKqY+nTX6rEBOK/jf38LsqADXXrwjl/O0WU4VwuUWNy/FCPldWLUoo8vS4WVdafl3PXtUFzG8fUOU2ewqeW6XE6T08b3oRUQ8lHq/BCGeEZngLGfcQjwc+kgXyAN/KpMMFxpTal4vyiT76ohn5gh3hIcH+iEMFsC/hORegmYZree55mXKtTCs+O6OaypKxmK+1W+Mv8LH4CQXPZvdu65AD2j7RTzwLgzHoIxRyycp5F+p3hQAZNzAiAaKQE9hhwRpZTYC4MH9JYr44SF4tcuRprQ1hDAWb3rRCjOKQADeRTjmzIbX4Z0kgMuuDBGlPQh+5rAu6KnvIqiG9JrpG3BBzqMFToZ/v4ehtdNMqVsbqkWNofLWSyqKMJhBFPaOtRQSWK4LTQkqgJlEiL3HCZJHlIos4WW7Z/aO2hIAknjoQ7+8ZpIpXBrt8DqY4nYuaYcElCeNGjoLlqOvW7n69XNfa2Opc4yDKBLAFgQc9D/bpoXfAjhbluJnkIqrkaao04Mh9QpWpVzOZ36zu4+5bbzRZZrnMIosd/tLSMzEDRH9v2pS9wHLBXUODqoRwz7xBeWywomvJN1MgTK7NasGqDfVA2T79+XP6Jf/x6jDbKXURtUG6IN05/YgtXnsaI3j4L6HepkxbFmDiMC+tliiJ3D/CqFnNKYbYm2EKjHdJe+KtZM1kQwgxr5W22d347dqQ2kfwjGSFEmqJvDyW44DxGvKkUq/rMPAqZVlDsU5zSSh+LuS4EUQ8gZ9vdQ93z6ov259FUJtxAtz3e4IL22PbiVgkNgLj4usfE9Bp3eCLRQYA8+z3mII8qC22jYC1b+VtcO9W8xcFdFjX+2LRS73Nu/kOkaUXL9Vtamj16KhvqecyLDtXnsyBzHi/SZZnxq3YjDkwc9n0UfCmThNP8gz3IKFIHlAEsjHomP4nvAFnS6QsLcjezCL4ejLx89eY2m2ltIRxEgpaiShFepJRTmWWc0SkEhEcq6M91YY77AcsY6tQmF8iYnB5sR4HSQxrPMaJdJIsX4LwQqWmjuot93GSmJcgoOzckC6YX7YVBtPW/69oiyJ72Bj5Z/JH2xFqrt3nFOF5EAbhwhWthzshWIw7isYbg/wWQwpIqJIqZ/ZyLZD+OzJJO7KB8GTj+lSS11jqxCUSXN1mF1Ss9weVm8eaUnOg3235EMct7i8sjh3LwjtVsL1Vstvf+bEQxHYte4Wnkz2Vbk8JOYIAnfJrgB8RVa7rlZCdqu7ikxIeBO6LEuH/KPpuF2R6tklp/hMM/sNQX+2tDaZrrZBhihW3NmQ+Kjuf7wIJ2rvre5VW2uDV/nHQzVOCB/0b6ocCW5hC7k/vbF15V57pTVJawSQuqd0lmJKb+K+ncWoitsyZsd0u7905Ku23q6cHFKudSCruOpxIqMlmY6FFcN/mUrWWb6W+uVEjImjV4nRMwslcl1aXCbCowU9m9dri2s/AlH0FPVFdr5pMvaXxvkivl3ybPGznmCWKy0PTNgdo/yVgdDSoNXvbKc9EvBck70Odgr1XMk2FsuqgRpeYy0SFq5dwjpeY/lZJNGVAlCC0DImsRyL5wZ3GwgVTs119s6fbhfONgviWTchi5EbcKb1LdN24z3+VGpqymU1xOSVxG2Mrj4+iObqxusBzZvgK0baynPmmYhiSIRPzdIpPZa0NyV43dXzPUK3c44H6kF5nLWoS0YooQpQJcQ0FAjf/fsbUxhA/Vlx4XaJvRoZvZyaedzVPp9Zv6ywzlduqbExU/Z/Ww7XcGYZObgX5VWB6p1xU5OzD5GQaka1T9OnpXPqva8be+ytdKFBYnNHxmPR4JTKKul/K5Z6Y5zJnQP5FwJ+XyWeGpEhqu8t06U3t+w6JTRHqNvZGTr4N22NeusoF8NmyvO2t8mOR1eusfy1K4ETUX8cFLivxoUxRbIFPkQMIwmTlAGB1k7unH7w7qeHWplX9Yu1omCvoEX1PkF3m5rPx7sHwEw7aicO1IcwZf2JomAnF/OIf0wYSjsd5Mi/2JH0tNAO+rZAtAoH3Eqii2xx9luAZfJB+XMfPL23p2ojPscAEIF6EJDIDns2U4jUj3Oe+wFwPgVBcgmtYs7QOjL90eE2sKcaVFE9sBsApXvhWOWYr+xR0c41qvBHayMuXIyPz867CgXj16tU/Z+FCG+X/mFB8wUN2Dd62sRNx0z8vuSbttdX7yuiS7Ah5dLtnIrlnJ10Rq09JafBX6XZkFewWjS+/H5r2zW7fELDy8SnQ+TCk++tQI1gyP/lCx4azEakpizUL45NzYvJie3SqY4Z6Y843+1XrFEEZH/3UkjEpIaLYKL2Nk5FT+c7xLIQXNJDyH+RI+EOOJG5wPyTBPYLHAmlbnu5+xdeJq50PtaPBWViWhQPEQSOTXzCCFpKoipZqhSUdFyNKyfM4X6W8mWYu5+/EyOEtzopexi7g1icKjGR1wf7s4oPQeAgsPXL/7pyyI5FlsZO2pYHyKkFazcrdhcUTW1Mqawyh9bXE7LSA9OhITr0EF1SysiX5RZ2EHZUW+XaMQYLmyGOKUt9ZlDaA4gBk68y7q1ncsgGlABsUhw4C/PTK74Efio1HJgf/GWMDiDzj9G+el5Am4mzzd3WMvT9MSFqUs5RunI2rTSlEL/NVnHHWsju/G/a8O+oPBQ2P7I+M7gy8xvZnHo23sxGbuN0pAcrR3aKqn6WM/7m3eQ53fF5+ZN9sA68WJsm+QOPjwVMKCP1s1ocHFxwGxs6NcrhTHu9aHrYuYn6I6wrFEH6OlGV5+XllveK/xWb6H2n9tokIUwff1cDUkURUupUXnpWVTRXiGMkAgU8l5SwlEWQsf+5M9D3OQv2pLYOCMeo7LIKPe+p9F4Qs0pzcPa2/c4/eboyJPce6T0k79iR/qu7ScPLtwidpJmuMH9w3rtn6vUcu7vaxEub9jboP3fbNdPQAFDDqG3IFtegNJx2t/GJcOYOqcn+R2+4NbGdqT9zaLXIM3P6SbPEDYxLF7IvDN2ljbSvTIRWrRJdd1fSJzmExPdGkNXGBi2wGf44PrQ5s79sG1aOjJRGVkbQa0pH9asQJR/dkVArCD3YCL6P0+Qn1iCP27I8fqb1O3r7VXsEMeJOc7EKuOsbB3FcYqdq8yY8ImBukRdF2UjRxzwNVPXpqVWRBUksW1l3kldDUFO+5aGwh1VeZn9h1Qujrog1tDyhjD9rnJwpIAmWOqHTt3BVve1KWfSRvRRRi+7E/mcPZFYHLrO6jQaEPeRWzZtv+mrFDL86fnHvd1rN1N3rkko8djxqT0FhHtnahstX+2tstVz6/ua1ffplrz6OUyPGPiJSU7r+qdu5yyJtpgiYhryopgbMIHXJJ9ezSYkDl7KqWJU010J1zkyFOm73rPdUzaMQlYIEdVTMGso6P9XlWfAyOjeRwiA8I02ssNq7W1a2KXSt7E/b0xkXOl1zAE9Re2dMEytYDeW7blC4qHVF6lU1Ps/PVv//pEETvEe7dJ+xUlf9TXKIwmFdVJzX7lL46mSPhaM6FQRUlykVat8qcNWK10pyrFDZNLvtecefV7dO22ljX2yiSpgIxhafYXWyH7tQoNBccoqdB1OaY4o3Sou3bi8DCAhOtVlhrdile25rcbjbjq2WlCFGifu6AcWDrYTRFpJuVrdTbbBHZWnshnrPO3mWn2bkQCAzCUruWZm2lhHfFoRd8tfjaTvZ3AGRheyVR9Aljn3nY0WeR/VKznqCcxUE5eu+gWLUHQk6efDX52ZGzEYdPnPs0OV937JzOOaW1kKCvuxAcLgeZ6OWi/2btb/qxKPsbRN/mmVwTAxxFUGydnH6LULyEy6JBqyel98ePbZ2ypMMgEHzF1inMXcuNg9oxj988fGApe9nt+Hk/y0o7fMaT5RU97djIBH9KN7axTeXl/U1Bvr3vfndl+4KkjUj4rWJezb4r5s402PeW9VQbs+KJMRrnurLRs+onWk5XUqhmEMMdWqZ4qZINUrfNHq99HpMIzPfUzR6rRdfaonVewPetfdsNmaywF/891rwz5LFDQexsQ1zjoydFDs6pKdcui2IuLfrH90dC/LTunNiE8u5IQXxaRYd5jMut03nxSOfcOv8M+ySNhhMniliF9nYfyTMmu3nzAlZRSi+5uf+aSV7p08XbCeonNFrv/1lbGX0+/MSTbhafnNjrxNGt5hnFo3boq/5Ub+R3KPJreMeC1SDP8tS/rV5nV3rbvLhyxjFrDX1QY/AuZvrFnen2EvtMQOS3XoMt3dA38HBqhG+psbuccs2k8PpE4ra0C3BwS3TygcIDchT6j1V9yiRnbUp0kEFQg7TDdq3dywwcaBMq2bLlzZst97X9WtB2JsVkSKtqfDS3UMYOOaDz+7HeP11df3oFdxsY2+4CIBEAgAgad/j/o0yb4Q8HmMDaes0gesCF6R64oNCpIdX4LgUrJyx6nGI4++4Ig6cPKt+uJIve6obOas6GLIK1N+piQ+aFARXj65Jvni/a913BRaxoKx66ErcjUE6qGcg6DR/SxzyfROJTEF9TNBA7Ds7WTEcfrK6Z3e+z7FZf/SFHs6k4l4jKnCWw9wIdrWdxXbB3WLncwhsYElx6C12IQpdXsPsMh86713r97FRT+Xag9GzTyvDwyhCFhla4KyP6iuGhnKq1p6UGtwLmFfofDPJMIPSUvhW+V/+n/rrPmz3ddTUO0mYehl3qWTrdNXRncThoxKIpo6qhqCup2zweNWSstFCvOjnbP3R1biThrntgHOf7HlmsEKu0PyHFJl3cs5LfcKNhgYa7UrIcPNTSsaVua33LRHB6YXdZgdYk1noV+jqh35OJSBl67ObVERuD769kWZwQR2qxYe9yzT7x7/dxzbhFQMrYR+OsNI3eE5u/2ivugPzU2+2TArfzNXyo2SLDRUCfn+Lgz+I4H/14j3k+18FYA3FJp6YzJeU0Jo2VxVVl0aN4jN6cKx/WG1ZbCle4Dj/SJP5VjKSLmTepiuxInZXskDKx3JjubQqHJhrnrnt9tDMD8X2dvfeM1/WiHZZgUgdVBc7VPX1paSr2oyJROrPrLCAhOKnzoDaL3KRQpSfgVJRzpOvWcnZ3pqyDTRIAREtPeO/byWluTYInXFenrQltRpOI2WaKUIKqT8QcVqYNCbvmXISz08pgvg6V45ETJX7ySsL5SnZDbaI4j2sddjm9BUWKt2fdZnaeR9mhzncy77Ew8STbLadc5rTGSZhNRDecTxbbutLjrXJV+gzKFDpR2oObMTw70gktq5jrOhjheuuv+l4l8XGQvEK+WkuKUUTr6MZ7BdKXlnjHb2UltCpwDNcOFjd8tS10PF7deNij0GJU/u0qbgyV5X3O25lv0MrLntco890B77Syg6cE19pctp+nXijvHlpuxNEzoGaC8bFapCwyy+2HOoOnr6oiuhfQbrtAe/O21Tgspi2iXriddxJRs7eDUh7rk+Dt0EV+p3/q6wsFwCc+0RVAXlW2Pv+S3Vc1C4DAJTMjWIk19AYi37bnuLXobXd/DK636CMs6H8ssUP1OOmWhZ1Xjs9PPcS74oYY3Ej3Gzfr4z3OtsXMGjor0Q3hk54oTuWsPM3CbiJdO9ms4UQKCgorh019BLVZYNbnKkwQl+d2bCAAi3HBqoeeWmaj/LZ1Jq3KLX+Yo0E4s02y+9TugMAQHLfm6tbKNnUKdBMQMml75jXwleL+BMZrEL4c9/kNCcF2QL6+5dlKZx12OzFwaLcCBFACddoyW+twjAe/Q5GVVW2jlwqpXkiFv26qfDrMfeXq9EoIdKAeON3hMkWepLCebD3rVS2706196NXbEJMwFRPkxHOpCS4+Uf0WoKYaz3inoFSu5hkWYTck7m0S+n0ciTthw7//bWsuxDTTHtznN6rxtgO4S3Tdi5RC+3v8EN7PH/OeuVo9o5F/+yv4SaEX+qbh5Jf3d/T96ZNvTqkur5BS8SJrrk81aLK8FWG5vUOVS5AwG0+viv0fUKskhC+7e3HLdVvBEtbAX2brXyIukHfkeSTsOCkib1iIOzPANFon5PKTokcmnqz0b9nsNRug8mfIrAlb5O2RgnCueKMkflZsWXnSP0E6p08wTy4/SXbCewWx134MbJZ6XSXyvuB4gfnVpK4xn0cy9bINza8e9zRgCzF3+aGzuQ9e+A6xIkL2ftnOPNeOa9Vo+jql+78m9TlEg8mXH/zZQAnxuoFJuMjiNDzsbJxDIu1gv8g25/ylwd43FtCLley9gHvvlYXtpz1WnyuvlQ1gl+FUA/h/D1UQMOuUjqCxcypPyo8bEu28sHRqjeHUeegyls+gisJ8KgUoVHfYbKlktsVi4m5RL8jLN1pbm2l9D5pow61tXombV6NMtm2nP+QBLC9va2sCWMVGdAa7FQKHthO7sSudLc/ke1aaqrpYN4xORmQM9xT9F84zOcTIkYVWvdF7B1yPFKhvzBSsbx/9yv2XNyoPHzrEXssuZp3iPWf2o60KOzp1UFuwdZ0rz1rq5QdQBMnuz7jldX4oe5y5tLfLzcr9nghSpPzuypHQsyWkP85M2OEnbaNPI43IABs4tHgKgPQPJBpOPsB8kt+WXh65qh95fnIH2xaJj9eu25l81ix5La5u+79REemg35ZC007PIm4P9/wGjSU7VHPTA5URQtatZuwgPTPoRVhYmTekVxcN+cZzFAnslP8SmGkqKCorIkFDLsLV2qUY7bgrnTqPgp/TV1JebZFTUU3DwJ8YeiuDDC6lIO5zU9rmECHaRl3++2JaeEy3fU7I4k6PCoEBJOvQcGd2nYdFngzpbUF+RK+MglBoI+OiLuQwa7PDD8jjsqfEb+K3bo1/8z/vzdatbP8PjYkvFU94v/kkXZMM10yiYBouXCimUACCKzpyanvUeH1jT/ru6/0jViCiBvsdzKUpnToMz+5moJ6oKMO98lEe6vAgHPTHgN4qqcpbw9W1n5Ks4X7ELWBo+MAxKTq/iMMFhtKZnBi3wm4PQC3Izt2B2ic+YxMosp/x788+LKapsZFVMI4uUZ/ur3/u2y+MpHNVKrZrot6RUjEmJjt7nD08pB4JUQGlFrWQZMOFUhUYJaSVHaWxUq8JwKS9xeKnRkAiEonO+HqGhkVHMeNN6308KjpR3xU1CYPVeleawaML1Z+okPhEFosO10tqfh/cB1++8P8fDB7zz/8MgcJbI6nXx8zhELxaBrfu2i/AhBA5WE1Gnajbh3sS4MHcN/L+HgLImZCxnNqp5PTP4hu3K4oFaIazw8P/c0RmISEv18XaecbZC3vcuPTQPfXuZzA8iRXM7ynlOKA0sAdU7E3Kpnpqt15LIhnDfwPiJEyfK8rcj78hXqWGXCqS/GQlXMH/JR6gik65GMxzu+TGJITNy/haG5aUOsu8GASNhiaFLBPAdAwnVdx9lH60I87O4gq9XBHosumA9MmduIwvIS3sbVnCVvNCLUVpOMm3OazQyTI8x8hTfk4JS9upxHDTJ4fDgqCHB4AqkRXWnNZ3Y1dG3/Zjpx6onks/wlpBShDZxrqlcDfUt7zzYiDRaYf49stLTNJgXcfrZ8mOcCRsKYdx/Au5osGx0o1WsUIfpkOPKmPvgPxLr2lyen8hkTPo2oe2HLazfDDj30azig1g9Adam0IEmVFenvZ6fSIh1alNj674ciILv1veGVKyjBrvkcBNP+3H8A+GuCATvR83luwL4QmHZExkHEgrWNPp91Rwnbu29ZcfO52M37tXtc/P2zOPhms+avqnV12gW/cFAfrRgpdRVH74Bzc5tUWdPJtyBZWjo2pPAj7CM69T0aeKQjCPbiv5D1xxxFxYaB3AO2VkkYfgSeZ49uU25T7xpyChoVhDp/2gVh1yAZNwTqZGrxOVS+98OTlRUOeY9hpiYS39fgokFQKRRxZuWJCAPzphLnABZi4fHgILIcKuQ+FmiACE34RaDyT53O+A+r4XCurh1t2eXNiJara0q41ydtJimzH65MBGNAsKJUIgEAgfuUINayK9crIsHSSn9CTsyf1ciTdLla013nP3825fxAy+0Sv19bGjFXa1vacgivJQJJLPqTPML6GlGHi+HT5KgoZhdy/L8lTOabtY6oZGkU6thylAH9fMHh7UhUH8oQL1pEskcj76R9duYwlR7lJdDaG/XWVcFUMgEHcQXurKus0A8JGer1c23qp9TEJ8+ejSsZmoszYx851SDA200XBuPZKHDB0MYhCUHT5Aawaz/hZEtlLX18aMQgzAPGTrFkTMT0ud595nekrrMoVtbwW/3XpNbgVF531FS0fAV5Tkt5RIoUODCWmnovMzs7UFPAVJPu1NGVH7gZuCboVo4O6pHjXrMK0WcWI5agtDX8B+UOpv1vXwYa2ZyoDAMfCUPmLXqYqR09xp1naG/5s2Mxl1XwicyTtmah4DuC8xJ3mwGTm3RDibYdEgBa26bisWLlrA8hhmcf+5PsFaDszD81SQmhbOn86sBPVzNqfq6csaDdfuH+2gd6NWDB+sQCn4weoIgfbgdxcxqBH+u7Ng0mjvCQOmfFp3spCLqob3VbP/afO3Dx5hrn97+F3nsv4iqpcQNQuIWPcgr033oURYZmx8Ns9ipskzz9JaHz1joWT4x4YvwOJiV0/80MXi2mcWxEwgFQsM2MOBXrAMftCHb5Q7THif1DBlt18IylqakiyZkLtDw7XdtyX3IpjECIe5ESgbe8EWmsw+1O05gjYHP8LBgwSlA5i8Bfz774XpQ4eOYAYZGS+HoMZ9vUfXKBABBj8EpAARlAyaWmm0Fwm5Nv1t/fK5CXZ7TK/HM+xaq1tho5B4t8rZ+iewOTYSIae0MbYysRcn6XC9wMjNpeZbpMuUxh4pzSmxTEDGmVZ+K3KYnq4yn9XKkQdra4O1OfIDWu3mCTBOR7uFhssygzVy2WFRShYLDsMjzv1/K44WWsEsqk+o6c9o7U8N6Dr6GtZYFQc9YKdPv+YwiMEMjhTfixwcjLxXPPJOHcw7wMp7W7O+Hpz8HNNlMMVet0fnyM7drMAteww6viYc3Jb1VqEWGU8ePXRdhvO8tcfR9jTGj0tGfTFRrFcBUMp54hNAT6V+a/fxplvvK4G5Y58RDATAFESZxsr3t95A+Y1rLL8VVULUI8WxJtZyQ4y4ZdYs5C9hdFsQWE9k69Saey3+QPJhC6QUGWlgIFHuvC+wDaIGqUKCWO4YSfVIVYgsfaPIpF20C095qiyuqt7t9LkbdEdkCBS3ip8uQOeH676EjKwA9n3v24D57hrHDzlTrVUSr1cAgSFPyhqi0pWk6WBowLo/my+YPZ+k8wog8G/H+SL3mRoGjzo4gvhBNgJWS8YjppFYrh+2iKCJSXH0cY9LhY7t3Hks0biDOl5QQXUQft/d8luwAbk1oIDfPItgZJGZbDJ12Nod/3YNNp01YtL9C5nHra2wgUvT93br/O3RFo9vC4iAiq7LDZ1vE6OZCknRkKU4EIroEDCK6MhNjPz57Ql/U3/J2BcSTh/2/AWW1CZR/SXCwtn4trZ4Wx4iuqU6hnbLRQhiDkrak/UwkJRLIpBg5Ed/Xrqk4CHx3L71FDMjR7LMx/2LV1SgYvhBw70nmvL47zQUSc7DSW++oTX1S0CzZCnGu6JIOWVXGplgnKNwklvL8Sc67fFxzlx93gGOxzQ97rBARDd/4FrA8xOZd7YWWTXl5p7e6RswFDaT/77TmM3q0JKBILQqKQOz6OyA83q3RxbqUzwBLkY5IufgQ2HOIXqErqOKW75+xVA+mpLdtGMDkdhaQv+PYsw0bB4QwpLZn+Pdc5+d65vUs9y7WYkWp4FqKEqVtNWcG7I6iHFabyU5IiCMFZ/J4oVdYyw6t1pyFfSgUEE80wVAcBHEL44i+5zG1A2fj2fLXb9bdRGzb8VXnCi+Qce4M2FJg0wcL7EIjyleasGLXxPZ7nMTk8c7kV8TIv6ArdUUS5VZtQkJbRHEhJoiuG9q6c09MUj2nmbGzqQ7RiDP2Q1VXFY+s/Afe8DFOVljNkqcP3jezIBX8zBNLaulN9IaH9iZnqLuSHJWqDIKt5EUHUnqtO48++AI6+LmKLfc5rkVBu0PnA01dXl3akJ0hcv/5RyKBkGRsK/Wj28XD4b1XGUbM1nhjvq1TFzuyrprbCNz/3PQy3+UDsuvzBsURxMO6GL/L2vm0MRCWjCW8nIVzkS5aIVE2BpxOeH+V+vzn9J6s0MdjB04IECsyRMA00MX6gU0kYS24pzxFYouN6PCVZt7X6dc0RCAj199IyF8epQoMTK4T4ePna8EurFk2UD6Qz/5eDfuC04uP3mTanZHQ/T9AuXSjIq5IgX7ypoUWbxsQ6pgvYbIMusnJRLG9+yAYltp3Ks2h4npaExGkgqtGUhPXb3+hIbe56MNjU0VneHuItvcVe3SMZ9Q4NUKD1sQ8h65jTmvsqTIEwb7/ZbSwlisnQ0UuXxV7q+16sNC2PG5HInpIFN+enwuwjT80+9UUL6Dey71pWI5jnDeecwtvn4AXnqsswr6XPrWQBVKqMpYYG7uYhBEV3BrDjlfYywaOrEy41lhARGIykbOvNKm160UYtQxuvr2RExj9mH1dSLSnVTpVAyTNytvdv0EeqAf04DGoww8jm7Lc2lEdx7ZoS+zxaMHw/qbsfDVEzNtVy7JezIrB9inrO7LdJIXYvCAlcVKnYIElmPXCwQi6r3LBTkLxc7D5MqTGZui8wu50zjjbMmtQLWc0aTMpCWuPmnw6xb6jgWnTxfg9AECx8CB3tnfFPZ+l9l9JLno+mZ9Zabz512m1LcOu+85k6Q5eTKpNldM4rr/+Ld15VMLTXb6icbacaHSOXTZKWlH14nj6DCmzu+HNvjypadHCS0wSeUAI8gXGXXgyRMxl419xa1bY7QCwZN6qZShNhJXxYEhLXBpPxZLoaSknDj+J2C4UENycrvx7BnTE8fPcFz8jZtCO/lrFskDaf6FfjjU369JiId7J9FEBYnxg9HyyqrxnErgEyJhbUAhr0KVtlPSgrGx/CCPPx8fe77jHQHmxYIaa33upE1xuleFxc5X3iwvv/UboFIrT9jsQ/1bEsb8kVl3M3xjf/jNwvzkaz19C1G+/7bbYztZqTTA5eIZ+/bOzBWHB/tlZDZuqn+R7ZP72q9sY2Dj1yy9yanfpEAVBw83aU2PkT2Zy+JHc56tNGcD6ueFJdZyR44Gpt1w9EjqqkMcAwg1cL4js4JTL9qdKpGm5AnPk10FNvIPgx8cfRf8TuB4/py87buhy/e9vI2Ly0VyrlA/U3LK7mK3/Y9P1hx7FlGArXCJydhoKky1/tQWD2LO/e+OzPxZDFPrbssNL/tCWvw7C33WbX45Ybk0spkdrKItwmisW4cLstf06c2OH8+tlkokxTGzBZgATscmzXwnu2PH5KylL8q66ef8JuGnpbMspxq5L545NOydCuKzZ4eRKRleRAYUgg4Ixy+tFVAiuNyIRWTTvQsfJh0IUyOW1QJwS6DI74BEHpjbAUT8pAr7yJoL/PDqGk2IOULWxTRH4R7zZUDxZo5+3rs7A2F+t1dPawrXQ0wB6PGOIFSG55V8oDuW3XboKeKQs2FIFpK3DJbAufB6rj1seU76FKJTXvrrBt94R4fprzAYqgVm38Z4IWW4A8a4Lpo5labA4lwoCgf/KG5vQWlP+UB1dDopk1PYUNZVNr8mKr3f9kLydvXd7XAMRn6zW8XDwRq6o0AOiwiH4RxdHNzP7UqBFRiYYTDIyGRUpXjNilqt0KELjZjkcRwwLo5XMnbhzffCMWhkjS1DWvGkv1bVQUC1R4TDsXxnO+7lPRlF1hg0yidLPPxArbp8CIuYNF6AcQl85Vzlf/uGVhUf4u0bnzFwoA8lW8YjU9Tv4CPsRumL+uL3z9gjsqgtpkOkSfHazO3Mpb4rXBYpLO1XeXnyOiPs33Pt91GlvKiY5VBePPHy30X+L+tQmJ6slE55h4S684j/356SPymB6GXA/VP9kn9iOglqHnelbmGmjdLuXLhUx/ddbj4ssuZKeqO7jUYgIuepvKLGuTAtvMnhaIsAh5b6y3HztLMoQj/W6eZaCHspsrHLNnuzb6uNm92U7pjaMldDwQbddMuLgt1ngjXzVDi+w/aOsL4sK0/NZTAbSFXg3LoHt3ZSckHWRI8Nmac2kYYS28WZqf8hFugCBIZEKW46qZ9uYwmlYYvqtT0ytt2r7+odd3M59E/dWdhWQF6N41hJ+wN7K4sS6vsL1SOW52Kfrp6J7beqV/UWG6B5FSsCQCUNsaowLrl7uid+e2SEetJy7dMvEd3bjmzzf56/5Z1Mjf4YKmLb2WTSXwe9v6ASnA5FY71m/9fu4RVhkyLDc9i14i0J+512BRTnJJUOOTWGXdwmLKfMi99QF6zLTK5Z4d8kOPDAoD720g/RPfjCW8fWd9w8BioJQxh+ziQCXJilnlnJWTf/m1ckWeGTf7GsXpCcceJGJUWF1tnXQdMUVxOyUakUN8p71fDordFFSDKHQwbmKUPaG451zZS85/oSLnc5QcVZFMiTkkuasRLW/4GcuGPq65nryeflZArRScyjlzzlGwzxjtfjHXeClBpUUE7lkP0Id2Kyj7vUobyisiJ+SKfQNsg2yl8CEN4wd25ES0FBTo6R3mU5uL7O0hip02lGVmcEtD/8+KwPwiPA0d58n8/n2uDWvF4OMqV8iMWae+iEQSbwWBCEfLTjrFtRaFmIXqGQy29HfL6d4SNXKoOKZmVgLcbeo6xcBgcWAIU2xmn1hcu6ry50dS9e7bLRHnn8+eC1a0GolPXtyQUCHp+vL+HLmYLUNZnsbtFu1556110x59raWlvPnW9tFVY5NQ/LhQhf4TbjnAllXuVewc8hTeXqGxkGzU2x/elIoQjRh1Z4XW0k79rVj5FLSk3PDzRGLauXGG9R60Mbnaq22jLRx+2zBrozcS+DVJ9dvSnxHRY8Ni5qeG+/L3xDQV6mW2NC6jKp43xBCbl7b3/QMa2VS3vxBjJBFWBPrfEMG0Y4u8I7p9UnIL6LORIEEsaAQGJSw13ulKPKt9FxLFbabxefPCrwkvr4bL0RXpTcq7UYUWNUpIpfFJEUNT8ks1XYEDBfOdeKIGbJ0SkW/AMchhJDwsUF16WVtCmnjAvz15nohFCmWyJxLDaZF8YKFrqo3TxzHlqNbU52Lg2DsoEuJ6Drug0f1JyWEbnf1fx9OYm1UMyCvCQN/LnIaD/69+rLgxsyPffzgisLLsUjRz13T5OZHEc+hCPMYcgA5uqbAGNkJKBcHsfZgIfunfi17927+orhZ+O1ebRaumeL63aMYp+899S3YXoCOBape8ibfQ5CaNJBt3ttRAP+hq6FhS6DHPQnKku4208baWs7op1EIJYjmROBgJ0cri8AaJCGkLo7k0Aa/+DCsQ0h9Nsr/9qrDswtshZjnGtuLvrL73YZliQ/OovviaaB79yX38XA/mLHe98TzWF6A8BLwMPq3qNkmUdreVbWtrzBhada+a/NpTq3zCdajhVzZ5suArsBT1wXLyvfafsuhKU1aso+KKGOCz2C/z7yCMt2Hgrb9Hc9N1yDNL4f2eDfiHnx+n4p2MlxGU5LAQIXAnOpc37yOX88otgLaw2c4Ld7ZAGGpt/Wb/nDnjuftcda6I2EsATmQcRSiTSndnLDrU3NgZbRsvkSyoCel4sm8l8+tXA8YVwmEN1SFvNfcZ+/zW8NQFgiUF1UVd4web/ovnYZ4Ha0C3fW6v2ldMpd5VXVlxbtad8LhzwVQ9Pi8WmueD1jMXY3OYooZvkK7E3qa/PahDqTJ9qqCrtJ6ooMlQb3YHx5zgg5RO28pvE1km6O8FUOOrpDKy8+OVXHRigjZUmUfJVLIbra4dCSk2wwqKQzNrHZbsdMR5dlKjZOZQ0vy4wa7dSO18WqamrVmuN3+rSt82X1xTdyfNGCkOCElOTWlJTW5OQEmajorp7s3Q2DQeqaWs1TqkNyCtaUQuNJm7JudIfa1n61Lc0jWuNWu3+72sh2+tYdG0yyrEIBG3L5pyI5xZc1ntjDOeAegDhWBr7quHisB2jqX2ReyzqTfHhtVwEon7d+q98N+k3qeYErpSkjEiXKgrWZH3X9qoWdgn7er74W+4fRiYsqt/Skt8VLE6OUWI6Dr+88+M/RZ6v7NwB8YBCAzdrWehKwxkgwlRy0z2lrWZg9MscWFuTh7/vlbg1f+9d1/1i//kdXVtK5jo6zgVldL0s8Su5UZG4Wnbi4WbPt5vVKTTZA4Ody3Y2cG/NO+2Jqvu/TRB04tXwgzcIn5CteDrdqjYt0fYzzB/vOgbRiRkFHxIqQpL3Mg/npoi+vnWOWRKc7J2a0e3OIKXmxwBgn+gn5SzE3tPqTReXTbfromLfSlNN/G2vhPCP6BOv9r+HqqI9T1PhJuMBWkDrgCcdl8PgbOB5amSh0IGm790A+BvY4W4TmwOs0WEzv/fD7h3uiwEou/hfKFC4KNXxFvM9eXXPSnWOdQxF+6eEbB9gSTED+IT3hSaUUF3V/euptDprKkF6920lVOpQQgOmYZP+Nw92MEmEOP2EyaAIvkLDEae55xTvY124GUbqJ+OdvINjvkJMoi/6B+dEbJgufPVg7Ldk/j3ZrQ8op/J+dCxtmbTnZ3NKfRfOV7GZeHRqi8IUtTdeWSsvnPe40byxxl8uSoWlegVhcbFjes9zbk4aRl5cPey06f66dsuXD++3951Z7FOIP2j8/9SbcDvMqX2n48K+SXaLFokC3kMHjVH4R3DkZe8zsHVW0cK38Tf3ZWB3XkKEFavrEyVPpm6lXOjrv0UBWFJNW2b6vqj0tvb19X2X7m+N5DgN7isSOnV6/Zx7UaWbnaOhqonIPltSuDJ3y1zAoicd3FDkws46ke+ZU1ixPVOE8fg2KisgMERKOPs+3WBhWWBXQF50YsDi8s150zqqs8byZxC+tmKSnhnkKt0YeJsCRJFpMxO0DpOTIjyFECOLmxgfKSG7LgzjhbbHJHhK31uhMupD5tzqPZO1KBCeqIQZjXD/TPMa2fcQcv45AfeHfHc4A3snazubR3YEKIgIn4Xx8yzL5X32w+FcJMzqY5OupB6B9NilYtC646YKIl0mTAp+rZYxtBsWbzQBb0DrenRe35nKIbayMTCNoZCCYlmNeb6WAEaYAoDvRNuHA4Yph1Pghbaz3GLXTTNpTiYUd4wo+lm7Eyk4tuubwAGon3DkYQlD5Qt/fIjfVJRwipszPSp889IuT4Q4FFFqnr98pjAp9pwZCCeJbAVP9hIr59GfUk2QlgZGjHDcN2U+yC02gEBRtZvGbWo1kUT/B8qc4a5Se0OcNsLM4VuKAGtBqV7u7e3raAAqTNRu5etWEkZTx/39mZjIhD4Nd80rFGDe6/Jft5TPG3wECQ8aFMlAHt+/01iyoTXeIj8e5n9fWKimpqTVI2On58xigwCUBIHOCOdKPdO5J8VQLSObJJwUIiQ5+HKMGaWOH3UsBFtscIrp+WLDrPX5LSKBe6SFP/AAEGXEm/grkIooaXq748n9TOWMqbGB0yeqBMTK6MspRhWQW+QxAGsC/2Vox0E6W/6NbCjr+qJCsSFzBzHTchtAC4xrog0Nll1OsU/BSfEQWyw4V4pBYRUN5ZOmDaHDhOUAGADwo+Sv589/43cgkzJk0psDFOy4ZOeuMiyk1mfdkp2UZpXPXt3okAb+y3/5Vm9dmH+rd0NJ7f/7lPCbddgjSJJQIouli8ilLv4ELV/OJ5FT/sczy3xISUro4WcFqk6X5J6m8P39LXkdXgdh7mG8OJTju84z51WR3tQejssN/tc1K6wcGZ9xN/HoJMy6cijdTzVv9Xqhuhz/B1KMD0AGKbL7ezUM5oFhkvxPSQz8cBJLLNXsv9sLtlczsey/u29V7wiDDFjJEe0QNded3b4zpr8Xq/8ynD+AbgpAN9IH8f0McaptjhuuU+dhU3CPImgzbEwa9rut5K0yR80B3Mcjw/enR9Z1jwEDPXd3pP+ylfP6dw0sM9os5r4NkzFixg4nb22Uscoz3ujc1NYXnz+u8vNDZkJjR11xcNUGz1OsJ3jeKCYFb881C/n64tcHRYukFjXMcz153+UUeKWBzT3LRjyll3qYFbENa3EBLZ/6xnt+dnb96juYvbWmxTSkbunwZRBHfUp3Rv5OvPaWoyi/sDvx8ugTHcHpXpFBDPMH8eNl1Hz0oOZYWbTht2Iq3LUxXrrAubjqxWn135p2gNroKd+CCJCKdBdlPNabwdIg1/77pjMDlTtaB9DsmzKLtpQMgJ3xeMN/86gzV9VKrLvJUKHwkcIL5yLKbGKfLIb6FTTrADXRvVMSmS/6ZlE1IJ4LSHZO6lelPiot8MrU2Tq8174lrIDFKLdkxEepZWXP1uh1WaVXbOG8Y+QTCZllwyXMbsCqVbAnJL9ZFdnMySqriL4A/HXywt8W4g0akYi3RVkFjRu/rOqLUwcxs6mzN73vnsbsT+xUuS/T5vk0oGDZNWRdXv9UsM7oeq3cMl5eXRWPCqRlRneHBi+wbPAqRqdhDVD/fbPw3VVq23xz3rYoq0RrMewRFjfJpcENUtDS+Yylm2SgxLwb2CFoRLPFPoKIQLAu8yFSaZUXW+8YWQ5X60GvYlhIc980SS/ws8Q5LSDqnJsjwIxtI97EA6UQ1bXJIr/HB4z8zsVHfRiKtv7xE09CJj6TCNtjxisW3UM8+uN/iCSG8FVVxhnXyLu/dZtxj517ktHTd78CAWKxcWlrjSrOwOQBWXa3QsdmIKw9882bv5HGBLMTn0o/x5UGuXy/lhJjlKCPrIDqUzpOJlWuAUdxuz8t+Q6EKmZubmhY8r8+zTfdmjYHJpaYkBDw7E4Xl65QOZY+i5M7apDEYHSWJiWnL89FFVQ5n8XEqO/OPUubmMT1YjsNoV2CHVlXYcje3784uWRIiznH3pgJ5zVezKJ8DTazuJp/+cbT+z4j3lwdi8r7+FSn/Yw+AtvLW1UFuat5J21c0eaUamXQH0p3XMaja7FHKFgLcg4p/7Gr2CTYDyxyM91chaO5kNxcXN/KLIk64vK/LtPj0jjruQ/FNXAB0hLtpMXKxqFseP9CDb8x7441URXq9crIJ4zarF+NrP1q6/KxRW7vr3zfPL4yIwIoZyFb/ey7XCD3VrtwishUrm6r20zk96yBL00xlLGBT6Qyyd805b1fNocmT/GzG2goduBlf1NJHl9eGYVKSMLqYZcPiydIaX8eBH3X2ibYDNQWTy1gyhexrnj4WCKaZ01u3On+CBRL+a+HRly83OvNZw5KU9PQrVy4xQWTWD2U7wWbt85009riJrY1ZLpTK2+ZIOqboAV6ew8rKzrhgIho8nUjkp/xXn932RyGXdbhNxywZHeqmWkBMFFQ33WNDg8LdEq/ejobAkgq5Ht4+0Rw3JTG1sCRFNZSaOkSWa1CpvOCNhYwycqITQIimg9j7NX+FE7b9qpLdlSuKWoX6mBKrZn2kykfGDQs3m5rijFIdPbk0R09i+udUy7eyCn+548+OkwcjX/t3qwxUYdKzpmr6pqN0vcNbmsz9jMn6SL8JgS0EeXOJ7uJHsGQYyBNomUF1LlqRNTROXr4Dsvrr67NS4dOyE0fbMlHRkfX6XEkWh5gfvd4+GfOOXXocUM/F4Nc96D4nO7S9cpvL6pg/vjhExXhbazVqkzRJCLpUp1UJs1frMLAqq6OnqhZo2qzYRmel/UxSZ/pYLM3H3GNBjCGK7+zmKvzsfSWT5AtzFfdZfPp7BMhGu93r5yuR/M51Xfgk2F9vSaxyEisHc8W6Gf12OL2Y7rmoc7vnf4+WUoKo3D8sJRhfirknTiwXgzgrIMvZBLFrxKfxRt9nZC8kW4Y1lw4nnK5azsehHimVm7QaQeJ7UJOg6A17rTJk/tZm3KXpt0MoqIO/UVWZZzHOcvlcO+JI+YsIYr7NFWLXCwfPhPSF/x+u4B6Uo2UrbEmPItwi99OcpJUNrH8uvD8Ik6k+aWvt59HlVjJZ1nIULo/CNunRi888GtxPRn1L3+VsY8YrJKcjy6cIe8mYCjZTsDnSkHW00+bhZITp0WD77ukqtBLZlQRYz+y51TXcPfr8Zefo9L8Sb3U3fv801C3SeP3IZrnLJp9827xj5a3/o7c7wrylLLta7Zxf3aXDJmvjr6nC/entC1wm9a9jd0bwCJFjFuugrjfqHofYlP78zldLxfeLXdp9UYFZpzrS3EgMEkE9ci9LdVdU0hY3/bLMVm9ppQGwnvngrcztO+QH1Y2MvRwYK6wZ3ZZPP2WTvo+/6sptiyvXOVeWp/8qhjOti9UGTaqTdT0CF5u7LfhaUinCx+fAhohRiXYhRRCgUWG4KDmXFVArQnbHe0DUBUUcEjWWKhNxrV0/rNMf/8nPdlOS2A6JIVfjkLjENxkUZyHaToyC58KjSXK4hldPsOa8xwTUh2QWbWKDrpJX0EK7lL5NxCHjuP31KkmYsD4FdNMzPFobq/FvxtkzMFjguf6fhoMWBn+9mNynAP4/i3mcpQtJPbg1YNW8pTTcav1NLIqPQ3mqPfBv3YmvVHBHWMrORm/8tM1+Vf5vjLQGmitabUfR7P56LfVWGC2Sloo7H3rtaY+mm8qBQKU1GX5jOHvut5n28u5u1lBM41See5D+oCvTPB35VDTqjuxC4+Yt3L5bpUBBptJkL3lAZbbzQfcqbcVoyZuWiDAz6A5OPuc5oSDzM/foRKDWy5O1f5geHIbKrAjv3+oGHqOD0eB5AuwqH3srDO5JGfRmRCQCNXe/CBiUoKJbRQaLRxOmZZOGTN9lvnVygEjy4LoPyecCMYydEbQblR+8VP9+zqcddFd5d7MkdnNqGBKsZjIo/WTo2+9G12dda1N6IX6gJ10eOjQFYASJbHlpMZ9ZyriAwDd58witVOGjxCkSSUrR8pt1i80glrKlvl7EwgPVsxKDxLeYJ15EoR/ndtLU0NH3g9NJd057KyQ+x3wM8tTYv/N67EZk+RfeGZzeYQztHrqRzOaiBE+832JETB/Re8ys97VvwL6dPDV8/8qQloAtREmfoN+aa/mt13nrtUJvV8Ur92+Vy8le6MQnXk4/8cHoIBY9OFx8N3JwMOJ+SXHAC4dYvPaKmuyq+rOjyjOtCliUntpkeXrArGyZyckwrUUYmAtwKfXbSxWMZK0eykLElCyLROVLhKELzp5rg7n9bf/x7j9eJIcMZlJkOU0iUajIJfjrp8ao0aNm9Eiqx8Onh13pOV9S3PlVm7BBcfN9PNzY+YTWPYBe8cZGLdqL1Faau/K8BuyavVZxvirEnaovf3PcAHKUmuf83QcPpLDrzRl1IWBE69ze8ltJ63f4PSkJRWuKdt4aq9ZryL9nb3X9U5QsYPnn69EqDuezozqIC2c8hE63o4mRz74ke9ap2pdtmL7flZ3Luzo3bcpMzJ1WUKgJifkPhFpvnXjjhvRc2WInQ/jaTH16cSE9FUV3ogpoOKqYk3SKklvBRjNYY4TV4VhydfAuvSQES3zYM4pik9M4pfWZcgWl0our/ds/TRx6Yt6oqkEf49SnP8prK1GzGeoQPYpKWjtU+Gdy+b9dTRoTe0PUfUJLxNQVJjCfjEZ+fqJZ6+M6jVBdmlzI5ApCtoySVKQqJrH9LEYfn3UE9FW3eZem42BIgf1usw1uHrGaDQtG/uPAfMpLj2xuhtF4wIoZXC7ljfCY3kh8rsPSSW2OLMVpXbMmGqcBK0OKuTnz+KcbRA5aiYbogTeDK+b7Z/2PkMdEc8HuPpyphfABngSGiuSz1gxtYph/fHvshntxgE91eWXih9qsKCs3BN/kb8qIejAn8CMysVZRB7Ke2MeXFE2GRbOvfZ4KHB+rh0xL7zTUCNZ+9kmJOp3WsseMNSdK0GU5d3NlPntoUJmKZ42LFpQsq4hmIaZr5cvY5ZyfXtjCxoaM6Gx8wHf8dXzDkd+sujxl1PISzZvU+AbUnXx3WkBP4mkaUMnyrgmAbPQGbnPRHZ5TDI/WlLmhpEzOyRZ8kvvGQnLK4CVJlNCgo3XWoTtF28xSLI77xU1qN6ubl2x9vi1bwc4SgGAU5HD24frB/MmuvBgw2YEudZ8Pw0kWInURQ0MRNqdMAJmZFblOf+XmLZJKHaVizDtChCHBIJrpfimLmIrmNGRukmROajdzmie2RQlvjjlK448LCW4wiJKQcNwzngM7k76168yd0TAVNypdFPhS3Ye1xonoBUPXHPsg3Jk8P9zBf5A0+qShPxi2e3SacauesqqzosD4G57GYtdY4bAf0N2wH3+88/GBEGUPEOHCbfU3t5YJlwl35L92uUOof7Js5Pz1V4Zq3G0MJ+Z8W2S2HPY+yRumpkSRUZN4BTNDa99wFim7nPNlDq+ejUM+qOXUniQe2jJmPeHk/ObxOkjK+mg12qIIEqH6aEbs/JzhTLYsQJi+OpyQn6OyGEWYsn43geZCVj9RI5GYvDNRQeYu0ZjarJDueFftdWrNVAOCYTccYE66IqMqjGtLYlnAy0pEHLU6Cp6JFCxU+rO/zjNzccglzYMhTI5vDAQSb1CMTbxafjhfHkJV655ovTJ8pfVIFECVh4TzvfJt4q1Fal08FK/WbR/IGO67CXdGyYe7fOohW6PKJKwF5lGLpSPPevWWmOsAVN4a1p5O6Mo2EoQJCe/oro6hSA8dTmIhG2InFnLIVuHKxSFSBZVuHq8mPne+id13/qy72h6YuKoppHJSGWDyPjxcuud88aZhAJEgCcEQkCuPjlF/27lvo+7wvj1/AmIkSmiTmdySIkHkuISjdXU/+QQEXB7vnsRoRyHuNxXKy70mSz6qrnA1MKtFmasq5dTafiM+xKRSlD5wOCXfHXH8m3v/zX3LIwu78nCHidPEcZPNv8ZmT0dbcFZhoOZyEU7gdsj/CkBgSJRy6nK3nVVIa5rOrXx6rJhnLHT/8FGy8ODsza3oTmL8Bw60KeXtWRjEMEfffXdzPZd/PxEx/V0G+M6fHi4659Pm0VgMAYnv07sko8wcVrfejdqBc3fXBS+M4kCtQAEF6u7ee1csfXbinKUi1Lh60AP01NZFSR8HSUuQHVXtAIHFj0llm1AAkWCJm2ZxmDTqkoA8RXS0XHwPNDpDKHoPHW2oO24JlGloHTA3mLkVMSiLWFj/Yj7ZeV0lXfC6IJoILRwi1ZM5EeFzh+Z6EBhSaRGVIA3Zqh/TjeufpDETjCGkU2rxMw33x16spy1TYFk5AASEnB+xBIAlzKXKkoE+ojKXLr4tfbdw0bfp8zf3uV4W5i1SuNUy6VXvs1vi8vcOS1aPH161to+7avHQXRLuTueJhR6BYY7GIn36trot6ex89rL6srogax/dMmH6Al6moJ6UIWIpLUS00hUqNQ/PN2hv2dGg++iCSv7y0j9czrZuPBr0b//xUZv+tDBepjA2niUGZ/IVPinAZt7HVcwqNwXdwsdV6P2c/ye5f4hNJCvrz/3GNl83CdSkoPofWdUHfGr19POMwWlw+v9Vese1QZDbE6rI+8/W8o+0DlvSDAyTki4QYAj0ewxmuyJb6qiDo/ac30gxN9Ywg651IGVlybJIuWsukr7CYTA80WJHUdBKaZkluZFfyish19PofVf3atuRdShHa2bi3EVzRpgvo3LZAXl5xSOKWH812kaZzxNI4sauNRD7nxpZy2WZ6jg88jEeZ+2cqBqYfWZQq33VLC2mXl+KStrGHs+3Jn0k8ds2x3bGuNvupAKx/2XX/tbEb5Ewr4seP+sfCgF71GTCluEiAOL2KwaVFD2Z+JK+KqfaY4wUearieHnLWiWtPXZTI0PG6TkKcCI4KuxeHVp4xN03U9bNijvP2cX6c7y5uF8ilcyvab/XIyfJKyrHcTIaE0kF0h6UeWwlC5eKRY64pKNeW8aJ+IU3sDhBrC0C0xY0HPPji7L8Lqv4QdN1HkbqjUVPWpph3hg7UjNHBdVG5+TGGBjpfhQDI5HCnhjoiVS6XVx7amehV/SMD1gHswh+9jwMm3BEbbFFyt2t4vTtUYYajke9DEMEGw/y8Ij45z1wiSRzQ6tUIruRjFkftHVHP9zWMXrLoHir/GkBtXaRNTroaKxg0giH5LqfI58qHZCQkZqMLPe6oxjrkmYGEPgjFT4zZbNUde2T1HUrKO+BbIU608sqb9h3xuTQ/gP6UZP75cqRj9NHd0W/Aq04+IXxsHeum6+/VZWy1Zv8buunD0uMLbcg2wvNjkuhTe2y43KGOb9drWF5+rYr9NAytrbecCvSue4frLqoeKSXP+RfUXv4jCjHtg47fwrdLRchmOQxRlIbOW7/FGaLDPchrdCa2scPmqoR65E/buv4COaMCgAgYwNEJD1LjrZuLFCJWWf+yxp4cc/NqdEnQ/HQBiAK3n3WR+ElM0NnrVH505xjDiTWbvclbGNm6KxVy4ygTuq3Dl723qQeugijTYYt7idLVrzPms05uHmR82XyerFiUQOmvsi1oRCzxo94VONS0FGml6Y1fg1enY11OWcR5vAz/xxmIMx7ia4mI1SKiHXTSJ1/BDglFfim3TJ08ik69U4j44dzmj8/JZLrqD8wNaUSp7bS0Zm0VCqtA1K7A6xn0ylT15B5GiLSh1NB3LvK6Yyqrxcpcf73pVLTSz1XEJdIxBKQnT2wvC4oPL/Uyz5Mff8szhk38Oaxq83GjhqXuFCnnp8gf3PtKx7mZkkCvdBYXGiWj547c8ZiKfS9LlYA4a/TxKYs7NV8cFX3/JnpWVm1GA21rn3SMNOQVKR6FvutcdpNnmVScAz8CxHAzxYtTgJTXCDgwC7jXfALk+35SIdkj3YHx2nfZEs5fe9kcXqBD+LiS8oQNfNuWCBlh+cQ/DViRr+gwTapyo1th0PK1EA75T+3e++IrlIsbLA93vqahnDE/WWZ8Igo7xavRk0t39djFsQ8uzoLR8jQnRtuyNHllooF3uYU29wmGFLGYVJWztV6FCovg9K0VJkj85xINgisgPGh7HbZ9K202yPKD0ndKNfh2+lWIVHSoITNGEfn8H/p34SdBBcreMRtMmszqKYDGLvhelXmMzXVsKcDhfeyMm8amX5HcYjrcpR2IA8EwbO+gvMPKuMNpbVb1ZLhQ+qsW346620mld0k3gc0aWql70I4rzR8l7r62I1wSNzmcp8b19UrxrpRKana+9iCmUneCvI8RG0eaN3OCWyzuUge4zdJeQyqQ47lF2qz+c/8vfxBR6FAG7DEyl7kclUEZTWQ9sO0Y/pHGyNbIUPJIkoD6VTcu3I3K0wDVcq7+pB8Je8jToBNtzbVdD8SJrKD+EL98K1EvW/6hTvlBjw+ydBnskilUwfL6q5iYS11aS2BH8Zs/6Hb9Pgv0L7QMKZcTct9S/g/5EZkRJOWez3IezwH1I0ff+XvCIpe0aCS74w78IoV93x4u92LCZca8vldHTk0avvM3BsRRhFh+qFm33wSxmxcFhu8UbMhjnI1ufQzTN0fYxs2mj9h42H2ucM132ONzUd8ry34AcfAh9lsc17X86vEOJolyxc2deCbT4bnOeNRuL7HnwuXjm5YSXiv/Y3yNHBh3L0aZr3Ott32S37KPxwrMnlJBWIporE75ij5GuVK/JGOzpXQRki66pH48c7YK+CEKjEmIsmw4eHJjayw3VACxmHOJSdvBpFmP70clYRjT8pPwUsL5Owd38I4nFZ66uxNlYzDqZFjZ4jO1qcT9Rw2WV999wnbDm/8lG288/8remdUfO6FVlE/J6n1EY7pmSKReKYYF+RSjztnT17UTNvEODvU3nHG3N5hsIffmGytTGKMTFz6V3fIPmuw+YZ+W2d3a+PxBTrb0T4EMn1ai0Kfe52jVxMKLPKRd70m2lOuIGvXyxYXYUCW1LjzP7k2PjOjobaRbj0pP3vAMvjcAaWEyu7w9IaaxkgyHSwLKXGTwkgIYAz6vt6VujNqa1TEnkIZHvqYyD+SEt5RbSQl3Cn6kJT04X1iVdpxX+WxY75xWQkthBvX1MsTCF/MMdOBvilq1j8VqKeHRT03PqfjLTnkNuVsn5AEky6qmyBz8ZaCeCLhaOCWgo1jvre4W8DPeZ67N4c/rE4NLf4WsYDVErQYoiBU5PEQS8340sUFgvT3N/cEOeV8sdGweBh6lGrSZ21oHORJ9263SN9vkmcp64h2h6rZftoW9e+zG+sNQ/87EEyaSnHtnRp1C/Ob0nCvBf1tV+c8Ffe2s8uXPRdsKyiEbENQ/PEZnm0tl1tJs0j3SEsohZN8TFFr4GcPgcKqP0P4RRFCeLi/fVFO4CLN8Tu2sEZOVbGKY0UP7KlcazVF4UcK0L3IEl5Kdtg8hCuXp0RrvQuFz3KuS+xDrU4Nf713wrkqrnuM8cF/wva4q8+a8ak+6AYWjWqh42j4/8OJvVd+f3uvfPRrm8O/q88kBmH/Pbmx/sjjZ/Ux2WkPeufdwINm0oZNrItts6UGIAHrDPDRH3pg0vusMBpYEP8qtMsrR+N/qG4a0dEgP0oPHQzrPgPIBgBbU3SBZLA+KReNEgNgemRNH5G4tCvIOYLBrixaJywgxK8+GRBjdX1uwKptxJDYTumQPZl6OAEkEVIC1aPMM/JjDLGoFzEBTUUQrMRLpFm9JLe2jYuj0/CG2ASh1A016grkXRxZPHqIKLCNs7upOh7PT2LqTqi9QZtFjAM12KUsu44vngHQDgcALaSx3kQM2cqw5gGyAROtc1WEMgpizEM9h4eVKLBGyXNVAdc7y48oLvMV5CaJ70DDtxE/S5YqFwHYlcoxpPy4RTyHCg+JfGfXPLQlDnUiCpOwmgRrQ/BEGSXKq5HNcIB6Rald72g/pCpks1BnyFz7HhFSCkTbxIcA6lW6JEbAoybRaajmqYfxr1o+Xj0VeNyg5ohLSFVOeRiPnKqIeFW0wfYEcZrmWckCyPhkKtVnZ+ttAm5MFbglroNyFuSwvCHaQJTUWiITxvKcWx4iKPLNmHBm6s9rrpYbInaHguAbJA6+z4E5Jn9Mm0m0URyhke/gVvw6vr2yV0la1GuKN+YC41RUviHMWJs1MlGpqNxJwenBZSiLWoQFpoZQm/gEFQpip8V9TEzdz7DfOtYuJ6/PAoEYVBIvDIlriFMWLYs+qsGcbKyRVBLREsc10X1UBNdyAwWK6iPEZeQop/xTnEePnDoWridXEW2aUCAAOPnhn29WlVbH9b/QHRrujjdTfyqqigIXNuKLq4OSLYL/qDdrw0ngNVB8Led30Q+YheBTnFiq0cntvegtEmek1fILYCgI2lSsj3pJfygTahLbYVqSY16Udy6ZljivmhRnLclmVpnC9qxdaGz2My55T4V1HOIyJvba2/euF7qlBzhFQUR8THxa2jO4yaGl0NEy1l3p25H1NexLcU+fW6HYtNy1LAQf1YQ+3WsqmdXEatYetA5zzq2aCSqN3tGufFztD0FbCpbHVO+uywULialPzN09Na5AJ/0P4dLWepzmAj1dWihDG0cGRenfZhFNtu04HZRH8oNXh8lQK3GxTkWAt23vRjA24zhaOhJiN7nPxS2MGtCsm7Qlf8Z7mM1DaMcZsKPvhDGd9150xd5tLFKsqR9cjwXoSOIMVAGjWiN4sOOuvYmXyGDf7FmzJ+7c97J9P7G89p4YfQGj7GlvdTjMS9jWUDHrwvIIu73jpZnlpIZDsrnKAJoev+3i2+uwwJJakSKzOAaNs6yn1thAeNcKGMK1Lc9gYJxQaox9Nkxsl1Ka+fv0VVzu+4M2WwzN0UNarbefu4hO3CId9MgqWbPRG/U9Hh0zQ5PIvjPF8/SW2qOB3Xh+r9AS+yxjH2UbvUcHip4UCzuXLDXOUj5Vs3fmiDbUvLRTQVI3fARhcffpdQSH8F7Y2oEYO1ayYNu8PK6uVpH2vfGS76BW00jJqkUt6jPiEo90OcmFaJYRhkfrO8bhmn4ZE1bobjxyAS3LpdbmyO5/E4iGVsTWP8AligNhc1L9MbeUPjqXmISZe9h+25R4/Qg5OtY3Ttv7K20x3d7W42Y3NWQZRxdyz8d62e+XWkbdrCg6298lt1CfFgo58ruoR6yGYZx4TEngA3JsMn2J0do+Fk2sbj/Wz0v7d0Uv2ROSOlTjQNcCv1lft8fvk2Hu7u9eTwD6BU1FXjOgCb+Ij5hPp5BcELjQA4GTnMCBl3MKDV/mDF6cyTkcJC0X8JGRUeYOrck1jKV5uQ4nrcttsNMPcwcS6cnnutGBDQLDY9x24VYg5QRJqIm0wt+HnCETP+YcSYTmAtkkN8rcoepcw7NkW64jha7LbUig4dyBzvSz/+5Gf8beJjgc7yQQKrWksAD2cMrWdyzmhI/saGkbaMyndN8tBiw2EcMAaTCyqg5JHOleryxgj8WaBjek8Ht+qjVR/FILPD9PyIpjJVOHkIoomqBEPBEb00PJk86s4sfu1yqZBgKichqc9/xXL748NfOZSVSYh64s/XmLH1Do/wn58vU0nU1ev1bLv7fXj6+rZT8x5E0c9/xCT8NQuq08cUJUfavXGDZaCXwHLjx/o5sMHDNwyEfLMnGvWm/duZhwfFVOYlVxa+jEd35trBW5OWDGTJZF1UVAS2F9lsohDCwFtIwvipABcLegmTeKlfVii60gXd4Q4UcTtXvgyO2xkLOwTzG+GFIx3NkNO8SNjORB0dz2Jpq9pHUdwrNGqpwAP4dtCcL+xhrCnV2A6xwxm+v30gzPmxS+R2cf/drD2euPvvz/SVmkleW4xoMR+yNKsqJqumFatuN6ACJMKONCen4QRnGitLFplhdlVTdt1w/jNC/rth/ndT/v5wBAEBgChcERSBQag8XhCUQSmUKl0RlMFpvD5fEFwjB9Kr5YIpXJFUqVWqPV6Q1Gk9litdkdTpfbx+PrBUAIRlAMJ0iKZliOF0RJVlRNN0zLdlzPD8IoTtIsL8qqbtquH8ZpXtZtP87rft7f3w/CKE7SLC/Kqm7argcQYUIZF1JpY90wTvOybvtxXvfzfj+xqHlk9ew9IxQ/pKJquhHK37Rsx/V8AIRgBMVwguTxBUKRWELRDCuVyRVKlVqj1ekNRpPZYrXZHU6X2+P1cQAgCAyBwuAIJAqNweLwBCIpAKBQaXQGk8XmcHl8gVAklkhlcoVSpdZodXqD0WS2WG12h9Pl9vH4egFAEBgChcERSBQag8XhCUQSmUKlWZ7OYLLYHC6PLxCKxBKpTK5QqtQarU5vMJrMFqvN7nC63B6vnz9fIBSJJVKZXKFUqTVanR4AIRhBMZwgKZphOYPRZLZYbXaH0+X2eH1+hAllXEiljXUemxUD07Jdbsfj9Sm/FgARJpRxIT0/CKM4UdrYNMuLsqqbtuuHcZqXdduP87qf93MACMEIiuEESdEMy/GCKMmKqumGadmO6/lBGMVJmuVFWdVN2/XDOM3Luu3Hed2f5/sCIAQjKIYTJEUzLMcLoiQrqqYbpmU7rucHYRQnaZYXZVU3bdcfzi8hmNVtKWhyWXpimv4zGu0z3lOOSGBdQcJNeDFBsq6APl2BiPo1nWqBnV4dRuVptVRcPzhFfNOVibFfk2XV729Ie1WOj8Sg/adU6SZMoS0z4FFXzW69ktSkAhF1Bf7rtQerjk21/pGIv/oqCtult6Oq7qK2q0Tc1iseiCW7ajvoYuDNrqAHJyBZD7I+DSjYn5Y0ju4LF3fzXXwX9B/4rC+ZwvuGSlcjyKQAxvVaY2E3xMGeiJK7Qic4OnvefSCR2k4d7PUkgjilb5KYE1F8V4G/nvwg0G1Pbky3FCn4jFFeIR1XnLBDTTiHfTpOj2jbkWMmNNmdcbZvkH+/pl/u1kCWeN6JGwH7yZC7xTUFsu+GyNoNUbcrFJYGdO8qXNoBwV0Di3cJ1PpDIcNX0cNeIoB5d8bebv7Q8geFwuaXEWXsqy/r+NxSqj2YYL8atu4qpeKGNWL9Sq4E0feSnXqvA013WqqB+B5OCWjdwQz+UAgOUZk3f960FNbhFoQtveKQnKFF0t9n9ryPnAHZQ6UyOcryKljf3X8TxvfuWUu4VWvEJgVE8g8Dje0IXMw0nqqA/F3NB2F/d48tng41xCZfa0TwiUDGO4ONr0kxZrXNq7N7zkOKW8WPWX1FqQOBeBVk9VPPOcmHiNz9QPR+srokHu+XYINL/NxQuKPzBZhLfcj0kso9BZJ3dheN1f5aUgo/ULqpaHunJbCev1pkz5nmJx+2YmmmEQGDeXMtS2hPlMO8nvYaANUXLvzmIFt/NC8lMHmVXdR8FOEfKIWU54+rRJ33zgVCy4AonkSN0xXrurnyHSLxY8Xln2Z3hog4sbVOZ6JQF5Rt+5Ech3pk7m8MKsSiajZo6YluzmlbAdB912lZCkzo2bHxRY5m/Dnd8xplRro446Nk/cejk9dP86Jrn0CXcJTC7esjHUJc+xmp5CcCTW8G/j20KQWnDXXEkEW9Qj466s36NlFsb4WbqswVlDa19JBdp1oqIKQp5A3LuGvJARHWv/iQ9cHpIN0vhmQ/NhzuDVHXG9LIN0SQf9Z4qvbj4ydleTrzyh9L/e+6FUNhTYHbvdVUJv11Zs/rVIHJBOPMeF+Br76aF7pX/kTFKXs16lBKN5tBtgWGzO+3DIMyg7p3V5ZxlPtvLUO072cqk9Lf1Nl0G2X/DfSXitfEagteIt1+7zToeztmby29V/I/g5Mqd6NX5DG4e8XLEvN81cT28WupLlG4WiLG/ApY8i30kuhKyP6SL36tGebPDJj9D9zbtY9kcLiRO/EAPFeusQLF8TTVTdRTvPUPL9zyK6lFbpPrtdbYtOYw7TuYjj23606q9dEde5gzjf2rpCG/USk5XT0kfZOa6N61ydXMMuMPl8UXm0scvaJQEx1nKNurUFmRKWvn5o+aoGYTCJMsrn36ZUsC/NRmaNQYwA8jD+m1KoMzV+CLqq1BK/y4hOrbCHh2/KBmZRa3mCsR+yvcLJixZlRy7n5q67jxKQnyh7pbVBZuks3h6Crj7Y80cMjvhV2n97pXMceznyUMtma0pzUqef7wxufv91cbCeOK9AlAWdg5fpn86arqw4v34djJhJhUFzXYWM/Zs2lfjhdxIyD+Gjud/N0P64XKSygdrTU2rTlM+w5GUcwAL/x/Usby70wDsKFFRSZSC3qnxE/8RRtLvtAtnVF9WZcOawV23eDlDQiF7aSbsM7xpgHhcXNPG0xj90cZpA8yye6jvxBo0sncBbtu4qq7pyA6YAgIoNalo+Eki5rykX/Yx5g3VdGschyUsMtfSv9RIXdKhZeiqYeqOjb11c5t0Oe6j2gZ9SWw62KftjS0ErDP3wmSVIdN1P6uXwKjM1xqwnqZ6kZzMWf2LhH8YwWOYp2MR5tkPzJSWWABb+3SO8TU9reGqzJ1o5gluXuZuF5yf7kpYCvwducdFbXbs52L4AX50d0390ZzPYkfoNlDdUPwvXveQy7VPRtaOGtWwFllBIaSGdhg9tSuX1mJ6pOjVXVA0GnAhFIbfDqRgAUUXtB5r9Qlq5iL9YJ9LtOAH1Q0T4e9wgMuXXFxpVotdi4bd+muZYj1ab3aw38bkb+0wOZv+465OsL6G+ZmLx4xSXxG3WLithPj2UTSWP+P4uUHQ0WszT97nv+LVfstTnj+5PO5MIt3ipaNNtt+VRy9fn0uePiokJ7v+WPZ02bsniEBFbE293i9PuJ9ngMAAAALV0FEPGnb6zP88rbXtCmPPvR8UcS3jeZ+2vqKlIYOhYpYm7G7QwLe7fz43s7vfcLz3zxBjz4UoKLlA9fvzxmFNmMOAFTE2sw7a63d9psjNy57N2Ou6qI4nARUxNr83dP9X5vj/Mw0gIpYm7E7QgIqYm3G7ozpIyIiIiqllFJKKUVERERExMzMzMybPzmqpzfN1sd0M1prrWeBExERERER0YGoaHr2ir8c/beM/nQm3q93Lo7D4VmbTvnLi9W+GbtnSEBFrM3YHSEBFbE2j4329RZ+GWKVct20wZ/IetvJXURERERERERmZmZmZmZmVlVVVVVVVVWzabq6e3r7ppOcf4Q2vU5krQEA"

/***/ }),
/* 86 */
/***/ (function(module, exports) {

module.exports = "data:application/font-woff;base64,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"

/***/ }),
/* 87 */
/***/ (function(module, exports) {

module.exports = "data:application/x-font-ttf;base64,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"

/***/ }),
/* 88 */
/***/ (function(module, exports) {

module.exports = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pgo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiID4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8bWV0YWRhdGE+R2VuZXJhdGVkIGJ5IEljb01vb248L21ldGFkYXRhPgo8ZGVmcz4KPGZvbnQgaWQ9Imljb21vb24iIGhvcml6LWFkdi14PSIxMDI0Ij4KPGZvbnQtZmFjZSB1bml0cy1wZXItZW09IjEwMjQiIGFzY2VudD0iOTYwIiBkZXNjZW50PSItNjQiIC8+CjxtaXNzaW5nLWdseXBoIGhvcml6LWFkdi14PSIxMDI0IiAvPgo8Z2x5cGggdW5pY29kZT0iJiN4MjA7IiBob3Jpei1hZHYteD0iNTEyIiBkPSIiIC8+CjxnbHlwaCB1bmljb2RlPSImI3hlOTAwOyIgZ2x5cGgtbmFtZT0iZ3JvdXAsIHVzZXJzIiBob3Jpei1hZHYteD0iMTA5NyIgZD0iTTMzOC44NTcgNDM4Ljg1N2MtNTkuNDI5LTEuNzE0LTExMy4xNDMtMjcuNDI5LTE1MS40MjktNzMuMTQzaC03Ni41NzFjLTU3LjE0MyAwLTExMC44NTcgMjcuNDI5LTExMC44NTcgOTAuODU3IDAgNDYuMjg2LTEuNzE0IDIwMS43MTQgNzAuODU3IDIwMS43MTQgMTIgMCA3MS40MjktNDguNTcxIDE0OC41NzEtNDguNTcxIDI2LjI4NiAwIDUxLjQyOSA0LjU3MSA3NiAxMy4xNDMtMS43MTQtMTIuNTcxLTIuODU3LTI1LjE0My0yLjg1Ny0zNy43MTQgMC01MiAxNi41NzEtMTAzLjQyOSA0Ni4yODYtMTQ2LjI4NnpNOTUwLjg1NyA3NC44NTdjMC05Mi41NzEtNjEuMTQzLTE0OC0xNTIuNTcxLTE0OGgtNDk5LjQyOWMtOTEuNDI5IDAtMTUyLjU3MSA1NS40MjktMTUyLjU3MSAxNDggMCAxMjkuMTQzIDMwLjI4NiAzMjcuNDI5IDE5Ny43MTQgMzI3LjQyOSAxOS40MjkgMCA5MC4yODYtNzkuNDI5IDIwNC41NzEtNzkuNDI5czE4NS4xNDMgNzkuNDI5IDIwNC41NzEgNzkuNDI5YzE2Ny40MjkgMCAxOTcuNzE0LTE5OC4yODYgMTk3LjcxNC0zMjcuNDI5ek0zNjUuNzE0IDgwNC41NzFjMC04MC41NzEtNjUuNzE0LTE0Ni4yODYtMTQ2LjI4Ni0xNDYuMjg2cy0xNDYuMjg2IDY1LjcxNC0xNDYuMjg2IDE0Ni4yODYgNjUuNzE0IDE0Ni4yODYgMTQ2LjI4NiAxNDYuMjg2IDE0Ni4yODYtNjUuNzE0IDE0Ni4yODYtMTQ2LjI4NnpNNzY4IDU4NS4xNDNjMC0xMjEuMTQzLTk4LjI4Ni0yMTkuNDI5LTIxOS40MjktMjE5LjQyOXMtMjE5LjQyOSA5OC4yODYtMjE5LjQyOSAyMTkuNDI5IDk4LjI4NiAyMTkuNDI5IDIxOS40MjkgMjE5LjQyOSAyMTkuNDI5LTk4LjI4NiAyMTkuNDI5LTIxOS40Mjl6TTEwOTcuMTQzIDQ1Ni41NzFjMC02My40MjktNTMuNzE0LTkwLjg1Ny0xMTAuODU3LTkwLjg1N2gtNzYuNTcxYy0zOC4yODYgNDUuNzE0LTkyIDcxLjQyOS0xNTEuNDI5IDczLjE0MyAyOS43MTQgNDIuODU3IDQ2LjI4NiA5NC4yODYgNDYuMjg2IDE0Ni4yODYgMCAxMi41NzEtMS4xNDMgMjUuMTQzLTIuODU3IDM3LjcxNCAyNC41NzEtOC41NzEgNDkuNzE0LTEzLjE0MyA3Ni0xMy4xNDMgNzcuMTQzIDAgMTM2LjU3MSA0OC41NzEgMTQ4LjU3MSA0OC41NzEgNzIuNTcxIDAgNzAuODU3LTE1NS40MjkgNzAuODU3LTIwMS43MTR6TTEwMjQgODA0LjU3MWMwLTgwLjU3MS02NS43MTQtMTQ2LjI4Ni0xNDYuMjg2LTE0Ni4yODZzLTE0Ni4yODYgNjUuNzE0LTE0Ni4yODYgMTQ2LjI4NiA2NS43MTQgMTQ2LjI4NiAxNDYuMjg2IDE0Ni4yODYgMTQ2LjI4Ni02NS43MTQgMTQ2LjI4Ni0xNDYuMjg2eiIgLz4KPGdseXBoIHVuaWNvZGU9IiYjeGU5MDE7IiBnbHlwaC1uYW1lPSJ1c2VyLXBsdXMiIGhvcml6LWFkdi14PSIxMTcwIiBkPSJNNDAyLjI4NiA0MzguODU3Yy0xMjEuMTQzIDAtMjE5LjQyOSA5OC4yODYtMjE5LjQyOSAyMTkuNDI5czk4LjI4NiAyMTkuNDI5IDIxOS40MjkgMjE5LjQyOSAyMTkuNDI5LTk4LjI4NiAyMTkuNDI5LTIxOS40MjktOTguMjg2LTIxOS40MjktMjE5LjQyOS0yMTkuNDI5ek05NTAuODU3IDM2NS43MTRoMjAxLjE0M2M5LjcxNCAwIDE4LjI4Ni04LjU3MSAxOC4yODYtMTguMjg2di0xMDkuNzE0YzAtOS43MTQtOC41NzEtMTguMjg2LTE4LjI4Ni0xOC4yODZoLTIwMS4xNDN2LTIwMS4xNDNjMC05LjcxNC04LjU3MS0xOC4yODYtMTguMjg2LTE4LjI4NmgtMTA5LjcxNGMtOS43MTQgMC0xOC4yODYgOC41NzEtMTguMjg2IDE4LjI4NnYyMDEuMTQzaC0yMDEuMTQzYy05LjcxNCAwLTE4LjI4NiA4LjU3MS0xOC4yODYgMTguMjg2djEwOS43MTRjMCA5LjcxNCA4LjU3MSAxOC4yODYgMTguMjg2IDE4LjI4NmgyMDEuMTQzdjIwMS4xNDNjMCA5LjcxNCA4LjU3MSAxOC4yODYgMTguMjg2IDE4LjI4NmgxMDkuNzE0YzkuNzE0IDAgMTguMjg2LTguNTcxIDE4LjI4Ni0xOC4yODZ2LTIwMS4xNDN6TTUzMC4yODYgMjM3LjcxNGMwLTQwIDMzLjE0My03My4xNDMgNzMuMTQzLTczLjE0M2gxNDYuMjg2di0xMzZjLTI4LTIwLjU3MS02My40MjktMjguNTcxLTk3LjcxNC0yOC41NzFoLTQ5OS40MjljLTkxLjQyOSAwLTE1Mi41NzEgNTQuODU3LTE1Mi41NzEgMTQ4IDAgMTI5LjE0MyAzMC4yODYgMzI3LjQyOSAxOTcuNzE0IDMyNy40MjkgOS4xNDMgMCAxNS40MjktNCAyMi4yODYtOS43MTQgNTYtNDIuODU3IDExMC4yODYtNjkuNzE0IDE4Mi4yODYtNjkuNzE0czEyNi4yODYgMjYuODU3IDE4Mi4yODYgNjkuNzE0YzYuODU3IDUuNzE0IDEzLjE0MyA5LjcxNCAyMi4yODYgOS43MTQgNDguNTcxIDAgOTEuNDI5LTE4LjI4NiAxMjQtNTQuODU3aC0xMjcuNDI5Yy00MCAwLTczLjE0My0zMy4xNDMtNzMuMTQzLTczLjE0M3YtMTA5LjcxNHoiIC8+CjxnbHlwaCB1bmljb2RlPSImI3hlOTAyOyIgZ2x5cGgtbmFtZT0iaW5mby1jaXJjbGUiIGhvcml6LWFkdi14PSI4NzgiIGQ9Ik01ODUuMTQzIDE2NC41NzF2OTEuNDI5YzAgMTAuMjg2LTggMTguMjg2LTE4LjI4NiAxOC4yODZoLTU0Ljg1N3YyOTIuNTcxYzAgMTAuMjg2LTggMTguMjg2LTE4LjI4NiAxOC4yODZoLTE4Mi44NTdjLTEwLjI4NiAwLTE4LjI4Ni04LTE4LjI4Ni0xOC4yODZ2LTkxLjQyOWMwLTEwLjI4NiA4LTE4LjI4NiAxOC4yODYtMTguMjg2aDU0Ljg1N3YtMTgyLjg1N2gtNTQuODU3Yy0xMC4yODYgMC0xOC4yODYtOC0xOC4yODYtMTguMjg2di05MS40MjljMC0xMC4yODYgOC0xOC4yODYgMTguMjg2LTE4LjI4NmgyNTZjMTAuMjg2IDAgMTguMjg2IDggMTguMjg2IDE4LjI4NnpNNTEyIDY3Ni41NzF2OTEuNDI5YzAgMTAuMjg2LTggMTguMjg2LTE4LjI4NiAxOC4yODZoLTEwOS43MTRjLTEwLjI4NiAwLTE4LjI4Ni04LTE4LjI4Ni0xOC4yODZ2LTkxLjQyOWMwLTEwLjI4NiA4LTE4LjI4NiAxOC4yODYtMTguMjg2aDEwOS43MTRjMTAuMjg2IDAgMTguMjg2IDggMTguMjg2IDE4LjI4NnpNODc3LjcxNCA0MzguODU3YzAtMjQyLjI4Ni0xOTYuNTcxLTQzOC44NTctNDM4Ljg1Ny00MzguODU3cy00MzguODU3IDE5Ni41NzEtNDM4Ljg1NyA0MzguODU3IDE5Ni41NzEgNDM4Ljg1NyA0MzguODU3IDQzOC44NTcgNDM4Ljg1Ny0xOTYuNTcxIDQzOC44NTctNDM4Ljg1N3oiIC8+CjxnbHlwaCB1bmljb2RlPSImI3hlOTAzOyIgZ2x5cGgtbmFtZT0iZmFjZWJvb2siIGhvcml6LWFkdi14PSI2MDIiIGQ9Ik01NDggOTQ0di0xNTAuODU3aC04OS43MTRjLTcwLjI4NiAwLTgzLjQyOS0zMy43MTQtODMuNDI5LTgyLjI4NnYtMTA4aDE2Ny40MjlsLTIyLjI4Ni0xNjkuMTQzaC0xNDUuMTQzdi00MzMuNzE0aC0xNzQuODU3djQzMy43MTRoLTE0NS43MTR2MTY5LjE0M2gxNDUuNzE0djEyNC41NzFjMCAxNDQuNTcxIDg4LjU3MSAyMjMuNDI5IDIxNy43MTQgMjIzLjQyOSA2MS43MTQgMCAxMTQuODU3LTQuNTcxIDEzMC4yODYtNi44NTd6IiAvPgo8Z2x5cGggdW5pY29kZT0iJiN4ZTkwNDsiIGdseXBoLW5hbWU9ImF0IiBob3Jpei1hZHYteD0iODc4IiBkPSJNNTU1LjQyOSA1MDhjMCA4Mi4yODYtNDIuODU3IDEzMS40MjktMTE0Ljg1NyAxMzEuNDI5LTk0Ljg1NyAwLTE5Ni41NzEtOTQuMjg2LTE5Ni41NzEtMjQ2Ljg1NyAwLTg1LjE0MyA0Mi4yODYtMTMzLjcxNCAxMTYuNTcxLTEzMy43MTQgMTE0Ljg1NyAwIDE5NC44NTcgMTMxLjQyOSAxOTQuODU3IDI0OS4xNDN6TTg3Ny43MTQgNDM4Ljg1N2MwLTE3Ny43MTQtMTI2Ljg1Ny0yNDQuNTcxLTIzNS40MjktMjQ4LTcuNDI5IDAtMTAuMjg2LTAuNTcxLTE4LjI4Ni0wLjU3MS0zNS40MjkgMC02My40MjkgMTAuMjg2LTgxLjE0MyAzMC4yODYtMTAuODU3IDEyLjU3MS0xNy4xNDMgMjguNTcxLTE4Ljg1NyA0Ny40MjktMzUuNDI5LTQ0LjU3MS05Ny4xNDMtODgtMTc0LjI4Ni04OC0xMjIuODU3IDAtMTkzLjE0MyA3Ni0xOTMuMTQzIDIwOC41NzEgMCAxODIuMjg2IDEyNi4yODYgMzMwLjI4NiAyODAuNTcxIDMzMC4yODYgNjYuODU3IDAgMTIwLjU3MS0yOC41NzEgMTQ5LjE0My03Ny4xNDNsMS4xNDMgMTAuODU3IDYuMjg2IDMyYzAuNTcxIDQuNTcxIDQuNTcxIDEwLjI4NiA4LjU3MSAxMC4yODZoNjcuNDI5YzIuODU3IDAgNS43MTQtNCA3LjQyOS02LjI4NiAxLjcxNC0xLjcxNCAyLjI4Ni02LjI4NiAxLjcxNC05LjE0M2wtNjguNTcxLTM1MC44NTdjLTIuMjg2LTEwLjg1Ny0yLjg1Ny0xOS40MjktMi44NTctMjcuNDI5IDAtMzAuODU3IDkuMTQzLTM3LjE0MyAzMi41NzEtMzcuMTQzIDM4Ljg1NyAxLjE0MyAxNjQuNTcxIDE3LjE0MyAxNjQuNTcxIDE3NC44NTcgMCAyMjIuMjg2LTE0My40MjkgMzY1LjcxNC0zNjUuNzE0IDM2NS43MTQtMjAxLjcxNCAwLTM2NS43MTQtMTY0LTM2NS43MTQtMzY1LjcxNHMxNjQtMzY1LjcxNCAzNjUuNzE0LTM2NS43MTRjODQgMCAxNjYuMjg2IDI5LjE0MyAyMzEuNDI5IDgyLjI4NiA4IDYuODU3IDE5LjQyOSA1LjcxNCAyNS43MTQtMi4yODZsMjMuNDI5LTI4YzIuODU3LTQgNC41NzEtOC41NzEgNC0xMy43MTQtMC41NzEtNC41NzEtMi44NTctOS4xNDMtNi44NTctMTIuNTcxLTc3LjcxNC02My40MjktMTc2LjU3MS05OC44NTctMjc3LjcxNC05OC44NTctMjQxLjcxNCAwLTQzOC44NTcgMTk3LjE0My00MzguODU3IDQzOC44NTdzMTk3LjE0MyA0MzguODU3IDQzOC44NTcgNDM4Ljg1N2MyNjIuMjg2IDAgNDM4Ljg1Ny0xNzYuNTcxIDQzOC44NTctNDM4Ljg1N3oiIC8+CjxnbHlwaCB1bmljb2RlPSImI3hlOTA1OyIgZ2x5cGgtbmFtZT0iY29tbWVudHMiIGQ9Ik04MDQuNTcxIDUxMmMwLTE2MS43MTQtMTgwLTI5Mi41NzEtNDAyLjI4Ni0yOTIuNTcxLTM0Ljg1NyAwLTY4LjU3MSAzLjQyOS0xMDAuNTcxIDkuMTQzLTQ3LjQyOS0zMy43MTQtMTAxLjE0My01OC4yODYtMTU4Ljg1Ny03My4xNDMtMTUuNDI5LTQtMzItNi44NTctNDkuMTQzLTkuMTQzaC0xLjcxNGMtOC41NzEgMC0xNi41NzEgNi44NTctMTguMjg2IDE2LjU3MXYwYy0yLjI4NiAxMC44NTcgNS4xNDMgMTcuNzE0IDExLjQyOSAyNS4xNDMgMjIuMjg2IDI1LjE0MyA0Ny40MjkgNDcuNDI5IDY2Ljg1NyA5NC44NTctOTIuNTcxIDUzLjcxNC0xNTIgMTM2LjU3MS0xNTIgMjI5LjE0MyAwIDE2MS43MTQgMTgwIDI5Mi41NzEgNDAyLjI4NiAyOTIuNTcxczQwMi4yODYtMTMwLjg1NyA0MDIuMjg2LTI5Mi41NzF6TTEwMjQgMzY1LjcxNGMwLTkzLjE0My01OS40MjktMTc1LjQyOS0xNTItMjI5LjE0MyAxOS40MjktNDcuNDI5IDQ0LjU3MS02OS43MTQgNjYuODU3LTk0Ljg1NyA2LjI4Ni03LjQyOSAxMy43MTQtMTQuMjg2IDExLjQyOS0yNS4xNDN2MGMtMi4yODYtMTAuMjg2LTEwLjg1Ny0xNy43MTQtMjAtMTYuNTcxLTE3LjE0MyAyLjI4Ni0zMy43MTQgNS4xNDMtNDkuMTQzIDkuMTQzLTU3LjcxNCAxNC44NTctMTExLjQyOSAzOS40MjktMTU4Ljg1NyA3My4xNDMtMzItNS43MTQtNjUuNzE0LTkuMTQzLTEwMC41NzEtOS4xNDMtMTAzLjQyOSAwLTE5OC4yODYgMjguNTcxLTI2OS43MTQgNzUuNDI5IDE2LjU3MS0xLjE0MyAzMy43MTQtMi4yODYgNTAuMjg2LTIuMjg2IDEyMi44NTcgMCAyMzguODU3IDM1LjQyOSAzMjcuNDI5IDk5LjQyOSA5NS40MjkgNjkuNzE0IDE0OCAxNjQgMTQ4IDI2Ni4yODYgMCAyOS43MTQtNC41NzEgNTguODU3LTEzLjE0MyA4Ni44NTcgOTYuNTcxLTUzLjE0MyAxNTkuNDI5LTEzNy43MTQgMTU5LjQyOS0yMzMuMTQzeiIgLz4KPGdseXBoIHVuaWNvZGU9IiYjeGU5MDY7IiBnbHlwaC1uYW1lPSJnbG9iZSIgaG9yaXotYWR2LXg9Ijg3OCIgZD0iTTQzOC44NTcgODc3LjcxNGMyNDIuMjg2IDAgNDM4Ljg1Ny0xOTYuNTcxIDQzOC44NTctNDM4Ljg1N3MtMTk2LjU3MS00MzguODU3LTQzOC44NTctNDM4Ljg1Ny00MzguODU3IDE5Ni41NzEtNDM4Ljg1NyA0MzguODU3IDE5Ni41NzEgNDM4Ljg1NyA0MzguODU3IDQzOC44NTd6TTU5NS40MjkgNTgwYy00LjU3MS0zLjQyOS03LjQyOS05LjcxNC0xMy4xNDMtMTAuODU3IDIuODU3IDAuNTcxIDUuNzE0IDEwLjg1NyA3LjQyOSAxMy4xNDMgMy40MjkgNCA4IDYuMjg2IDEyLjU3MSA4LjU3MSA5LjcxNCA0IDE5LjQyOSA1LjE0MyAyOS43MTQgNi44NTcgOS43MTQgMi4yODYgMjEuNzE0IDIuMjg2IDI5LjE0My02LjI4Ni0xLjcxNCAxLjcxNCAxMiAxMy43MTQgMTMuNzE0IDE0LjI4NiA1LjE0MyAyLjg1NyAxMy43MTQgMS43MTQgMTcuMTQzIDYuODU3IDEuMTQzIDEuNzE0IDEuMTQzIDEyLjU3MSAxLjE0MyAxMi41NzEtOS43MTQtMS4xNDMtMTMuMTQzIDgtMTMuNzE0IDE2IDAtMC41NzEtMS4xNDMtMi4yODYtMy40MjktNC41NzEgMC41NzEgOC41NzEtMTAuMjg2IDIuMjg2LTE0LjI4NiAzLjQyOS0xMy4xNDMgMy40MjktMTEuNDI5IDEyLjU3MS0xNS40MjkgMjIuMjg2LTIuMjg2IDUuMTQzLTguNTcxIDYuODU3LTEwLjg1NyAxMi0yLjI4NiAzLjQyOS0zLjQyOSAxMC44NTctOC41NzEgMTEuNDI5LTMuNDI5IDAuNTcxLTkuNzE0LTEyLTEwLjg1Ny0xMS40MjktNS4xNDMgMi44NTctNy40MjktMS4xNDMtMTEuNDI5LTMuNDI5LTMuNDI5LTIuMjg2LTYuMjg2LTEuMTQzLTkuNzE0LTIuODU3IDEwLjI4NiAzLjQyOS00LjU3MSA5LjE0My05LjcxNCA4IDggMi4yODYgNCAxMC44NTctMC41NzEgMTQuODU3aDIuODU3Yy0xLjE0MyA1LjE0My0xNy4xNDMgOS43MTQtMjIuMjg2IDEzLjE0M3MtMzIuNTcxIDkuMTQzLTM4LjI4NiA1LjcxNGMtNi44NTctNCAxLjcxNC0xNS40MjkgMS43MTQtMjEuMTQzIDAuNTcxLTYuODU3LTYuODU3LTguNTcxLTYuODU3LTE0LjI4NiAwLTkuNzE0IDE4LjI4Ni04IDEzLjcxNC0yMS4xNDMtMi44NTctOC0xMy43MTQtOS43MTQtMTguMjg2LTE2LTQuNTcxLTUuNzE0IDAuNTcxLTE2IDUuMTQzLTIwIDQuNTcxLTMuNDI5LTgtOS4xNDMtOS43MTQtMTAuMjg2LTkuNzE0LTQuNTcxLTE3LjE0MyA5LjcxNC0xOS40MjkgMTguMjg2LTEuNzE0IDYuMjg2LTIuMjg2IDEzLjcxNC05LjE0MyAxNy4xNDMtMy40MjkgMS4xNDMtMTQuMjg2IDIuODU3LTE2LjU3MS0wLjU3MS0zLjQyOSA4LjU3MS0xNS40MjkgMTItMjMuNDI5IDE0Ljg1Ny0xMS40MjkgNC0yMS4xNDMgNC0zMy4xNDMgMi4yODYgNCAwLjU3MS0xLjE0MyAxOC4yODYtMTAuODU3IDE1LjQyOSAyLjg1NyA1LjcxNCAxLjcxNCAxMiAyLjg1NyAxNy43MTQgMS4xNDMgNC41NzEgMy40MjkgOS4xNDMgNi44NTcgMTMuMTQzIDEuMTQzIDIuMjg2IDEzLjcxNCAxNS40MjkgOS43MTQgMTYgOS43MTQtMS4xNDMgMjAuNTcxLTEuNzE0IDI4LjU3MSA2LjI4NiA1LjE0MyA1LjE0MyA3LjQyOSAxMy43MTQgMTIuNTcxIDE5LjQyOSA3LjQyOSA4LjU3MSAxNi41NzEtMi4yODYgMjQuNTcxLTIuODU3IDExLjQyOS0wLjU3MSAxMC44NTcgMTIgNC41NzEgMTcuNzE0IDcuNDI5LTAuNTcxIDEuMTQzIDEzLjE0My0yLjg1NyAxNC44NTctNS4xNDMgMS43MTQtMjQuNTcxLTMuNDI5LTE0LjI4Ni03LjQyOS0yLjI4NiAxLjE0My0xNi0yNy40MjktMjQtMTMuMTQzLTIuMjg2IDIuODU3LTMuNDI5IDE0Ljg1Ny04LjU3MSAxNS40MjktNC41NzEgMC03LjQyOS01LjE0My05LjE0My04LjU3MSAyLjg1NyA3LjQyOS0xNiAxMi41NzEtMjAgMTMuMTQzIDguNTcxIDUuNzE0IDEuNzE0IDEyLTQuNTcxIDE1LjQyOS00LjU3MSAyLjg1Ny0xOC44NTcgNS4xNDMtMjIuODU3IDAuNTcxLTEwLjg1Ny0xMy4xNDMgMTEuNDI5LTE0Ljg1NyAxNy4xNDMtMTguMjg2IDEuNzE0LTEuMTQzIDguNTcxLTUuMTQzIDQuNTcxLTgtMy40MjktMS43MTQtMTMuNzE0LTQuNTcxLTE0Ljg1Ny02Ljg1Ny0zLjQyOS01LjE0MyA0LTEwLjg1Ny0xLjE0My0xNi01LjE0MyA1LjE0My01LjE0MyAxMy43MTQtOS4xNDMgMTkuNDI5IDUuMTQzLTYuMjg2LTIwLjU3MS0yLjg1Ny0yMC0yLjg1Ny04LjU3MSAwLTIyLjI4Ni01LjcxNC0yOC41NzEgMi44NTctMS4xNDMgMi4yODYtMS4xNDMgMTUuNDI5IDIuMjg2IDEyLjU3MS01LjE0MyA0LTguNTcxIDgtMTIgMTAuMjg2LTE4Ljg1Ny02LjI4Ni0zNi41NzEtMTQuMjg2LTUzLjcxNC0yMy40MjkgMi4yODYtMC41NzEgNC0wLjU3MSA2Ljg1NyAwLjU3MSA0LjU3MSAxLjcxNCA4LjU3MSA0LjU3MSAxMy4xNDMgNi44NTcgNS43MTQgMi4yODYgMTcuNzE0IDkuMTQzIDI0IDQgMC41NzEgMS4xNDMgMi4yODYgMi4yODYgMi44NTcgMi44NTcgNC00LjU3MSA4LTkuMTQzIDExLjQyOS0xNC4yODYtNC41NzEgMi4yODYtMTIgMS4xNDMtMTcuMTQzIDAuNTcxLTQtMS4xNDMtMTAuODU3LTIuMjg2LTEyLjU3MS02Ljg1NyAxLjcxNC0yLjg1NyA0LTcuNDI5IDIuODU3LTEwLjI4Ni03LjQyOSA1LjE0My0xMy4xNDMgMTMuNzE0LTIzLjQyOSAxNC44NTctNC41NzEgMC05LjE0MyAwLTEyLjU3MS0wLjU3MS01NC44NTctMzAuMjg2LTEwMS4xNDMtNzQuMjg2LTEzNC4yODYtMTI2Ljg1NyAyLjI4Ni0yLjI4NiA0LjU3MS00IDYuODU3LTQuNTcxIDUuNzE0LTEuNzE0IDAtMTguMjg2IDEwLjg1Ny05LjcxNCAzLjQyOS0yLjg1NyA0LTYuODU3IDEuNzE0LTEwLjg1NyAwLjU3MSAwLjU3MSAyMy40MjktMTQuMjg2IDI1LjE0My0xNS40MjkgNC0zLjQyOSAxMC4yODYtNy40MjkgMTItMTIgMS4xNDMtNC0yLjI4Ni04LjU3MS01LjcxNC0xMC4yODYtMC41NzEgMS4xNDMtOS4xNDMgOS43MTQtMTAuMjg2IDcuNDI5LTEuNzE0LTIuODU3IDAtMTguMjg2IDYuMjg2LTE3LjcxNC05LjE0My0wLjU3MS01LjE0My0zNi03LjQyOS00Mi44NTcgMC0wLjU3MSAxLjE0My0wLjU3MSAxLjE0My0wLjU3MS0xLjcxNC02Ljg1NyA0LTMzLjcxNCAxNS40MjktMzAuODU3LTcuNDI5LTEuNzE0IDEzLjE0My0yOCAxNi0yOS43MTQgNy40MjktNS4xNDMgMTYtOC41NzEgMjEuMTQzLTE2IDUuNzE0LTggNS43MTQtMjAgMTMuNzE0LTI2LjI4Ni0yLjI4Ni02Ljg1NyAxMi0xNC44NTcgMTEuNDI5LTI0LjU3MS0xLjE0My0wLjU3MS0xLjcxNC0wLjU3MS0yLjg1Ny0xLjE0MyAyLjg1Ny04IDEzLjcxNC04IDE3LjcxNC0xNS40MjkgMi4yODYtNC41NzEgMC0xNS40MjkgNy40MjktMTMuMTQzIDEuMTQzIDEyLjU3MS03LjQyOSAyNS4xNDMtMTMuNzE0IDM1LjQyOS0zLjQyOSA1LjcxNC02Ljg1NyAxMC44NTctOS43MTQgMTYuNTcxLTIuODU3IDUuMTQzLTMuNDI5IDExLjQyOS01LjcxNCAxNy4xNDMgMi4yODYtMC41NzEgMTQuODU3LTUuMTQzIDEzLjcxNC02Ljg1Ny00LjU3MS0xMS40MjkgMTguMjg2LTMxLjQyOSAyNC41NzEtMzguODU3IDEuNzE0LTEuNzE0IDE0Ljg1Ny0xOC44NTcgOC0xOC44NTcgNy40MjkgMCAxNy43MTQtMTEuNDI5IDIxLjE0My0xNy4xNDMgNS4xNDMtOC41NzEgNC0xOS40MjkgNy40MjktMjguNTcxIDMuNDI5LTExLjQyOSAxOS40MjktMTYuNTcxIDI4LjU3MS0yMS43MTQgOC00IDE0Ljg1Ny05LjcxNCAyMi44NTctMTIuNTcxIDEyLTQuNTcxIDE0Ljg1Ny0wLjU3MSAyNS4xNDMgMS4xNDMgMTQuODU3IDIuMjg2IDE2LjU3MS0xNC4yODYgMjguNTcxLTIwLjU3MSA3LjQyOS00IDIzLjQyOS05LjcxNCAzMS40MjktNi4yODYtMy40MjktMS4xNDMgMTItMjQuNTcxIDEzLjE0My0yNi4yODYgNS4xNDMtNi44NTcgMTQuODU3LTEwLjI4NiAyMC41NzEtMTcuMTQzIDEuNzE0IDEuMTQzIDMuNDI5IDIuODU3IDQgNS4xNDMtMi4yODYtNi4yODYgOC41NzEtMTguMjg2IDE0LjI4Ni0xNy4xNDMgNi4yODYgMS4xNDMgOCAxMy43MTQgOCAxOC4yODYtMTEuNDI5LTUuNzE0LTIxLjcxNC0xLjE0My0yOCAxMC4yODYtMS4xNDMgMi44NTctMTAuMjg2IDE4Ljg1Ny0yLjI4NiAxOC44NTcgMTAuODU3IDAgMy40MjkgOC41NzEgMi4yODYgMTYuNTcxcy05LjE0MyAxMy4xNDMtMTMuMTQzIDIwYy0zLjQyOS02Ljg1Ny0xNC44NTctNS4xNDMtMTguMjg2IDAuNTcxIDAtMS43MTQtMS43MTQtNC41NzEtMS43MTQtNi44NTctMi44NTcgMC01LjcxNC0wLjU3MS04LjU3MSAwLjU3MSAxLjE0MyA2Ljg1NyAxLjcxNCAxNS40MjkgMy40MjkgMjIuODU3IDIuODU3IDEwLjI4NiAyMS43MTQgMzAuMjg2LTIuODU3IDI5LjE0My04LjU3MS0wLjU3MS0xMi00LTE0Ljg1Ny0xMS40MjktMi44NTctNi44NTctMS43MTQtMTMuMTQzLTkuNzE0LTE2LjU3MS01LjE0My0yLjI4Ni0yMi4yODYtMS4xNDMtMjcuNDI5IDEuNzE0LTEwLjg1NyA2LjI4Ni0xOC4yODYgMjYuMjg2LTE4LjI4NiAzNy43MTQtMC41NzEgMTUuNDI5IDcuNDI5IDI5LjE0MyAwIDQzLjQyOSAzLjQyOSAyLjg1NyA2Ljg1NyA4LjU3MSAxMC44NTcgMTEuNDI5IDMuNDI5IDIuMjg2IDcuNDI5LTEuNzE0IDkuMTQzIDUuMTQzLTEuNzE0IDEuMTQzLTQgMy40MjktNC41NzEgMy40MjkgOC41NzEtNCAyNC41NzEgNS43MTQgMzIgMCA0LjU3MS0zLjQyOSA5LjcxNC00LjU3MSAxMi41NzEgMS4xNDMgMC41NzEgMS43MTQtNCA4LjU3MS0xLjcxNCAxMy4xNDMgMS43MTQtOS43MTQgOC0xMS40MjkgMTYuNTcxLTUuMTQzIDMuNDI5LTMuNDI5IDEyLjU3MS0yLjI4NiAxOC44NTctNS43MTQgNi4yODYtNCA3LjQyOS0xMC4yODYgMTQuODU3LTEuNzE0IDQuNTcxLTYuODU3IDUuMTQzLTYuODU3IDYuODU3LTEzLjcxNCAxLjcxNC02LjI4NiA1LjE0My0yMi4yODYgMTAuODU3LTI1LjE0MyAxMi03LjQyOSA5LjE0MyAxMi41NzEgOCAxOS40MjktMC41NzEgMC41NzEtMC41NzEgMTkuNDI5LTEuMTQzIDE5LjQyOS0xOC4yODYgNC0xMS40MjkgMTguMjg2LTEuMTQzIDI4IDEuNzE0IDEuMTQzIDE0Ljg1NyA1LjcxNCAyMC41NzEgMTAuMjg2IDUuMTQzIDQuNTcxIDExLjQyOSAxMi41NzEgOC41NzEgMjAgMi44NTcgMCA1LjE0MyAyLjI4NiA2LjI4NiA1LjE0My0xLjcxNCAwLjU3MS04LjU3MSA2LjI4Ni05LjcxNCA1LjcxNCA0IDIuMjg2IDMuNDI5IDUuNzE0IDEuMTQzIDkuMTQzIDUuNzE0IDMuNDI5IDIuODU3IDkuNzE0IDguNTcxIDEyIDYuMjg2LTguNTcxIDE4Ljg1NyAxLjE0MyAxMi41NzEgOCA1LjcxNCA4IDE4Ljg1NyA0IDIyLjI4NiAxMS40MjkgOC41NzEtMi4yODYgMi4yODYgOC41NzEgNi44NTcgMTQuODU3IDQgNS4xNDMgMTAuODU3IDUuMTQzIDE2IDggMC0wLjU3MSAxNC4yODYgOCA5LjcxNCA4LjU3MSA5LjcxNC0xLjE0MyAyOS4xNDMgOS4xNDMgMTQuMjg2IDE3LjcxNCAyLjI4NiA1LjE0My01LjE0MyA3LjQyOS0xMC4yODYgOC41NzEgNCAxLjE0MyA5LjE0My0xLjE0MyAxMi41NzEgMS4xNDMgNy40MjkgNS4xNDMgMi4yODYgNy40MjktNCA5LjE0My04IDIuMjg2LTE4LjI4Ni0yLjg1Ny0yNC41NzEtNi44NTd6TTUwMi4yODYgNzguODU3Yzc4LjI4NiAxMy43MTQgMTQ4IDUyLjU3MSAyMDAuNTcxIDEwOC0zLjQyOSAzLjQyOS05LjcxNCAyLjI4Ni0xNC4yODYgNC41NzEtNC41NzEgMS43MTQtOCAzLjQyOS0xMy43MTQgNC41NzEgMS4xNDMgMTEuNDI5LTExLjQyOSAxNS40MjktMTkuNDI5IDIxLjE0My03LjQyOSA1LjcxNC0xMiAxMi0yMi44NTcgOS43MTQtMS4xNDMtMC41NzEtMTIuNTcxLTQuNTcxLTEwLjI4Ni02Ljg1Ny03LjQyOSA2LjI4Ni0xMC44NTcgOS43MTQtMjAuNTcxIDEyLjU3MS05LjE0MyAyLjg1Ny0xNS40MjkgMTQuMjg2LTI0LjU3MSA0LTQuNTcxLTQuNTcxLTIuMjg2LTExLjQyOS00LjU3MS0xNi03LjQyOSA2LjI4NiA2Ljg1NyAxMy43MTQgMS4xNDMgMjAuNTcxLTYuODU3IDgtMTguODU3LTUuMTQzLTI0LjU3MS04LjU3MS0zLjQyOS0yLjg1Ny03LjQyOS00LTkuNzE0LTcuNDI5LTIuODU3LTQtNC05LjE0My02LjI4Ni0xMy4xNDMtMS43MTQgNC41NzEtMTEuNDI5IDMuNDI5LTEyIDYuODU3IDIuMjg2LTEzLjcxNCAyLjI4Ni0yOCA1LjE0My00MS43MTQgMS43MTQtOCAwLTIxLjE0My02Ljg1Ny0yNy40MjlzLTE1LjQyOS0xMy4xNDMtMTYuNTcxLTIyLjg1N2MtMS4xNDMtNi44NTcgMC41NzEtMTMuMTQzIDYuODU3LTE0Ljg1NyAwLjU3MS04LjU3MS05LjE0My0xNC44NTctOC41NzEtMjQgMC0wLjU3MSAwLjU3MS02LjI4NiAxLjE0My05LjE0M3oiIC8+CjxnbHlwaCB1bmljb2RlPSImI3hlOTA3OyIgZ2x5cGgtbmFtZT0iYmlydGhkYXktY2FrZSIgZD0iTTEwMjQgMTQ2LjI4NnYtMjE5LjQyOWgtMTAyNHYyMTkuNDI5YzU2IDAgODUuNzE0IDI1LjE0MyAxMDkuMTQzIDQ1LjE0MyAxOS40MjkgMTcuMTQzIDMyLjU3MSAyOCA2MS43MTQgMjhzNDEuNzE0LTEwLjg1NyA2MS43MTQtMjhjMjMuNDI5LTIwIDUyLjU3MS00NS4xNDMgMTA5LjE0My00NS4xNDMgNTYgMCA4NS4xNDMgMjUuMTQzIDEwOS4xNDMgNDUuMTQzIDE5LjQyOSAxNy4xNDMgMzIgMjggNjEuMTQzIDI4czQyLjI4Ni0xMC44NTcgNjEuNzE0LTI4YzIzLjQyOS0yMCA1My4xNDMtNDUuMTQzIDEwOS4xNDMtNDUuMTQzczg1LjcxNCAyNS4xNDMgMTA5LjE0MyA0NS4xNDNjMTkuNDI5IDE3LjE0MyAzMi41NzEgMjggNjEuNzE0IDI4IDI4LjU3MSAwIDQxLjcxNC0xMC44NTcgNjEuMTQzLTI4IDIzLjQyOS0yMCA1My4xNDMtNDUuMTQzIDEwOS4xNDMtNDUuMTQzek0xMDI0IDMyOS4xNDN2LTEwOS43MTRjLTI5LjE0MyAwLTQxLjcxNCAxMC44NTctNjEuNzE0IDI4LTIzLjQyOSAyMC01Mi41NzEgNDUuMTQzLTEwOC41NzEgNDUuMTQzLTU2LjU3MSAwLTg1LjcxNC0yNS4xNDMtMTA5LjE0My00NS4xNDMtMjAtMTcuMTQzLTMyLjU3MS0yOC02MS43MTQtMjhzLTQyLjI4NiAxMC44NTctNjEuNzE0IDI4Yy0yMy40MjkgMjAtNTIuNTcxIDQ1LjE0My0xMDkuMTQzIDQ1LjE0My01NiAwLTg1LjE0My0yNS4xNDMtMTA5LjE0My00NS4xNDMtMTkuNDI5LTE3LjE0My0zMi0yOC02MS4xNDMtMjhzLTQyLjI4NiAxMC44NTctNjEuNzE0IDI4Yy0yMy40MjkgMjAtNTMuMTQzIDQ1LjE0My0xMDkuMTQzIDQ1LjE0My01Ni41NzEgMC04NS43MTQtMjUuMTQzLTEwOS4xNDMtNDUuMTQzLTE5LjQyOS0xNy4xNDMtMzIuNTcxLTI4LTYxLjcxNC0yOHYxMDkuNzE0YzAgNjAuNTcxIDQ5LjE0MyAxMDkuNzE0IDEwOS43MTQgMTA5LjcxNGgzNi41NzF2MjU2aDE0Ni4yODZ2LTI1NmgxNDYuMjg2djI1NmgxNDYuMjg2di0yNTZoMTQ2LjI4NnYyNTZoMTQ2LjI4NnYtMjU2aDM2LjU3MWM2MC41NzEgMCAxMDkuNzE0LTQ5LjE0MyAxMDkuNzE0LTEwOS43MTR6TTI5Mi41NzEgODIyLjg1N2MwLTYwLjU3MS0zMi41NzEtOTEuNDI5LTczLjE0My05MS40MjlzLTczLjE0MyAzMi41NzEtNzMuMTQzIDczLjE0M2MwIDcwLjg1NyA3My4xNDMgNTIuNTcxIDczLjE0MyAxNDYuMjg2IDI3LjQyOSAwIDczLjE0My02Ny40MjkgNzMuMTQzLTEyOHpNNTg1LjE0MyA4MjIuODU3YzAtNjAuNTcxLTMyLjU3MS05MS40MjktNzMuMTQzLTkxLjQyOXMtNzMuMTQzIDMyLjU3MS03My4xNDMgNzMuMTQzYzAgNzAuODU3IDczLjE0MyA1Mi41NzEgNzMuMTQzIDE0Ni4yODYgMjcuNDI5IDAgNzMuMTQzLTY3LjQyOSA3My4xNDMtMTI4ek04NzcuNzE0IDgyMi44NTdjMC02MC41NzEtMzIuNTcxLTkxLjQyOS03My4xNDMtOTEuNDI5cy03My4xNDMgMzIuNTcxLTczLjE0MyA3My4xNDNjMCA3MC44NTcgNzMuMTQzIDUyLjU3MSA3My4xNDMgMTQ2LjI4NiAyNy40MjkgMCA3My4xNDMtNjcuNDI5IDczLjE0My0xMjh6IiAvPgo8Z2x5cGggdW5pY29kZT0iJiN4ZTkwODsiIGdseXBoLW5hbWU9InZlbnVzLW1hcnMiIGhvcml6LWFkdi14PSIxMTQ3IiBkPSJNOTUwLjg1NyA5MzIuNTcxYzAgMTAuMjg2IDggMTguMjg2IDE4LjI4NiAxOC4yODZoMTY0LjU3MWMyMCAwIDM2LjU3MS0xNi41NzEgMzYuNTcxLTM2LjU3MXYtMTY0LjU3MWMwLTEwLjI4Ni04LTE4LjI4Ni0xOC4yODYtMTguMjg2aC0zNi41NzFjLTEwLjI4NiAwLTE4LjI4NiA4LTE4LjI4NiAxOC4yODZ2NzYuNTcxbC0xNDUuMTQzLTE0NS43MTRjNTYtNzAuMjg2IDg0LTE2My40MjkgNjYuODU3LTI2My40MjktMjQtMTM3LjE0My0xMzUuNDI5LTI0Ni4yODYtMjczLjE0My0yNjYuODU3LTg2Ljg1Ny0xMy4xNDMtMTY4LjU3MSA4LTIzMy43MTQgNTEuNDI5LTQyLjg1Ny0yOC41NzEtOTIuNTcxLTQ3LjQyOS0xNDYuMjg2LTUzLjE0M3YtNzUuNDI5aDU0Ljg1N2MxMC4yODYgMCAxOC4yODYtOCAxOC4yODYtMTguMjg2di0zNi41NzFjMC0xMC4yODYtOC0xOC4yODYtMTguMjg2LTE4LjI4NmgtNTQuODU3di01NC44NTdjMC0xMC4yODYtOC0xOC4yODYtMTguMjg2LTE4LjI4NmgtMzYuNTcxYy0xMC4yODYgMC0xOC4yODYgOC0xOC4yODYgMTguMjg2djU0Ljg1N2gtNTQuODU3Yy0xMC4yODYgMC0xOC4yODYgOC0xOC4yODYgMTguMjg2djM2LjU3MWMwIDEwLjI4NiA4IDE4LjI4NiAxOC4yODYgMTguMjg2aDU0Ljg1N3Y3NS40MjljLTE3OS40MjkgMjAtMzE2IDE4NC41NzEtMjg5LjE0MyAzNzMuNzE0IDE5LjQyOSAxNDIuMjg2IDEzMi41NzEgMjU2LjU3MSAyNzQuMjg2IDI3OC4yODYgODcuNDI5IDEzLjE0MyAxNjkuMTQzLTggMjM0LjI4Ni01MS40MjkgNTIuNTcxIDM0Ljg1NyAxMTUuNDI5IDU1LjQyOSAxODIuODU3IDU1LjQyOSA3Ny43MTQgMCAxNDkuMTQzLTI3LjQyOSAyMDUuMTQzLTcybDE0NS43MTQgMTQ1LjE0M2gtNzYuNTcxYy0xMC4yODYgMC0xOC4yODYgOC0xOC4yODYgMTguMjg2djM2LjU3MXpNNTEyIDI5Ni41NzFjNDUuMTQzIDQ2LjI4NiA3My4xNDMgMTA5LjE0MyA3My4xNDMgMTc4Ljg1N3MtMjggMTMyLjU3MS03My4xNDMgMTc4Ljg1N2MtNDUuMTQzLTQ2LjI4Ni03My4xNDMtMTA5LjE0My03My4xNDMtMTc4Ljg1N3MyOC0xMzIuNTcxIDczLjE0My0xNzguODU3ek03My4xNDMgNDc1LjQyOGMwLTE0MS4xNDMgMTE0Ljg1Ny0yNTYgMjU2LTI1NiA0NS4xNDMgMCA4OCAxMiAxMjQuNTcxIDMyLjU3MS01NC4yODYgNTguODU3LTg4IDEzNy4xNDMtODggMjIzLjQyOXMzMy43MTQgMTY0LjU3MSA4OCAyMjMuNDI5Yy0zNi41NzEgMjAuNTcxLTc5LjQyOSAzMi41NzEtMTI0LjU3MSAzMi41NzEtMTQxLjE0MyAwLTI1Ni0xMTQuODU3LTI1Ni0yNTZ6TTY5NC44NTcgMjE5LjQyOGMxNDEuMTQzIDAgMjU2IDExNC44NTcgMjU2IDI1NnMtMTE0Ljg1NyAyNTYtMjU2IDI1NmMtNDUuMTQzIDAtODgtMTItMTI0LjU3MS0zMi41NzEgNTQuMjg2LTU4Ljg1NyA4OC0xMzcuMTQzIDg4LTIyMy40MjlzLTMzLjcxNC0xNjQuNTcxLTg4LTIyMy40MjljMzYuNTcxLTIwLjU3MSA3OS40MjktMzIuNTcxIDEyNC41NzEtMzIuNTcxeiIgLz4KPGdseXBoIHVuaWNvZGU9IiYjeGU5MDk7IiBnbHlwaC1uYW1lPSJtYWlsLWZvcndhcmQiIGQ9Ik0xMDI0IDU4NS4xNDNjMC05LjcxNC00LTE4Ljg1Ny0xMC44NTctMjUuNzE0bC0yOTIuNTcxLTI5Mi41NzFjLTYuODU3LTYuODU3LTE2LTEwLjg1Ny0yNS43MTQtMTAuODU3LTIwIDAtMzYuNTcxIDE2LjU3MS0zNi41NzEgMzYuNTcxdjE0Ni4yODZoLTEyOGMtMjQ2LjI4NiAwLTQwOC00Ny40MjktNDA4LTMyMCAwLTIzLjQyOSAxLjE0My00Ni44NTcgMi44NTctNzAuMjg2IDAuNTcxLTkuMTQzIDIuODU3LTE5LjQyOSAyLjg1Ny0yOC41NzEgMC0xMC44NTctNi44NTctMjAtMTguMjg2LTIwLTggMC0xMiA0LTE2IDkuNzE0LTguNTcxIDEyLTE0Ljg1NyAzMC4yODYtMjEuMTQzIDQzLjQyOS0zMi41NzEgNzMuMTQzLTcyLjU3MSAxNzcuNzE0LTcyLjU3MSAyNTcuNzE0IDAgNjQgNi4yODYgMTI5LjcxNCAzMC4yODYgMTkwLjI4NiA3OS40MjkgMTk3LjE0MyAzMTIuNTcxIDIzMC4yODYgNTAwIDIzMC4yODZoMTI4djE0Ni4yODZjMCAyMCAxNi41NzEgMzYuNTcxIDM2LjU3MSAzNi41NzEgOS43MTQgMCAxOC44NTctNCAyNS43MTQtMTAuODU3bDI5Mi41NzEtMjkyLjU3MWM2Ljg1Ny02Ljg1NyAxMC44NTctMTYgMTAuODU3LTI1LjcxNHoiIC8+CjwvZm9udD48L2RlZnM+PC9zdmc+"

/***/ }),
/* 89 */
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
/* 90 */
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
/* 91 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });

var angular = __webpack_require__(9);
/* harmony default export */ __webpack_exports__["default"] = (angular.module('myApp.viewMeals', ['myApp.viewMealsDtld', 'ngMap'])


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
/* 92 */
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
/* 93 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });


/* harmony default export */ __webpack_exports__["default"] = (angular.module('myApp.viewMyMeals', ['myApp.viewMyMealsDtld'])

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
/* 94 */
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
/* 95 */
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
/* 96 */
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
/* 97 */
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
/* 98 */
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
/* 99 */
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

/***/ }),
/* 100 */
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
/* 101 */
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
/* 102 */
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
/* 103 */
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
/* 104 */
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
/* 105 */
/***/ (function(module, exports) {

/**
 * Satellizer 0.14.0
 * (c) 2016 Sahat Yalkabov
 * License: MIT
 */
"undefined"!=typeof module&&"undefined"!=typeof exports&&module.exports===exports&&(module.exports="satellizer"),function(e,t,r){"use strict";e.location.origin||(e.location.origin=e.location.protocol+"//"+e.location.hostname+(e.location.port?":"+e.location.port:"")),t.module("satellizer",[]).constant("SatellizerConfig",{httpInterceptor:function(){return!0},withCredentials:!1,tokenRoot:null,baseUrl:"/",loginUrl:"/auth/login",signupUrl:"/auth/signup",unlinkUrl:"/auth/unlink/",tokenName:"token",tokenPrefix:"satellizer",authHeader:"Authorization",authToken:"Bearer",storageType:"localStorage",providers:{facebook:{name:"facebook",url:"/auth/facebook",authorizationEndpoint:"https://www.facebook.com/v2.5/dialog/oauth",redirectUri:e.location.origin+"/",requiredUrlParams:["display","scope"],scope:["email"],scopeDelimiter:",",display:"popup",oauthType:"2.0",popupOptions:{width:580,height:400}},google:{name:"google",url:"/auth/google",authorizationEndpoint:"https://accounts.google.com/o/oauth2/auth",redirectUri:e.location.origin,requiredUrlParams:["scope"],optionalUrlParams:["display"],scope:["profile","email"],scopePrefix:"openid",scopeDelimiter:" ",display:"popup",oauthType:"2.0",popupOptions:{width:452,height:633}},github:{name:"github",url:"/auth/github",authorizationEndpoint:"https://github.com/login/oauth/authorize",redirectUri:e.location.origin,optionalUrlParams:["scope"],scope:["user:email"],scopeDelimiter:" ",oauthType:"2.0",popupOptions:{width:1020,height:618}},instagram:{name:"instagram",url:"/auth/instagram",authorizationEndpoint:"https://api.instagram.com/oauth/authorize",redirectUri:e.location.origin,requiredUrlParams:["scope"],scope:["basic"],scopeDelimiter:"+",oauthType:"2.0"},linkedin:{name:"linkedin",url:"/auth/linkedin",authorizationEndpoint:"https://www.linkedin.com/uas/oauth2/authorization",redirectUri:e.location.origin,requiredUrlParams:["state"],scope:["r_emailaddress"],scopeDelimiter:" ",state:"STATE",oauthType:"2.0",popupOptions:{width:527,height:582}},twitter:{name:"twitter",url:"/auth/twitter",authorizationEndpoint:"https://api.twitter.com/oauth/authenticate",redirectUri:e.location.origin,oauthType:"1.0",popupOptions:{width:495,height:645}},twitch:{name:"twitch",url:"/auth/twitch",authorizationEndpoint:"https://api.twitch.tv/kraken/oauth2/authorize",redirectUri:e.location.origin,requiredUrlParams:["scope"],scope:["user_read"],scopeDelimiter:" ",display:"popup",oauthType:"2.0",popupOptions:{width:500,height:560}},live:{name:"live",url:"/auth/live",authorizationEndpoint:"https://login.live.com/oauth20_authorize.srf",redirectUri:e.location.origin,requiredUrlParams:["display","scope"],scope:["wl.emails"],scopeDelimiter:" ",display:"popup",oauthType:"2.0",popupOptions:{width:500,height:560}},yahoo:{name:"yahoo",url:"/auth/yahoo",authorizationEndpoint:"https://api.login.yahoo.com/oauth2/request_auth",redirectUri:e.location.origin,scope:[],scopeDelimiter:",",oauthType:"2.0",popupOptions:{width:559,height:519}},bitbucket:{name:"bitbucket",url:"/auth/bitbucket",authorizationEndpoint:"https://bitbucket.org/site/oauth2/authorize",redirectUri:e.location.origin+"/",requiredUrlParams:["scope"],scope:["email"],scopeDelimiter:" ",oauthType:"2.0",popupOptions:{width:1028,height:529}}}}).provider("$auth",["SatellizerConfig",function(e){Object.defineProperties(this,{httpInterceptor:{get:function(){return e.httpInterceptor},set:function(t){"function"==typeof t?e.httpInterceptor=t:e.httpInterceptor=function(){return t}}},baseUrl:{get:function(){return e.baseUrl},set:function(t){e.baseUrl=t}},loginUrl:{get:function(){return e.loginUrl},set:function(t){e.loginUrl=t}},signupUrl:{get:function(){return e.signupUrl},set:function(t){e.signupUrl=t}},tokenRoot:{get:function(){return e.tokenRoot},set:function(t){e.tokenRoot=t}},tokenName:{get:function(){return e.tokenName},set:function(t){e.tokenName=t}},tokenPrefix:{get:function(){return e.tokenPrefix},set:function(t){e.tokenPrefix=t}},unlinkUrl:{get:function(){return e.unlinkUrl},set:function(t){e.unlinkUrl=t}},authHeader:{get:function(){return e.authHeader},set:function(t){e.authHeader=t}},authToken:{get:function(){return e.authToken},set:function(t){e.authToken=t}},withCredentials:{get:function(){return e.withCredentials},set:function(t){e.withCredentials=t}},storageType:{get:function(){return e.storageType},set:function(t){e.storageType=t}}}),t.forEach(Object.keys(e.providers),function(r){this[r]=function(n){return t.extend(e.providers[r],n)}},this);var r=function(r){e.providers[r.name]=e.providers[r.name]||{},t.extend(e.providers[r.name],r)};this.oauth1=function(t){r(t),e.providers[t.name].oauthType="1.0"},this.oauth2=function(t){r(t),e.providers[t.name].oauthType="2.0"},this.$get=["$q","SatellizerShared","SatellizerLocal","SatellizerOauth",function(e,t,r,n){var o={};return o.login=function(e,t){return r.login(e,t)},o.signup=function(e,t){return r.signup(e,t)},o.logout=function(){return t.logout()},o.authenticate=function(e,t){return n.authenticate(e,t)},o.link=function(e,t){return n.authenticate(e,t)},o.unlink=function(e,t){return n.unlink(e,t)},o.isAuthenticated=function(){return t.isAuthenticated()},o.getToken=function(){return t.getToken()},o.setToken=function(e){t.setToken({access_token:e})},o.removeToken=function(){return t.removeToken()},o.getPayload=function(){return t.getPayload()},o.setStorageType=function(e){return t.setStorageType(e)},o}]}]).factory("SatellizerShared",["$q","$window","$log","SatellizerConfig","SatellizerStorage",function(n,o,i,a,u){var l={},p=a.tokenPrefix?[a.tokenPrefix,a.tokenName].join("_"):a.tokenName;return l.getToken=function(){return u.get(p)},l.getPayload=function(){var t=u.get(p);if(t&&3===t.split(".").length)try{var n=t.split(".")[1],o=n.replace(/-/g,"+").replace(/_/g,"/");return JSON.parse(decodeURIComponent(escape(e.atob(o))))}catch(i){return r}},l.setToken=function(e){if(!e)return i.warn("Can't set token without passing a value");var r,n=e&&e.access_token;if(n&&(t.isObject(n)&&t.isObject(n.data)?e=n:t.isString(n)&&(r=n)),!r&&e){var o=a.tokenRoot&&a.tokenRoot.split(".").reduce(function(e,t){return e[t]},e.data);r=o?o[a.tokenName]:e.data&&e.data[a.tokenName]}if(!r){var l=a.tokenRoot?a.tokenRoot+"."+a.tokenName:a.tokenName;return i.warn('Expecting a token named "'+l)}u.set(p,r)},l.removeToken=function(){u.remove(p)},l.isAuthenticated=function(){var e=u.get(p);if(e){if(3===e.split(".").length)try{var t=e.split(".")[1],r=t.replace(/-/g,"+").replace(/_/g,"/"),n=JSON.parse(o.atob(r)).exp;if(n){var i=Math.round((new Date).getTime()/1e3)>=n;return i?!1:!0}}catch(a){return!0}return!0}return!1},l.logout=function(){return u.remove(p),n.when()},l.setStorageType=function(e){a.storageType=e},l}]).factory("SatellizerOauth",["$q","$http","SatellizerConfig","SatellizerUtils","SatellizerShared","SatellizerOauth1","SatellizerOauth2",function(e,t,r,n,o,i,a){var u={};return u.authenticate=function(t,n){var u="1.0"===r.providers[t].oauthType?new i:new a,l=e.defer();return u.open(r.providers[t],n||{}).then(function(e){r.providers[t].url&&o.setToken(e,!1),l.resolve(e)})["catch"](function(e){l.reject(e)}),l.promise},u.unlink=function(e,o){return o=o||{},o.url=o.url?o.url:n.joinUrl(r.baseUrl,r.unlinkUrl),o.data={provider:e}||o.data,o.method=o.method||"POST",o.withCredentials=o.withCredentials||r.withCredentials,t(o)},u}]).factory("SatellizerLocal",["$http","SatellizerUtils","SatellizerShared","SatellizerConfig",function(e,t,r,n){var o={};return o.login=function(o,i){return i=i||{},i.url=i.url?i.url:t.joinUrl(n.baseUrl,n.loginUrl),i.data=o||i.data,i.method=i.method||"POST",i.withCredentials=i.withCredentials||n.withCredentials,e(i).then(function(e){return r.setToken(e),e})},o.signup=function(r,o){return o=o||{},o.url=o.url?o.url:t.joinUrl(n.baseUrl,n.signupUrl),o.data=r||o.data,o.method=o.method||"POST",o.withCredentials=o.withCredentials||n.withCredentials,e(o)},o}]).factory("SatellizerOauth2",["$q","$http","$window","$timeout","SatellizerPopup","SatellizerUtils","SatellizerConfig","SatellizerStorage",function(r,n,o,i,a,u,l,p){return function(){var o={},c={defaultUrlParams:["response_type","client_id","redirect_uri"],responseType:"code",responseParams:{code:"code",clientId:"clientId",redirectUri:"redirectUri"}};return o.open=function(n,l){c=u.merge(n,c);var s=r.defer();return i(function(){var r,n,i=c.name+"_state";return t.isFunction(c.state)?p.set(i,c.state()):t.isString(c.state)&&p.set(i,c.state),r=[c.authorizationEndpoint,o.buildQueryString()].join("?"),n=e.cordova?a.open(r,c.name,c.popupOptions,c.redirectUri).eventListener(c.redirectUri):a.open(r,c.name,c.popupOptions,c.redirectUri).pollPopup(c.redirectUri),n.then(function(e){return"token"!==c.responseType&&c.url||s.resolve(e),e.state&&e.state!==p.get(i)?s.reject("The value returned in the state parameter does not match the state value from your original authorization code request."):void s.resolve(o.exchangeForToken(e,l))})}),s.promise},o.exchangeForToken=function(e,r){var o=t.extend({},r);t.forEach(c.responseParams,function(t,r){switch(r){case"code":o[t]=e.code;break;case"clientId":o[t]=c.clientId;break;case"redirectUri":o[t]=c.redirectUri;break;default:o[t]=e[r]}}),e.state&&(o.state=e.state);var i=l.baseUrl?u.joinUrl(l.baseUrl,c.url):c.url;return n.post(i,o,{withCredentials:l.withCredentials})},o.buildQueryString=function(){var e=[],r=["defaultUrlParams","requiredUrlParams","optionalUrlParams"];return t.forEach(r,function(r){t.forEach(c[r],function(r){var n=u.camelCase(r),o=t.isFunction(c[r])?c[r]():c[n];if("redirect_uri"!==r||o){if("state"===r){var i=c.name+"_state";o=encodeURIComponent(p.get(i))}"scope"===r&&Array.isArray(o)&&(o=o.join(c.scopeDelimiter),c.scopePrefix&&(o=[c.scopePrefix,o].join(c.scopeDelimiter))),e.push([r,o])}})}),e.map(function(e){return e.join("=")}).join("&")},o}}]).factory("SatellizerOauth1",["$q","$http","SatellizerPopup","SatellizerConfig","SatellizerUtils",function(r,n,o,i,a){return function(){var r={},u={url:null,name:null,popupOptions:null,redirectUri:null,authorizationEndpoint:null};return r.open=function(l,p){t.extend(u,l);var c,s=i.baseUrl?a.joinUrl(i.baseUrl,u.url):u.url;return e.cordova||(c=o.open("",u.name,u.popupOptions,u.redirectUri)),n.post(s,u).then(function(t){var n=[u.authorizationEndpoint,r.buildQueryString(t.data)].join("?");e.cordova?c=o.open(n,u.name,u.popupOptions,u.redirectUri):c.popupWindow.location=n;var i;return i=e.cordova?c.eventListener(u.redirectUri):c.pollPopup(u.redirectUri),i.then(function(e){return r.exchangeForToken(e,p)})})},r.exchangeForToken=function(e,r){var o=t.extend({},r,e),l=i.baseUrl?a.joinUrl(i.baseUrl,u.url):u.url;return n.post(l,o,{withCredentials:i.withCredentials})},r.buildQueryString=function(e){var r=[];return t.forEach(e,function(e,t){r.push(encodeURIComponent(t)+"="+encodeURIComponent(e))}),r.join("&")},r}}]).factory("SatellizerPopup",["$q","$interval","$window","SatellizerConfig","SatellizerUtils",function(n,o,i,a,u){var l={};return l.url="",l.popupWindow=null,l.open=function(t,r,n){l.url=t;var o=l.stringifyOptions(l.prepareOptions(n)),a=i.navigator.userAgent,u=e.cordova||a.indexOf("CriOS")>-1?"_blank":r;return l.popupWindow=i.open(t,u,o),i.popup=l.popupWindow,l.popupWindow&&l.popupWindow.focus&&l.popupWindow.focus(),l},l.eventListener=function(e){var r=n.defer();return l.popupWindow.addEventListener("loadstart",function(n){if(0===n.url.indexOf(e)){var o=document.createElement("a");if(o.href=n.url,o.search||o.hash){var i=o.search.substring(1).replace(/\/$/,""),a=o.hash.substring(1).replace(/\/$/,""),p=u.parseQueryString(a),c=u.parseQueryString(i);t.extend(c,p),c.error||r.resolve(c),l.popupWindow.close()}}}),l.popupWindow.addEventListener("loaderror",function(){r.reject("Authorization Failed")}),r.promise},l.pollPopup=function(e){var i=n.defer(),a=document.createElement("a");a.href=e;var p=u.getFullUrlPath(a),c=o(function(){(!l.popupWindow||l.popupWindow.closed||l.popupWindow.closed===r)&&(i.reject("The popup window was closed."),o.cancel(c));try{var e=u.getFullUrlPath(l.popupWindow.location);if(e===p){if(l.popupWindow.location.search||l.popupWindow.location.hash){var n=l.popupWindow.location.search.substring(1).replace(/\/$/,""),a=l.popupWindow.location.hash.substring(1).replace(/[\/$]/,""),s=u.parseQueryString(a),h=u.parseQueryString(n);t.extend(h,s),h.error?i.reject(h):i.resolve(h)}else i.reject("Redirect has occurred but no query or hash parameters were found. They were either not set during the redirect, or were removed before Satellizer could read them, e.g. AngularJS routing mechanism.");o.cancel(c),l.popupWindow.close()}}catch(d){}},20);return i.promise},l.prepareOptions=function(e){e=e||{};var r=e.width||500,n=e.height||500;return t.extend({width:r,height:n,left:i.screenX+(i.outerWidth-r)/2,top:i.screenY+(i.outerHeight-n)/2.5},e)},l.stringifyOptions=function(e){var r=[];return t.forEach(e,function(e,t){r.push(t+"="+e)}),r.join(",")},l}]).service("SatellizerUtils",function(){this.getFullUrlPath=function(e){return e.protocol+"//"+e.hostname+(e.port?":"+e.port:"")+e.pathname},this.camelCase=function(e){return e.replace(/([\:\-\_]+(.))/g,function(e,t,r,n){return n?r.toUpperCase():r})},this.parseQueryString=function(e){var r,n,o={};return t.forEach((e||"").split("&"),function(e){e&&(n=e.split("="),r=decodeURIComponent(n[0]),o[r]=t.isDefined(n[1])?decodeURIComponent(n[1]):!0)}),o},this.joinUrl=function(e,t){if(/^(?:[a-z]+:)?\/\//i.test(t))return t;var r=[e,t].join("/"),n=function(e){return e.replace(/[\/]+/g,"/").replace(/\/\?/g,"?").replace(/\/\#/g,"#").replace(/\:\//g,"://")};return n(r)},this.merge=function(e,t){var r={};for(var n in e)e.hasOwnProperty(n)&&(n in t&&"object"==typeof e[n]&&null!==n?r[n]=this.merge(e[n],t[n]):r[n]=e[n]);for(n in t)if(t.hasOwnProperty(n)){if(n in r)continue;r[n]=t[n]}return r}}).factory("SatellizerStorage",["$window","$log","SatellizerConfig",function(e,t,r){var n={},o=function(){try{var t=r.storageType in e&&null!==e[r.storageType];if(t){var n=Math.random().toString(36).substring(7);e[r.storageType].setItem(n,""),e[r.storageType].removeItem(n)}return t}catch(o){return!1}}();return o||t.warn(r.storageType+" is not available."),{get:function(t){return o?e[r.storageType].getItem(t):n[t]},set:function(t,i){return o?e[r.storageType].setItem(t,i):n[t]=i},remove:function(t){return o?e[r.storageType].removeItem(t):delete n[t]}}}]).factory("SatellizerInterceptor",["$q","SatellizerConfig","SatellizerStorage","SatellizerShared",function(e,t,r,n){return{request:function(e){if(e.skipAuthorization)return e;if(n.isAuthenticated()&&t.httpInterceptor(e)){var o=t.tokenPrefix?t.tokenPrefix+"_"+t.tokenName:t.tokenName,i=r.get(o);t.authHeader&&t.authToken&&(i=t.authToken+" "+i),e.headers[t.authHeader]=i}return e},responseError:function(t){return e.reject(t)}}}]).config(["$httpProvider",function(e){e.interceptors.push("SatellizerInterceptor")}])}(window,window.angular);

/***/ }),
/* 106 */
/***/ (function(module, exports) {

/*
 AngularJS v1.6.4
 (c) 2010-2017 Google, Inc. http://angularjs.org
 License: MIT
*/
(function(R,y){'use strict';function Ea(a,b,c){if(!a)throw Oa("areq",b||"?",c||"required");return a}function Fa(a,b){if(!a&&!b)return"";if(!a)return b;if(!b)return a;W(a)&&(a=a.join(" "));W(b)&&(b=b.join(" "));return a+" "+b}function Pa(a){var b={};a&&(a.to||a.from)&&(b.to=a.to,b.from=a.from);return b}function X(a,b,c){var d="";a=W(a)?a:a&&F(a)&&a.length?a.split(/\s+/):[];s(a,function(a,e){a&&0<a.length&&(d+=0<e?" ":"",d+=c?b+a:a+b)});return d}function Ga(a){if(a instanceof E)switch(a.length){case 0:return a;
case 1:if(1===a[0].nodeType)return a;break;default:return E(ua(a))}if(1===a.nodeType)return E(a)}function ua(a){if(!a[0])return a;for(var b=0;b<a.length;b++){var c=a[b];if(1===c.nodeType)return c}}function Qa(a,b,c){s(b,function(b){a.addClass(b,c)})}function Ra(a,b,c){s(b,function(b){a.removeClass(b,c)})}function Y(a){return function(b,c){c.addClass&&(Qa(a,b,c.addClass),c.addClass=null);c.removeClass&&(Ra(a,b,c.removeClass),c.removeClass=null)}}function na(a){a=a||{};if(!a.$$prepared){var b=a.domOperation||
P;a.domOperation=function(){a.$$domOperationFired=!0;b();b=P};a.$$prepared=!0}return a}function ha(a,b){Ha(a,b);Ia(a,b)}function Ha(a,b){b.from&&(a.css(b.from),b.from=null)}function Ia(a,b){b.to&&(a.css(b.to),b.to=null)}function U(a,b,c){var d=b.options||{};c=c.options||{};var f=(d.addClass||"")+" "+(c.addClass||""),e=(d.removeClass||"")+" "+(c.removeClass||"");a=Sa(a.attr("class"),f,e);c.preparationClasses&&(d.preparationClasses=Z(c.preparationClasses,d.preparationClasses),delete c.preparationClasses);
f=d.domOperation!==P?d.domOperation:null;va(d,c);f&&(d.domOperation=f);d.addClass=a.addClass?a.addClass:null;d.removeClass=a.removeClass?a.removeClass:null;b.addClass=d.addClass;b.removeClass=d.removeClass;return d}function Sa(a,b,c){function d(a){F(a)&&(a=a.split(" "));var b={};s(a,function(a){a.length&&(b[a]=!0)});return b}var f={};a=d(a);b=d(b);s(b,function(a,b){f[b]=1});c=d(c);s(c,function(a,b){f[b]=1===f[b]?null:-1});var e={addClass:"",removeClass:""};s(f,function(b,c){var d,f;1===b?(d="addClass",
f=!a[c]||a[c+"-remove"]):-1===b&&(d="removeClass",f=a[c]||a[c+"-add"]);f&&(e[d].length&&(e[d]+=" "),e[d]+=c)});return e}function Q(a){return a instanceof E?a[0]:a}function Ta(a,b,c){var d="";b&&(d=X(b,"ng-",!0));c.addClass&&(d=Z(d,X(c.addClass,"-add")));c.removeClass&&(d=Z(d,X(c.removeClass,"-remove")));d.length&&(c.preparationClasses=d,a.addClass(d))}function oa(a,b){var c=b?"-"+b+"s":"";ka(a,[la,c]);return[la,c]}function wa(a,b){var c=b?"paused":"",d=$+"PlayState";ka(a,[d,c]);return[d,c]}function ka(a,
b){a.style[b[0]]=b[1]}function Z(a,b){return a?b?a+" "+b:a:b}function Ja(a,b,c){var d=Object.create(null),f=a.getComputedStyle(b)||{};s(c,function(a,b){var c=f[a];if(c){var G=c.charAt(0);if("-"===G||"+"===G||0<=G)c=Ua(c);0===c&&(c=null);d[b]=c}});return d}function Ua(a){var b=0;a=a.split(/\s*,\s*/);s(a,function(a){"s"===a.charAt(a.length-1)&&(a=a.substring(0,a.length-1));a=parseFloat(a)||0;b=b?Math.max(a,b):a});return b}function xa(a){return 0===a||null!=a}function Ka(a,b){var c=S,d=a+"s";b?c+="Duration":
d+=" linear all";return[c,d]}function La(){var a=Object.create(null);return{flush:function(){a=Object.create(null)},count:function(b){return(b=a[b])?b.total:0},get:function(b){return(b=a[b])&&b.value},put:function(b,c){a[b]?a[b].total++:a[b]={total:1,value:c}}}}function Ma(a,b,c){s(c,function(c){a[c]=ya(a[c])?a[c]:b.style.getPropertyValue(c)})}var S,za,$,Aa;void 0===R.ontransitionend&&void 0!==R.onwebkittransitionend?(S="WebkitTransition",za="webkitTransitionEnd transitionend"):(S="transition",za=
"transitionend");void 0===R.onanimationend&&void 0!==R.onwebkitanimationend?($="WebkitAnimation",Aa="webkitAnimationEnd animationend"):($="animation",Aa="animationend");var pa=$+"Delay",Ba=$+"Duration",la=S+"Delay",Na=S+"Duration",Oa=y.$$minErr("ng"),Va={transitionDuration:Na,transitionDelay:la,transitionProperty:S+"Property",animationDuration:Ba,animationDelay:pa,animationIterationCount:$+"IterationCount"},Wa={transitionDuration:Na,transitionDelay:la,animationDuration:Ba,animationDelay:pa},Ca,va,
s,W,ya,da,Da,aa,F,N,E,P;y.module("ngAnimate",[],function(){P=y.noop;Ca=y.copy;va=y.extend;E=y.element;s=y.forEach;W=y.isArray;F=y.isString;aa=y.isObject;N=y.isUndefined;ya=y.isDefined;Da=y.isFunction;da=y.isElement}).info({angularVersion:"1.6.4"}).directive("ngAnimateSwap",["$animate","$rootScope",function(a,b){return{restrict:"A",transclude:"element",terminal:!0,priority:600,link:function(b,d,f,e,p){var K,G;b.$watchCollection(f.ngAnimateSwap||f["for"],function(f){K&&a.leave(K);G&&(G.$destroy(),G=
null);if(f||0===f)G=b.$new(),p(G,function(b){K=b;a.enter(b,null,d)})})}}}]).directive("ngAnimateChildren",["$interpolate",function(a){return{link:function(b,c,d){function f(a){c.data("$$ngAnimateChildren","on"===a||"true"===a)}var e=d.ngAnimateChildren;F(e)&&0===e.length?c.data("$$ngAnimateChildren",!0):(f(a(e)(b)),d.$observe("ngAnimateChildren",f))}}}]).factory("$$rAFScheduler",["$$rAF",function(a){function b(a){d=d.concat(a);c()}function c(){if(d.length){for(var b=d.shift(),p=0;p<b.length;p++)b[p]();
f||a(function(){f||c()})}}var d,f;d=b.queue=[];b.waitUntilQuiet=function(b){f&&f();f=a(function(){f=null;b();c()})};return b}]).provider("$$animateQueue",["$animateProvider",function(a){function b(a){if(!a)return null;a=a.split(" ");var b=Object.create(null);s(a,function(a){b[a]=!0});return b}function c(a,c){if(a&&c){var d=b(c);return a.split(" ").some(function(a){return d[a]})}}function d(a,b,c){return e[a].some(function(a){return a(b,c)})}function f(a,b){var c=0<(a.addClass||"").length,d=0<(a.removeClass||
"").length;return b?c&&d:c||d}var e=this.rules={skip:[],cancel:[],join:[]};e.join.push(function(a,b){return!a.structural&&f(a)});e.skip.push(function(a,b){return!a.structural&&!f(a)});e.skip.push(function(a,b){return"leave"===b.event&&a.structural});e.skip.push(function(a,b){return b.structural&&2===b.state&&!a.structural});e.cancel.push(function(a,b){return b.structural&&a.structural});e.cancel.push(function(a,b){return 2===b.state&&a.structural});e.cancel.push(function(a,b){if(b.structural)return!1;
var d=a.addClass,f=a.removeClass,e=b.addClass,qa=b.removeClass;return N(d)&&N(f)||N(e)&&N(qa)?!1:c(d,qa)||c(f,e)});this.$get=["$$rAF","$rootScope","$rootElement","$document","$$Map","$$animation","$$AnimateRunner","$templateRequest","$$jqLite","$$forceReflow","$$isDocumentHidden",function(b,c,e,n,z,qa,J,u,H,k,O){function L(){var a=!1;return function(b){a?b():c.$$postDigest(function(){a=!0;b()})}}function A(a,b,c){var g=[],d=h[c];d&&s(d,function(d){w.call(d.node,b)?g.push(d.callback):"leave"===c&&
w.call(d.node,a)&&g.push(d.callback)});return g}function B(a,b,c){var g=ua(b);return a.filter(function(a){return!(a.node===g&&(!c||a.callback===c))})}function q(a,h,v){function q(a,c,g,d){G(function(){var a=A(ta,k,c);a.length?b(function(){s(a,function(a){a(e,g,d)});"close"!==g||k.parentNode||ra.off(k)}):"close"!==g||k.parentNode||ra.off(k)});a.progress(c,g,d)}function B(a){var b=e,c=m;c.preparationClasses&&(b.removeClass(c.preparationClasses),c.preparationClasses=null);c.activeClasses&&(b.removeClass(c.activeClasses),
c.activeClasses=null);D(e,m);ha(e,m);m.domOperation();t.complete(!a)}var m=Ca(v),e=Ga(a),k=Q(e),ta=k&&k.parentNode,m=na(m),t=new J,G=L();W(m.addClass)&&(m.addClass=m.addClass.join(" "));m.addClass&&!F(m.addClass)&&(m.addClass=null);W(m.removeClass)&&(m.removeClass=m.removeClass.join(" "));m.removeClass&&!F(m.removeClass)&&(m.removeClass=null);m.from&&!aa(m.from)&&(m.from=null);m.to&&!aa(m.to)&&(m.to=null);if(!k)return B(),t;v=[k.getAttribute("class"),m.addClass,m.removeClass].join(" ");if(!Xa(v))return B(),
t;var n=0<=["enter","move","leave"].indexOf(h),w=O(),u=!g||w||ga.get(k);v=!u&&x.get(k)||{};var H=!!v.state;u||H&&1===v.state||(u=!M(k,ta,h));if(u)return w&&q(t,h,"start"),B(),w&&q(t,h,"close"),t;n&&sa(k);w={structural:n,element:e,event:h,addClass:m.addClass,removeClass:m.removeClass,close:B,options:m,runner:t};if(H){if(d("skip",w,v)){if(2===v.state)return B(),t;U(e,v,w);return v.runner}if(d("cancel",w,v))if(2===v.state)v.runner.end();else if(v.structural)v.close();else return U(e,v,w),v.runner;else if(d("join",
w,v))if(2===v.state)U(e,w,{});else return Ta(e,n?h:null,m),h=w.event=v.event,m=U(e,v,w),v.runner}else U(e,w,{});(H=w.structural)||(H="animate"===w.event&&0<Object.keys(w.options.to||{}).length||f(w));if(!H)return B(),l(k),t;var z=(v.counter||0)+1;w.counter=z;I(k,1,w);c.$$postDigest(function(){e=Ga(a);var b=x.get(k),c=!b,b=b||{},g=0<(e.parent()||[]).length&&("animate"===b.event||b.structural||f(b));if(c||b.counter!==z||!g){c&&(D(e,m),ha(e,m));if(c||n&&b.event!==h)m.domOperation(),t.end();g||l(k)}else h=
!b.structural&&f(b,!0)?"setClass":b.event,I(k,2),b=qa(e,h,b.options),t.setHost(b),q(t,h,"start",{}),b.done(function(a){B(!a);(a=x.get(k))&&a.counter===z&&l(k);q(t,h,"close",{})})});return t}function sa(a){a=a.querySelectorAll("[data-ng-animate]");s(a,function(a){var b=parseInt(a.getAttribute("data-ng-animate"),10),c=x.get(a);if(c)switch(b){case 2:c.runner.end();case 1:x.delete(a)}})}function l(a){a.removeAttribute("data-ng-animate");x.delete(a)}function M(a,b,c){c=n[0].body;var g=Q(e),d=a===c||"HTML"===
a.nodeName,h=a===g,f=!1,k=ga.get(a),A;for((a=E.data(a,"$ngAnimatePin"))&&(b=Q(a));b;){h||(h=b===g);if(1!==b.nodeType)break;a=x.get(b)||{};if(!f){var q=ga.get(b);if(!0===q&&!1!==k){k=!0;break}else!1===q&&(k=!1);f=a.structural}if(N(A)||!0===A)a=E.data(b,"$$ngAnimateChildren"),ya(a)&&(A=a);if(f&&!1===A)break;d||(d=b===c);if(d&&h)break;if(!h&&(a=E.data(b,"$ngAnimatePin"))){b=Q(a);continue}b=b.parentNode}return(!f||A)&&!0!==k&&h&&d}function I(a,b,c){c=c||{};c.state=b;a.setAttribute("data-ng-animate",b);
c=(b=x.get(a))?va(b,c):c;x.set(a,c)}var x=new z,ga=new z,g=null,ta=c.$watch(function(){return 0===u.totalPendingRequests},function(a){a&&(ta(),c.$$postDigest(function(){c.$$postDigest(function(){null===g&&(g=!0)})}))}),h=Object.create(null),t=a.classNameFilter(),Xa=t?function(a){return t.test(a)}:function(){return!0},D=Y(H),w=R.Node.prototype.contains||function(a){return this===a||!!(this.compareDocumentPosition(a)&16)},ra={on:function(a,b,c){var g=ua(b);h[a]=h[a]||[];h[a].push({node:g,callback:c});
E(b).on("$destroy",function(){x.get(g)||ra.off(a,b,c)})},off:function(a,b,c){if(1!==arguments.length||F(arguments[0])){var g=h[a];g&&(h[a]=1===arguments.length?null:B(g,b,c))}else for(g in b=arguments[0],h)h[g]=B(h[g],b)},pin:function(a,b){Ea(da(a),"element","not an element");Ea(da(b),"parentElement","not an element");a.data("$ngAnimatePin",b)},push:function(a,b,c,g){c=c||{};c.domOperation=g;return q(a,b,c)},enabled:function(a,b){var c=arguments.length;if(0===c)b=!!g;else if(da(a)){var d=Q(a);1===
c?b=!ga.get(d):ga.set(d,!b)}else b=g=!!a;return b}};return ra}]}]).provider("$$animation",["$animateProvider",function(a){var b=this.drivers=[];this.$get=["$$jqLite","$rootScope","$injector","$$AnimateRunner","$$Map","$$rAFScheduler",function(a,d,f,e,p,K){function G(a){function b(a){if(a.processed)return a;a.processed=!0;var d=a.domNode,e=d.parentNode;f.set(d,a);for(var q;e;){if(q=f.get(e)){q.processed||(q=b(q));break}e=e.parentNode}(q||c).children.push(a);return a}var c={children:[]},d,f=new p;for(d=
0;d<a.length;d++){var e=a[d];f.set(e.domNode,a[d]={domNode:e.domNode,fn:e.fn,children:[]})}for(d=0;d<a.length;d++)b(a[d]);return function(a){var b=[],c=[],d;for(d=0;d<a.children.length;d++)c.push(a.children[d]);a=c.length;var f=0,e=[];for(d=0;d<c.length;d++){var k=c[d];0>=a&&(a=f,f=0,b.push(e),e=[]);e.push(k.fn);k.children.forEach(function(a){f++;c.push(a)});a--}e.length&&b.push(e);return b}(c)}var n=[],z=Y(a);return function(p,J,u){function H(a){a=a.hasAttribute("ng-animate-ref")?[a]:a.querySelectorAll("[ng-animate-ref]");
var b=[];s(a,function(a){var c=a.getAttribute("ng-animate-ref");c&&c.length&&b.push(a)});return b}function k(a){var b=[],c={};s(a,function(a,d){var h=Q(a.element),f=0<=["enter","move"].indexOf(a.event),h=a.structural?H(h):[];if(h.length){var e=f?"to":"from";s(h,function(a){var b=a.getAttribute("ng-animate-ref");c[b]=c[b]||{};c[b][e]={animationID:d,element:E(a)}})}else b.push(a)});var d={},f={};s(c,function(c,e){var k=c.from,A=c.to;if(k&&A){var q=a[k.animationID],x=a[A.animationID],l=k.animationID.toString();
if(!f[l]){var B=f[l]={structural:!0,beforeStart:function(){q.beforeStart();x.beforeStart()},close:function(){q.close();x.close()},classes:O(q.classes,x.classes),from:q,to:x,anchors:[]};B.classes.length?b.push(B):(b.push(q),b.push(x))}f[l].anchors.push({out:k.element,"in":A.element})}else k=k?k.animationID:A.animationID,A=k.toString(),d[A]||(d[A]=!0,b.push(a[k]))});return b}function O(a,b){a=a.split(" ");b=b.split(" ");for(var c=[],d=0;d<a.length;d++){var f=a[d];if("ng-"!==f.substring(0,3))for(var e=
0;e<b.length;e++)if(f===b[e]){c.push(f);break}}return c.join(" ")}function L(a){for(var c=b.length-1;0<=c;c--){var d=f.get(b[c])(a);if(d)return d}}function A(a,b){function c(a){(a=a.data("$$animationRunner"))&&a.setHost(b)}a.from&&a.to?(c(a.from.element),c(a.to.element)):c(a.element)}function B(){var a=p.data("$$animationRunner");!a||"leave"===J&&u.$$domOperationFired||a.end()}function q(b){p.off("$destroy",B);p.removeData("$$animationRunner");z(p,u);ha(p,u);u.domOperation();I&&a.removeClass(p,I);
p.removeClass("ng-animate");l.complete(!b)}u=na(u);var sa=0<=["enter","move","leave"].indexOf(J),l=new e({end:function(){q()},cancel:function(){q(!0)}});if(!b.length)return q(),l;p.data("$$animationRunner",l);var M=Fa(p.attr("class"),Fa(u.addClass,u.removeClass)),I=u.tempClasses;I&&(M+=" "+I,u.tempClasses=null);var x;sa&&(x="ng-"+J+"-prepare",a.addClass(p,x));n.push({element:p,classes:M,event:J,structural:sa,options:u,beforeStart:function(){p.addClass("ng-animate");I&&a.addClass(p,I);x&&(a.removeClass(p,
x),x=null)},close:q});p.on("$destroy",B);if(1<n.length)return l;d.$$postDigest(function(){var a=[];s(n,function(b){b.element.data("$$animationRunner")?a.push(b):b.close()});n.length=0;var b=k(a),c=[];s(b,function(a){c.push({domNode:Q(a.from?a.from.element:a.element),fn:function(){a.beforeStart();var b,c=a.close;if((a.anchors?a.from.element||a.to.element:a.element).data("$$animationRunner")){var d=L(a);d&&(b=d.start)}b?(b=b(),b.done(function(a){c(!a)}),A(a,b)):c()}})});K(G(c))});return l}}]}]).provider("$animateCss",
["$animateProvider",function(a){var b=La(),c=La();this.$get=["$window","$$jqLite","$$AnimateRunner","$timeout","$$forceReflow","$sniffer","$$rAFScheduler","$$animateQueue",function(a,f,e,p,K,G,n,z){function y(a,b){var c=a.parentNode;return(c.$$ngAnimateParentKey||(c.$$ngAnimateParentKey=++O))+"-"+a.getAttribute("class")+"-"+b}function J(e,k,q,p){var l;0<b.count(q)&&(l=c.get(q),l||(k=X(k,"-stagger"),f.addClass(e,k),l=Ja(a,e,p),l.animationDuration=Math.max(l.animationDuration,0),l.transitionDuration=
Math.max(l.transitionDuration,0),f.removeClass(e,k),c.put(q,l)));return l||{}}function u(a){L.push(a);n.waitUntilQuiet(function(){b.flush();c.flush();for(var a=K(),d=0;d<L.length;d++)L[d](a);L.length=0})}function H(c,f,e){f=b.get(e);f||(f=Ja(a,c,Va),"infinite"===f.animationIterationCount&&(f.animationIterationCount=1));b.put(e,f);c=f;e=c.animationDelay;f=c.transitionDelay;c.maxDelay=e&&f?Math.max(e,f):e||f;c.maxDuration=Math.max(c.animationDuration*c.animationIterationCount,c.transitionDuration);
return c}var k=Y(f),O=0,L=[];return function(a,c){function d(){l()}function n(){l(!0)}function l(b){if(!(w||E&&O)){w=!0;O=!1;g.$$skipPreparationClasses||f.removeClass(a,fa);f.removeClass(a,da);wa(h,!1);oa(h,!1);s(t,function(a){h.style[a[0]]=""});k(a,g);ha(a,g);Object.keys(L).length&&s(L,function(a,b){a?h.style.setProperty(b,a):h.style.removeProperty(b)});if(g.onDone)g.onDone();ea&&ea.length&&a.off(ea.join(" "),x);var c=a.data("$$animateCss");c&&(p.cancel(c[0].timer),a.removeData("$$animateCss"));
F&&F.complete(!b)}}function M(a){r.blockTransition&&oa(h,a);r.blockKeyframeAnimation&&wa(h,!!a)}function I(){F=new e({end:d,cancel:n});u(P);l();return{$$willAnimate:!1,start:function(){return F},end:d}}function x(a){a.stopPropagation();var b=a.originalEvent||a;a=b.$manualTimeStamp||Date.now();b=parseFloat(b.elapsedTime.toFixed(3));Math.max(a-Y,0)>=R&&b>=m&&(E=!0,l())}function ga(){function b(){if(!w){M(!1);s(t,function(a){h.style[a[0]]=a[1]});k(a,g);f.addClass(a,da);if(r.recalculateTimingStyles){ma=
h.getAttribute("class")+" "+fa;ja=y(h,ma);C=H(h,ma,ja);ba=C.maxDelay;N=Math.max(ba,0);m=C.maxDuration;if(0===m){l();return}r.hasTransitions=0<C.transitionDuration;r.hasAnimations=0<C.animationDuration}r.applyAnimationDelay&&(ba="boolean"!==typeof g.delay&&xa(g.delay)?parseFloat(g.delay):ba,N=Math.max(ba,0),C.animationDelay=ba,ca=[pa,ba+"s"],t.push(ca),h.style[ca[0]]=ca[1]);R=1E3*N;U=1E3*m;if(g.easing){var d,e=g.easing;r.hasTransitions&&(d=S+"TimingFunction",t.push([d,e]),h.style[d]=e);r.hasAnimations&&
(d=$+"TimingFunction",t.push([d,e]),h.style[d]=e)}C.transitionDuration&&ea.push(za);C.animationDuration&&ea.push(Aa);Y=Date.now();var n=R+1.5*U;d=Y+n;var e=a.data("$$animateCss")||[],q=!0;if(e.length){var I=e[0];(q=d>I.expectedEndTime)?p.cancel(I.timer):e.push(l)}q&&(n=p(c,n,!1),e[0]={timer:n,expectedEndTime:d},e.push(l),a.data("$$animateCss",e));if(ea.length)a.on(ea.join(" "),x);g.to&&(g.cleanupStyles&&Ma(L,h,Object.keys(g.to)),Ia(a,g))}}function c(){var b=a.data("$$animateCss");if(b){for(var d=
1;d<b.length;d++)b[d]();a.removeData("$$animateCss")}}if(!w)if(h.parentNode){var d=function(a){if(E)O&&a&&(O=!1,l());else if(O=!a,C.animationDuration)if(a=wa(h,O),O)t.push(a);else{var b=t,c=b.indexOf(a);0<=a&&b.splice(c,1)}},e=0<aa&&(C.transitionDuration&&0===V.transitionDuration||C.animationDuration&&0===V.animationDuration)&&Math.max(V.animationDelay,V.transitionDelay);e?p(b,Math.floor(e*aa*1E3),!1):b();v.resume=function(){d(!0)};v.pause=function(){d(!1)}}else l()}var g=c||{};g.$$prepared||(g=na(Ca(g)));
var L={},h=Q(a);if(!h||!h.parentNode||!z.enabled())return I();var t=[],K=a.attr("class"),D=Pa(g),w,O,E,F,v,N,R,m,U,Y,ea=[];if(0===g.duration||!G.animations&&!G.transitions)return I();var ia=g.event&&W(g.event)?g.event.join(" "):g.event,Z="",T="";ia&&g.structural?Z=X(ia,"ng-",!0):ia&&(Z=ia);g.addClass&&(T+=X(g.addClass,"-add"));g.removeClass&&(T.length&&(T+=" "),T+=X(g.removeClass,"-remove"));g.applyClassesEarly&&T.length&&k(a,g);var fa=[Z,T].join(" ").trim(),ma=K+" "+fa,da=X(fa,"-active"),K=D.to&&
0<Object.keys(D.to).length;if(!(0<(g.keyframeStyle||"").length||K||fa))return I();var ja,V;0<g.stagger?(D=parseFloat(g.stagger),V={transitionDelay:D,animationDelay:D,transitionDuration:0,animationDuration:0}):(ja=y(h,ma),V=J(h,fa,ja,Wa));g.$$skipPreparationClasses||f.addClass(a,fa);g.transitionStyle&&(D=[S,g.transitionStyle],ka(h,D),t.push(D));0<=g.duration&&(D=0<h.style[S].length,D=Ka(g.duration,D),ka(h,D),t.push(D));g.keyframeStyle&&(D=[$,g.keyframeStyle],ka(h,D),t.push(D));var aa=V?0<=g.staggerIndex?
g.staggerIndex:b.count(ja):0;(ia=0===aa)&&!g.skipBlocking&&oa(h,9999);var C=H(h,ma,ja),ba=C.maxDelay;N=Math.max(ba,0);m=C.maxDuration;var r={};r.hasTransitions=0<C.transitionDuration;r.hasAnimations=0<C.animationDuration;r.hasTransitionAll=r.hasTransitions&&"all"===C.transitionProperty;r.applyTransitionDuration=K&&(r.hasTransitions&&!r.hasTransitionAll||r.hasAnimations&&!r.hasTransitions);r.applyAnimationDuration=g.duration&&r.hasAnimations;r.applyTransitionDelay=xa(g.delay)&&(r.applyTransitionDuration||
r.hasTransitions);r.applyAnimationDelay=xa(g.delay)&&r.hasAnimations;r.recalculateTimingStyles=0<T.length;if(r.applyTransitionDuration||r.applyAnimationDuration)m=g.duration?parseFloat(g.duration):m,r.applyTransitionDuration&&(r.hasTransitions=!0,C.transitionDuration=m,D=0<h.style[S+"Property"].length,t.push(Ka(m,D))),r.applyAnimationDuration&&(r.hasAnimations=!0,C.animationDuration=m,t.push([Ba,m+"s"]));if(0===m&&!r.recalculateTimingStyles)return I();if(null!=g.delay){var ca;"boolean"!==typeof g.delay&&
(ca=parseFloat(g.delay),N=Math.max(ca,0));r.applyTransitionDelay&&t.push([la,ca+"s"]);r.applyAnimationDelay&&t.push([pa,ca+"s"])}null==g.duration&&0<C.transitionDuration&&(r.recalculateTimingStyles=r.recalculateTimingStyles||ia);R=1E3*N;U=1E3*m;g.skipBlocking||(r.blockTransition=0<C.transitionDuration,r.blockKeyframeAnimation=0<C.animationDuration&&0<V.animationDelay&&0===V.animationDuration);g.from&&(g.cleanupStyles&&Ma(L,h,Object.keys(g.from)),Ha(a,g));r.blockTransition||r.blockKeyframeAnimation?
M(m):g.skipBlocking||oa(h,!1);return{$$willAnimate:!0,end:d,start:function(){if(!w)return v={end:d,cancel:n,resume:null,pause:null},F=new e(v),u(ga),F}}}}]}]).provider("$$animateCssDriver",["$$animationProvider",function(a){a.drivers.push("$$animateCssDriver");this.$get=["$animateCss","$rootScope","$$AnimateRunner","$rootElement","$sniffer","$$jqLite","$document",function(a,c,d,f,e,p,K){function G(a){return a.replace(/\bng-\S+\b/g,"")}function n(a,b){F(a)&&(a=a.split(" "));F(b)&&(b=b.split(" "));
return a.filter(function(a){return-1===b.indexOf(a)}).join(" ")}function z(c,e,f){function p(a){var b={},c=Q(a).getBoundingClientRect();s(["width","height","top","left"],function(a){var d=c[a];switch(a){case "top":d+=u.scrollTop;break;case "left":d+=u.scrollLeft}b[a]=Math.floor(d)+"px"});return b}function K(){var c=G(f.attr("class")||""),d=n(c,l),c=n(l,c),d=a(z,{to:p(f),addClass:"ng-anchor-in "+d,removeClass:"ng-anchor-out "+c,delay:!0});return d.$$willAnimate?d:null}function q(){z.remove();e.removeClass("ng-animate-shim");
f.removeClass("ng-animate-shim")}var z=E(Q(e).cloneNode(!0)),l=G(z.attr("class")||"");e.addClass("ng-animate-shim");f.addClass("ng-animate-shim");z.addClass("ng-anchor");H.append(z);var M;c=function(){var c=a(z,{addClass:"ng-anchor-out",delay:!0,from:p(e)});return c.$$willAnimate?c:null}();if(!c&&(M=K(),!M))return q();var I=c||M;return{start:function(){function a(){c&&c.end()}var b,c=I.start();c.done(function(){c=null;if(!M&&(M=K()))return c=M.start(),c.done(function(){c=null;q();b.complete()}),c;
q();b.complete()});return b=new d({end:a,cancel:a})}}}function y(a,b,c,e){var f=J(a,P),p=J(b,P),n=[];s(e,function(a){(a=z(c,a.out,a["in"]))&&n.push(a)});if(f||p||0!==n.length)return{start:function(){function a(){s(b,function(a){a.end()})}var b=[];f&&b.push(f.start());p&&b.push(p.start());s(n,function(a){b.push(a.start())});var c=new d({end:a,cancel:a});d.all(b,function(a){c.complete(a)});return c}}}function J(c){var d=c.element,e=c.options||{};c.structural&&(e.event=c.event,e.structural=!0,e.applyClassesEarly=
!0,"leave"===c.event&&(e.onDone=e.domOperation));e.preparationClasses&&(e.event=Z(e.event,e.preparationClasses));c=a(d,e);return c.$$willAnimate?c:null}if(!e.animations&&!e.transitions)return P;var u=K[0].body;c=Q(f);var H=E(c.parentNode&&11===c.parentNode.nodeType||u.contains(c)?c:u);return function(a){return a.from&&a.to?y(a.from,a.to,a.classes,a.anchors):J(a)}}]}]).provider("$$animateJs",["$animateProvider",function(a){this.$get=["$injector","$$AnimateRunner","$$jqLite",function(b,c,d){function f(c){c=
W(c)?c:c.split(" ");for(var d=[],e={},f=0;f<c.length;f++){var s=c[f],y=a.$$registeredAnimations[s];y&&!e[s]&&(d.push(b.get(y)),e[s]=!0)}return d}var e=Y(d);return function(a,b,d,n){function z(){n.domOperation();e(a,n)}function y(a,b,d,e,f){switch(d){case "animate":b=[b,e.from,e.to,f];break;case "setClass":b=[b,k,F,f];break;case "addClass":b=[b,k,f];break;case "removeClass":b=[b,F,f];break;default:b=[b,f]}b.push(e);if(a=a.apply(a,b))if(Da(a.start)&&(a=a.start()),a instanceof c)a.done(f);else if(Da(a))return a;
return P}function J(a,b,d,e,f){var k=[];s(e,function(e){var l=e[f];l&&k.push(function(){var e,f,g=!1,h=function(a){g||(g=!0,(f||P)(a),e.complete(!a))};e=new c({end:function(){h()},cancel:function(){h(!0)}});f=y(l,a,b,d,function(a){h(!1===a)});return e})});return k}function u(a,b,d,e,f){var k=J(a,b,d,e,f);if(0===k.length){var h,l;"beforeSetClass"===f?(h=J(a,"removeClass",d,e,"beforeRemoveClass"),l=J(a,"addClass",d,e,"beforeAddClass")):"setClass"===f&&(h=J(a,"removeClass",d,e,"removeClass"),l=J(a,"addClass",
d,e,"addClass"));h&&(k=k.concat(h));l&&(k=k.concat(l))}if(0!==k.length)return function(a){var b=[];k.length&&s(k,function(a){b.push(a())});b.length?c.all(b,a):a();return function(a){s(b,function(b){a?b.cancel():b.end()})}}}var H=!1;3===arguments.length&&aa(d)&&(n=d,d=null);n=na(n);d||(d=a.attr("class")||"",n.addClass&&(d+=" "+n.addClass),n.removeClass&&(d+=" "+n.removeClass));var k=n.addClass,F=n.removeClass,L=f(d),A,B;if(L.length){var q,E;"leave"===b?(E="leave",q="afterLeave"):(E="before"+b.charAt(0).toUpperCase()+
b.substr(1),q=b);"enter"!==b&&"move"!==b&&(A=u(a,b,n,L,E));B=u(a,b,n,L,q)}if(A||B){var l;return{$$willAnimate:!0,end:function(){l?l.end():(H=!0,z(),ha(a,n),l=new c,l.complete(!0));return l},start:function(){function b(c){H=!0;z();ha(a,n);l.complete(c)}if(l)return l;l=new c;var d,e=[];A&&e.push(function(a){d=A(a)});e.length?e.push(function(a){z();a(!0)}):z();B&&e.push(function(a){d=B(a)});l.setHost({end:function(){H||((d||P)(void 0),b(void 0))},cancel:function(){H||((d||P)(!0),b(!0))}});c.chain(e,
b);return l}}}}}]}]).provider("$$animateJsDriver",["$$animationProvider",function(a){a.drivers.push("$$animateJsDriver");this.$get=["$$animateJs","$$AnimateRunner",function(a,c){function d(c){return a(c.element,c.event,c.classes,c.options)}return function(a){if(a.from&&a.to){var b=d(a.from),p=d(a.to);if(b||p)return{start:function(){function a(){return function(){s(d,function(a){a.end()})}}var d=[];b&&d.push(b.start());p&&d.push(p.start());c.all(d,function(a){f.complete(a)});var f=new c({end:a(),cancel:a()});
return f}}}else return d(a)}}]}])})(window,window.angular);
//# sourceMappingURL=angular-animate.min.js.map


/***/ }),
/* 107 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* angular-svg-round-progressbar@0.4.4 2016-05-06 */
!function(){for(var a=0,b=["webkit","moz"],c=0;c<b.length&&!window.requestAnimationFrame;++c)window.requestAnimationFrame=window[b[c]+"RequestAnimationFrame"],window.cancelAnimationFrame=window[b[c]+"CancelAnimationFrame"]||window[b[c]+"CancelRequestAnimationFrame"];window.requestAnimationFrame||(window.requestAnimationFrame=function(b){var c=(new Date).getTime(),d=Math.max(0,16-(c-a)),e=window.setTimeout(function(){b(c+d)},d);return a=c+d,e}),window.cancelAnimationFrame||(window.cancelAnimationFrame=function(a){window.clearTimeout(a)})}(),angular.module("angular-svg-round-progressbar",[]),angular.module("angular-svg-round-progressbar").constant("roundProgressConfig",{max:50,semi:!1,rounded:!1,responsive:!1,clockwise:!0,radius:100,color:"#45ccce",bgcolor:"#eaeaea",stroke:15,duration:800,animation:"easeOutCubic",animationDelay:0,offset:0}),angular.module("angular-svg-round-progressbar").service("roundProgressService",["$window",function(a){function b(a,b,c,d){var e=(d-90)*Math.PI/180,f=a+c*Math.cos(e),g=b+c*Math.sin(e);return f+" "+g}var c={},d=angular.isNumber,e=document.head.querySelector("base");return c.isSupported=!(!document.createElementNS||!document.createElementNS("http://www.w3.org/2000/svg","svg").createSVGRect),c.resolveColor=e&&e.href?function(a){var b=a.indexOf("#");return b>-1&&a.indexOf("url")>-1?a.slice(0,b)+window.location.href+a.slice(b):a}:function(a){return a},c.toNumber=function(a){return d(a)?a:parseFloat((a+"").replace(",","."))},c.getOffset=function(a,b){var c=+b.offset||0;if("inherit"===b.offset)for(var d=a.$parent;d;){if(d.hasOwnProperty("$$getRoundProgressOptions")){var e=d.$$getRoundProgressOptions();c+=(+e.offset||0)+(+e.stroke||0)}d=d.$parent}return c},c.getTimestamp=a.performance&&a.performance.now&&angular.isNumber(a.performance.now())?function(){return a.performance.now()}:function(){return(new a.Date).getTime()},c.updateState=function(a,c,d,e,f,g){if(!f)return e;var h=a>0?Math.min(a,c):0,i=g?180:359.9999,j=0===c?0:h/c*i,k=b(f,f,d,j),l=b(f,f,d,0),m=180>=j?0:1,n="M "+k+" A "+d+" "+d+" 0 "+m+" 0 "+l;return e.attr("d",n)},c.animations={linearEase:function(a,b,c,d){return c*a/d+b},easeInQuad:function(a,b,c,d){return c*(a/=d)*a+b},easeOutQuad:function(a,b,c,d){return-c*(a/=d)*(a-2)+b},easeInOutQuad:function(a,b,c,d){return(a/=d/2)<1?c/2*a*a+b:-c/2*(--a*(a-2)-1)+b},easeInCubic:function(a,b,c,d){return c*(a/=d)*a*a+b},easeOutCubic:function(a,b,c,d){return c*((a=a/d-1)*a*a+1)+b},easeInOutCubic:function(a,b,c,d){return(a/=d/2)<1?c/2*a*a*a+b:c/2*((a-=2)*a*a+2)+b},easeInQuart:function(a,b,c,d){return c*(a/=d)*a*a*a+b},easeOutQuart:function(a,b,c,d){return-c*((a=a/d-1)*a*a*a-1)+b},easeInOutQuart:function(a,b,c,d){return(a/=d/2)<1?c/2*a*a*a*a+b:-c/2*((a-=2)*a*a*a-2)+b},easeInQuint:function(a,b,c,d){return c*(a/=d)*a*a*a*a+b},easeOutQuint:function(a,b,c,d){return c*((a=a/d-1)*a*a*a*a+1)+b},easeInOutQuint:function(a,b,c,d){return(a/=d/2)<1?c/2*a*a*a*a*a+b:c/2*((a-=2)*a*a*a*a+2)+b},easeInSine:function(a,b,c,d){return-c*Math.cos(a/d*(Math.PI/2))+c+b},easeOutSine:function(a,b,c,d){return c*Math.sin(a/d*(Math.PI/2))+b},easeInOutSine:function(a,b,c,d){return-c/2*(Math.cos(Math.PI*a/d)-1)+b},easeInExpo:function(a,b,c,d){return 0==a?b:c*Math.pow(2,10*(a/d-1))+b},easeOutExpo:function(a,b,c,d){return a==d?b+c:c*(-Math.pow(2,-10*a/d)+1)+b},easeInOutExpo:function(a,b,c,d){return 0==a?b:a==d?b+c:(a/=d/2)<1?c/2*Math.pow(2,10*(a-1))+b:c/2*(-Math.pow(2,-10*--a)+2)+b},easeInCirc:function(a,b,c,d){return-c*(Math.sqrt(1-(a/=d)*a)-1)+b},easeOutCirc:function(a,b,c,d){return c*Math.sqrt(1-(a=a/d-1)*a)+b},easeInOutCirc:function(a,b,c,d){return(a/=d/2)<1?-c/2*(Math.sqrt(1-a*a)-1)+b:c/2*(Math.sqrt(1-(a-=2)*a)+1)+b},easeInElastic:function(a,b,c,d){var e=1.70158,f=0,g=c;return 0==a?b:1==(a/=d)?b+c:(f||(f=.3*d),g<Math.abs(c)?(g=c,e=f/4):e=f/(2*Math.PI)*Math.asin(c/g),-(g*Math.pow(2,10*(a-=1))*Math.sin((a*d-e)*(2*Math.PI)/f))+b)},easeOutElastic:function(a,b,c,d){var e=1.70158,f=0,g=c;return 0==a?b:1==(a/=d)?b+c:(f||(f=.3*d),g<Math.abs(c)?(g=c,e=f/4):e=f/(2*Math.PI)*Math.asin(c/g),g*Math.pow(2,-10*a)*Math.sin((a*d-e)*(2*Math.PI)/f)+c+b)},easeInOutElastic:function(a,b,c,d){var e=1.70158,f=0,g=c;return 0==a?b:2==(a/=d/2)?b+c:(f||(f=d*(.3*1.5)),g<Math.abs(c)?(g=c,e=f/4):e=f/(2*Math.PI)*Math.asin(c/g),1>a?-.5*(g*Math.pow(2,10*(a-=1))*Math.sin((a*d-e)*(2*Math.PI)/f))+b:g*Math.pow(2,-10*(a-=1))*Math.sin((a*d-e)*(2*Math.PI)/f)*.5+c+b)},easeInBack:function(a,b,c,d,e){return void 0==e&&(e=1.70158),c*(a/=d)*a*((e+1)*a-e)+b},easeOutBack:function(a,b,c,d,e){return void 0==e&&(e=1.70158),c*((a=a/d-1)*a*((e+1)*a+e)+1)+b},easeInOutBack:function(a,b,c,d,e){return void 0==e&&(e=1.70158),(a/=d/2)<1?c/2*(a*a*(((e*=1.525)+1)*a-e))+b:c/2*((a-=2)*a*(((e*=1.525)+1)*a+e)+2)+b},easeInBounce:function(a,b,d,e){return d-c.animations.easeOutBounce(e-a,0,d,e)+b},easeOutBounce:function(a,b,c,d){return(a/=d)<1/2.75?c*(7.5625*a*a)+b:2/2.75>a?c*(7.5625*(a-=1.5/2.75)*a+.75)+b:2.5/2.75>a?c*(7.5625*(a-=2.25/2.75)*a+.9375)+b:c*(7.5625*(a-=2.625/2.75)*a+.984375)+b},easeInOutBounce:function(a,b,d,e){return e/2>a?.5*c.animations.easeInBounce(2*a,0,d,e)+b:.5*c.animations.easeOutBounce(2*a-e,0,d,e)+.5*d+b}},c}]),angular.module("angular-svg-round-progressbar").directive("roundProgress",["$window","roundProgressService","roundProgressConfig",function(a,b,c){var d={restrict:"EA",replace:!0,transclude:!0,scope:{current:"=",max:"=",semi:"=",rounded:"=",clockwise:"=",responsive:"=",onRender:"=",radius:"@",color:"@",bgcolor:"@",stroke:"@",duration:"@",animation:"@",offset:"@",animationDelay:"@"}};return b.isSupported?angular.extend(d,{link:function(e,f){var g,h,i=!f.hasClass("round-progress-wrapper"),j=i?f:f.find("svg").eq(0),k=j.find("path").eq(0),l=j.find("circle").eq(0),m=angular.copy(c),n=0;e.$$getRoundProgressOptions=function(){return m};var o=function(){var a=m.semi,c=m.responsive,d=+m.radius||0,g=+m.stroke,h=2*d,n=d-g/2-b.getOffset(e,m);j.css({top:0,left:0,position:c?"absolute":"static",width:c?"100%":h+"px",height:c?"100%":(a?d:h)+"px",overflow:"hidden"}),i||j[0].setAttribute("viewBox","0 0 "+h+" "+(a?d:h)),f.css({width:c?"100%":"auto",position:"relative",paddingBottom:c?a?"50%":"100%":0}),k.css({stroke:b.resolveColor(m.color),strokeWidth:g,strokeLinecap:m.rounded?"round":"butt"}),a?k.attr("transform",m.clockwise?"translate(0, "+h+") rotate(-90)":"translate("+h+", "+h+") rotate(90) scale(-1, 1)"):k.attr("transform",m.clockwise?"":"scale(-1, 1) translate("+-h+" 0)"),l.attr({cx:d,cy:d,r:n>=0?n:0}).css({stroke:b.resolveColor(m.bgcolor),strokeWidth:g})},p=function(c,d,h){var i=b.toNumber(m.max||0),l=c>0?a.Math.min(c,i):0,o=d===l||0>d?0:d||0,p=l-o,q=b.animations[m.animation],r=+m.duration||0,s=h||c>i&&d>i||0>c&&0>d||25>r,t=b.toNumber(m.radius),u=t-m.stroke/2-b.getOffset(e,m),v=m.semi;j.attr({"aria-valuemax":i,"aria-valuenow":l});var w=function(){if(s)b.updateState(l,i,u,k,t,v),m.onRender&&m.onRender(l,m,f);else{var c=b.getTimestamp(),d=++n;a.requestAnimationFrame(function e(){var g=a.Math.min(b.getTimestamp()-c,r),h=q(g,o,p,r);b.updateState(h,i,u,k,t,v),m.onRender&&m.onRender(h,m,f),d===n&&r>g&&a.requestAnimationFrame(e)})}};m.animationDelay>0?(a.clearTimeout(g),a.setTimeout(w,m.animationDelay)):w()},q=Object.keys(d.scope).filter(function(a){return"current"!==a});e.$watchGroup(q,function(a){for(var b=0;b<a.length;b++)"undefined"!=typeof a[b]&&(m[q[b]]=a[b]);o(),e.$broadcast("$parentOffsetChanged"),"inherit"!==m.offset||h?"inherit"!==m.offset&&h&&h():h=e.$on("$parentOffsetChanged",function(){p(e.current,e.current,!0),o()})}),e.$watchGroup(["current","max","radius","stroke","semi","offset"],function(a,c){p(b.toNumber(a[0]),b.toNumber(c[0]))})},template:function(a){for(var b=a.parent(),c="round-progress",d=['<svg class="'+c+'" xmlns="http://www.w3.org/2000/svg" role="progressbar" aria-valuemin="0">','<circle fill="none"/>','<path fill="none"/>',"<g ng-transclude></g>","</svg>"];b.length&&b[0].nodeName.toLowerCase()!==c&&"undefined"==typeof b.attr(c);)b=b.parent();return b&&b.length||(d.unshift('<div class="round-progress-wrapper">'),d.push("</div>")),d.join("\n")}}):angular.extend(d,{template:'<div class="round-progress" ng-transclude></div>'})}]);

/***/ }),
/* 108 */
/***/ (function(module, exports) {

/**
 * Bunch of useful filters for angularJS(with no external dependencies!)
 * @version v0.5.16 - 2017-04-07 * @link https://github.com/a8m/angular-filter
 * @author Ariel Mashraki <ariel@mashraki.co.il>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */!function(a,b,c){"use strict";function d(a){return E(a)?a:Object.keys(a).map(function(b){return a[b]})}function e(a){return null===a}function f(a,b){var d=Object.keys(a);return d.map(function(d){return b[d]!==c&&b[d]==a[d]}).indexOf(!1)==-1}function g(a,b){function c(a,b,c){for(var d=0;b+d<=a.length;){if(a.charAt(b+d)==c)return d;d++}return-1}for(var d=0,e=0;e<=b.length;e++){var f=c(a,d,b.charAt(e));if(f==-1)return!1;d+=f+1}return!0}function h(a,b,c){var d=0;return a.filter(function(a){var e=y(c)?d<b&&c(a):d<b;return d=e?d+1:d,e})}function i(a,b){return Math.round(a*Math.pow(10,b))/Math.pow(10,b)}function j(a,b,c){b=b||[];var d=Object.keys(a);return d.forEach(function(d){if(D(a[d])&&!E(a[d])){var e=c?c+"."+d:c;j(a[d],b,e||d)}else{var f=c?c+"."+d:d;b.push(f)}}),b}function k(a){return a&&a.$evalAsync&&a.$watch}function l(){return function(a,b){return a>b}}function m(){return function(a,b){return a>=b}}function n(){return function(a,b){return a<b}}function o(){return function(a,b){return a<=b}}function p(){return function(a,b){return a==b}}function q(){return function(a,b){return a!=b}}function r(){return function(a,b){return a===b}}function s(){return function(a,b){return a!==b}}function t(a){return function(b,c){return b=D(b)?d(b):b,!(!E(b)||z(c))&&b.some(function(b){return B(c)&&D(b)||A(c)?a(c)(b):b===c})}}function u(a,b){return b=b||0,b>=a.length?a:E(a[b])?u(a.slice(0,b).concat(a[b],a.slice(b+1)),b):u(a,b+1)}function v(a){return function(b,c){function e(a,b){return!z(b)&&a.some(function(a){return I(a,b)})}if(b=D(b)?d(b):b,!E(b))return b;var f=[],g=a(c);return z(c)?b.filter(function(a,b,c){return c.indexOf(a)===b}):b.filter(function(a){var b=g(a);return!e(f,b)&&(f.push(b),!0)})}}function w(a,b,c){return b?a+c+w(a,--b,c):a}function x(){return function(a){return B(a)?a.split(" ").map(function(a){return a.charAt(0).toUpperCase()+a.substring(1)}).join(" "):a}}var y=b.isDefined,z=b.isUndefined,A=b.isFunction,B=b.isString,C=b.isNumber,D=b.isObject,E=b.isArray,F=b.forEach,G=b.extend,H=b.copy,I=b.equals;String.prototype.contains||(String.prototype.contains=function(){return String.prototype.indexOf.apply(this,arguments)!==-1}),b.module("a8m.angular",[]).filter("isUndefined",function(){return function(a){return b.isUndefined(a)}}).filter("isDefined",function(){return function(a){return b.isDefined(a)}}).filter("isFunction",function(){return function(a){return b.isFunction(a)}}).filter("isString",function(){return function(a){return b.isString(a)}}).filter("isNumber",function(){return function(a){return b.isNumber(a)}}).filter("isArray",function(){return function(a){return b.isArray(a)}}).filter("isObject",function(){return function(a){return b.isObject(a)}}).filter("isEqual",function(){return function(a,c){return b.equals(a,c)}}),b.module("a8m.conditions",[]).filter({isGreaterThan:l,">":l,isGreaterThanOrEqualTo:m,">=":m,isLessThan:n,"<":n,isLessThanOrEqualTo:o,"<=":o,isEqualTo:p,"==":p,isNotEqualTo:q,"!=":q,isIdenticalTo:r,"===":r,isNotIdenticalTo:s,"!==":s}),b.module("a8m.is-null",[]).filter("isNull",function(){return function(a){return e(a)}}),b.module("a8m.after-where",[]).filter("afterWhere",function(){return function(a,b){if(a=D(a)?d(a):a,!E(a)||z(b))return a;var c=a.map(function(a){return f(b,a)}).indexOf(!0);return a.slice(c===-1?0:c)}}),b.module("a8m.after",[]).filter("after",function(){return function(a,b){return a=D(a)?d(a):a,E(a)?a.slice(b):a}}),b.module("a8m.before-where",[]).filter("beforeWhere",function(){return function(a,b){if(a=D(a)?d(a):a,!E(a)||z(b))return a;var c=a.map(function(a){return f(b,a)}).indexOf(!0);return a.slice(0,c===-1?a.length:++c)}}),b.module("a8m.before",[]).filter("before",function(){return function(a,b){return a=D(a)?d(a):a,E(a)?a.slice(0,b?--b:b):a}}),b.module("a8m.chunk-by",["a8m.filter-watcher"]).filter("chunkBy",["filterWatcher",function(a){return function(b,c,d){function e(a,b){for(var c=[];a--;)c[a]=b;return c}function f(a,b,c){return E(a)?a.map(function(a,d,f){return d*=b,a=f.slice(d,d+b),!z(c)&&a.length<b?a.concat(e(b-a.length,c)):a}).slice(0,Math.ceil(a.length/b)):a}return a.isMemoized("chunkBy",arguments)||a.memoize("chunkBy",arguments,this,f(b,c,d))}}]),b.module("a8m.concat",[]).filter("concat",[function(){return function(a,b){if(z(b))return a;if(E(a))return D(b)?a.concat(d(b)):a.concat(b);if(D(a)){var c=d(a);return D(b)?c.concat(d(b)):c.concat(b)}return a}}]),b.module("a8m.contains",[]).filter({contains:["$parse",t],some:["$parse",t]}),b.module("a8m.count-by",[]).filter("countBy",["$parse",function(a){return function(b,c){var e,f={},g=a(c);return b=D(b)?d(b):b,!E(b)||z(c)?b:(b.forEach(function(a){e=g(a),f[e]||(f[e]=0),f[e]++}),f)}}]),b.module("a8m.defaults",[]).filter("defaults",["$parse",function(a){return function(b,c){if(b=D(b)?d(b):b,!E(b)||!D(c))return b;var e=j(c);return b.forEach(function(b){e.forEach(function(d){var e=a(d),f=e.assign;z(e(b))&&f(b,e(c))})}),b}}]),b.module("a8m.every",[]).filter("every",["$parse",function(a){return function(b,c){return b=D(b)?d(b):b,!(E(b)&&!z(c))||b.every(function(b){return D(b)||A(c)?a(c)(b):b===c})}}]),b.module("a8m.filter-by",[]).filter("filterBy",["$parse",function(a){return function(b,e,f,g){var h;return f=B(f)||C(f)?String(f).toLowerCase():c,b=D(b)?d(b):b,!E(b)||z(f)?b:b.filter(function(b){return e.some(function(c){if(~c.indexOf("+")){var d=c.replace(/\s+/g,"").split("+");h=d.map(function(c){return a(c)(b)}).join(" ")}else h=a(c)(b);return!(!B(h)&&!C(h))&&(h=String(h).toLowerCase(),g?h===f:h.contains(f))})})}}]),b.module("a8m.first",[]).filter("first",["$parse",function(a){return function(b){var e,f,g;return b=D(b)?d(b):b,E(b)?(g=Array.prototype.slice.call(arguments,1),e=C(g[0])?g[0]:1,f=C(g[0])?C(g[1])?c:g[1]:g[0],g.length?h(b,e,f?a(f):f):b[0]):b}}]),b.module("a8m.flatten",[]).filter("flatten",function(){return function(a,b){return b=b||!1,a=D(a)?d(a):a,E(a)?b?[].concat.apply([],a):u(a,0):a}}),b.module("a8m.fuzzy-by",[]).filter("fuzzyBy",["$parse",function(a){return function(b,c,e,f){var h,i,j=f||!1;return b=D(b)?d(b):b,!E(b)||z(c)||z(e)?b:(i=a(c),b.filter(function(a){return h=i(a),!!B(h)&&(h=j?h:h.toLowerCase(),e=j?e:e.toLowerCase(),g(h,e)!==!1)}))}}]),b.module("a8m.fuzzy",[]).filter("fuzzy",function(){return function(a,b,c){function e(a,b){var c,d,e=Object.keys(a);return 0<e.filter(function(e){return c=a[e],!!d||!!B(c)&&(c=f?c:c.toLowerCase(),d=g(c,b)!==!1)}).length}var f=c||!1;return a=D(a)?d(a):a,!E(a)||z(b)?a:(b=f?b:b.toLowerCase(),a.filter(function(a){return B(a)?(a=f?a:a.toLowerCase(),g(a,b)!==!1):!!D(a)&&e(a,b)}))}}),b.module("a8m.group-by",["a8m.filter-watcher"]).filter("groupBy",["$parse","filterWatcher",function(a,b){return function(c,d){function e(a,b){var c,d={};return F(a,function(a){c=b(a),d[c]||(d[c]=[]),d[c].push(a)}),d}return!D(c)||z(d)?c:b.isMemoized("groupBy",arguments)||b.memoize("groupBy",arguments,this,e(c,a(d)))}}]),b.module("a8m.is-empty",[]).filter("isEmpty",function(){return function(a){return D(a)?!d(a).length:!a.length}}),b.module("a8m.join",[]).filter("join",function(){return function(a,b){return z(a)||!E(a)?a:(z(b)&&(b=" "),a.join(b))}}),b.module("a8m.last",[]).filter("last",["$parse",function(a){return function(b){var e,f,g,i=H(b);return i=D(i)?d(i):i,E(i)?(g=Array.prototype.slice.call(arguments,1),e=C(g[0])?g[0]:1,f=C(g[0])?C(g[1])?c:g[1]:g[0],g.length?h(i.reverse(),e,f?a(f):f).reverse():i[i.length-1]):i}}]),b.module("a8m.map",[]).filter("map",["$parse",function(a){return function(b,c){return b=D(b)?d(b):b,!E(b)||z(c)?b:b.map(function(b){return a(c)(b)})}}]),b.module("a8m.omit",[]).filter("omit",["$parse",function(a){return function(b,c){return b=D(b)?d(b):b,!E(b)||z(c)?b:b.filter(function(b){return!a(c)(b)})}}]),b.module("a8m.pick",[]).filter("pick",["$parse",function(a){return function(b,c){return b=D(b)?d(b):b,!E(b)||z(c)?b:b.filter(function(b){return a(c)(b)})}}]),b.module("a8m.range",[]).filter("range",function(){return function(a,b,c,d,e){c=c||0,d=d||1;for(var f=0;f<parseInt(b);f++){var g=c+f*d;a.push(A(e)?e(g):g)}return a}}),b.module("a8m.remove-with",[]).filter("removeWith",function(){return function(a,b){return z(b)?a:(a=D(a)?d(a):a,a.filter(function(a){return!f(b,a)}))}}),b.module("a8m.remove",[]).filter("remove",function(){return function(a){a=D(a)?d(a):a;var b=Array.prototype.slice.call(arguments,1);return E(a)?a.filter(function(a){return!b.some(function(b){return I(b,a)})}):a}}),b.module("a8m.reverse",[]).filter("reverse",[function(){return function(a){return a=D(a)?d(a):a,B(a)?a.split("").reverse().join(""):E(a)?a.slice().reverse():a}}]),b.module("a8m.search-field",[]).filter("searchField",["$parse",function(a){return function(b){var c,e;b=D(b)?d(b):b;var f=Array.prototype.slice.call(arguments,1);return E(b)&&f.length?b.map(function(b){return e=f.map(function(d){return(c=a(d))(b)}).join(" "),G(b,{searchField:e})}):b}}]),b.module("a8m.to-array",[]).filter("toArray",function(){return function(a,b){return D(a)?b?Object.keys(a).map(function(b){return G(a[b],{$key:b})}):d(a):a}}),b.module("a8m.unique",[]).filter({unique:["$parse",v],uniq:["$parse",v]}),b.module("a8m.where",[]).filter("where",function(){return function(a,b){return z(b)?a:(a=D(a)?d(a):a,a.filter(function(a){return f(b,a)}))}}),b.module("a8m.xor",[]).filter("xor",["$parse",function(a){return function(b,c,e){function f(b,c){var d=a(e);return c.some(function(a){return e?I(d(a),d(b)):I(a,b)})}return e=e||!1,b=D(b)?d(b):b,c=D(c)?d(c):c,E(b)&&E(c)?b.concat(c).filter(function(a){return!(f(a,b)&&f(a,c))}):b}}]),b.module("a8m.math.abs",[]).filter("abs",function(){return function(a){return Math.abs(a)}}),b.module("a8m.math.byteFmt",[]).filter("byteFmt",function(){var a=[{str:"B",val:1024}];return["KB","MB","GB","TB","PB","EB","ZB","YB"].forEach(function(b,c){a.push({str:b,val:1024*a[c].val})}),function(b,c){if(C(c)&&isFinite(c)&&c%1===0&&c>=0&&C(b)&&isFinite(b)){for(var d=0;d<a.length-1&&b>=a[d].val;)d++;return b/=d>0?a[d-1].val:1,i(b,c)+" "+a[d].str}return"NaN"}}),b.module("a8m.math.degrees",[]).filter("degrees",function(){return function(a,b){if(C(b)&&isFinite(b)&&b%1===0&&b>=0&&C(a)&&isFinite(a)){var c=180*a/Math.PI;return Math.round(c*Math.pow(10,b))/Math.pow(10,b)}return"NaN"}}),b.module("a8m.math.kbFmt",[]).filter("kbFmt",function(){var a=[{str:"KB",val:1024}];return["MB","GB","TB","PB","EB","ZB","YB"].forEach(function(b,c){a.push({str:b,val:1024*a[c].val})}),function(b,c){if(C(c)&&isFinite(c)&&c%1===0&&c>=0&&C(b)&&isFinite(b)){for(var d=0;d<a.length-1&&b>=a[d].val;)d++;return b/=d>0?a[d-1].val:1,i(b,c)+" "+a[d].str}return"NaN"}}),b.module("a8m.math.max",[]).filter("max",["$parse",function(a){function b(b,c){var d=b.map(function(b){return a(c)(b)});return d.indexOf(Math.max.apply(Math,d))}return function(a,c){return E(a)?z(c)?Math.max.apply(Math,a):a[b(a,c)]:a}}]),b.module("a8m.math.min",[]).filter("min",["$parse",function(a){function b(b,c){var d=b.map(function(b){return a(c)(b)});return d.indexOf(Math.min.apply(Math,d))}return function(a,c){return E(a)?z(c)?Math.min.apply(Math,a):a[b(a,c)]:a}}]),b.module("a8m.math.percent",[]).filter("percent",function(){return function(a,b,c){var d=B(a)?Number(a):a;return b=b||100,c=c||!1,!C(d)||isNaN(d)?a:c?Math.round(d/b*100):d/b*100}}),b.module("a8m.math.radians",[]).filter("radians",function(){return function(a,b){if(C(b)&&isFinite(b)&&b%1===0&&b>=0&&C(a)&&isFinite(a)){var c=3.14159265359*a/180;return Math.round(c*Math.pow(10,b))/Math.pow(10,b)}return"NaN"}}),b.module("a8m.math.radix",[]).filter("radix",function(){return function(a,b){var c=/^[2-9]$|^[1-2]\d$|^3[0-6]$/;return C(a)&&c.test(b)?a.toString(b).toUpperCase():a}}),b.module("a8m.math.shortFmt",[]).filter("shortFmt",function(){return function(a,b){return C(b)&&isFinite(b)&&b%1===0&&b>=0&&C(a)&&isFinite(a)?a<1e3?""+a:a<1e6?i(a/1e3,b)+" K":a<1e9?i(a/1e6,b)+" M":i(a/1e9,b)+" B":"NaN"}}),b.module("a8m.math.sum",[]).filter("sum",function(){return function(a,b){return E(a)?a.reduce(function(a,b){return a+b},b||0):a}}),b.module("a8m.ends-with",[]).filter("endsWith",function(){return function(a,b,c){var d,e=c||!1;return!B(a)||z(b)?a:(a=e?a:a.toLowerCase(),d=a.length-b.length,a.indexOf(e?b:b.toLowerCase(),d)!==-1)}}),b.module("a8m.latinize",[]).filter("latinize",[function(){function a(a){return a.replace(/[^\u0000-\u007E]/g,function(a){return c[a]||a})}for(var b=[{base:"A",letters:"AⒶＡÀÁÂẦẤẪẨÃĀĂẰẮẴẲȦǠÄǞẢÅǺǍȀȂẠẬẶḀĄȺⱯ"},{base:"AA",letters:"Ꜳ"},{base:"AE",letters:"ÆǼǢ"},{base:"AO",letters:"Ꜵ"},{base:"AU",letters:"Ꜷ"},{base:"AV",letters:"ꜸꜺ"},{base:"AY",letters:"Ꜽ"},{base:"B",letters:"BⒷＢḂḄḆɃƂƁ"},{base:"C",letters:"CⒸＣĆĈĊČÇḈƇȻꜾ"},{base:"D",letters:"DⒹＤḊĎḌḐḒḎĐƋƊƉꝹ"},{base:"DZ",letters:"ǱǄ"},{base:"Dz",letters:"ǲǅ"},{base:"E",letters:"EⒺＥÈÉÊỀẾỄỂẼĒḔḖĔĖËẺĚȄȆẸỆȨḜĘḘḚƐƎ"},{base:"F",letters:"FⒻＦḞƑꝻ"},{base:"G",letters:"GⒼＧǴĜḠĞĠǦĢǤƓꞠꝽꝾ"},{base:"H",letters:"HⒽＨĤḢḦȞḤḨḪĦⱧⱵꞍ"},{base:"I",letters:"IⒾＩÌÍÎĨĪĬİÏḮỈǏȈȊỊĮḬƗ"},{base:"J",letters:"JⒿＪĴɈ"},{base:"K",letters:"KⓀＫḰǨḲĶḴƘⱩꝀꝂꝄꞢ"},{base:"L",letters:"LⓁＬĿĹĽḶḸĻḼḺŁȽⱢⱠꝈꝆꞀ"},{base:"LJ",letters:"Ǉ"},{base:"Lj",letters:"ǈ"},{base:"M",letters:"MⓂＭḾṀṂⱮƜ"},{base:"N",letters:"NⓃＮǸŃÑṄŇṆŅṊṈȠƝꞐꞤ"},{base:"NJ",letters:"Ǌ"},{base:"Nj",letters:"ǋ"},{base:"O",letters:"OⓄＯÒÓÔỒỐỖỔÕṌȬṎŌṐṒŎȮȰÖȪỎŐǑȌȎƠỜỚỠỞỢỌỘǪǬØǾƆƟꝊꝌ"},{base:"OI",letters:"Ƣ"},{base:"OO",letters:"Ꝏ"},{base:"OU",letters:"Ȣ"},{base:"OE",letters:"Œ"},{base:"oe",letters:"œ"},{base:"P",letters:"PⓅＰṔṖƤⱣꝐꝒꝔ"},{base:"Q",letters:"QⓆＱꝖꝘɊ"},{base:"R",letters:"RⓇＲŔṘŘȐȒṚṜŖṞɌⱤꝚꞦꞂ"},{base:"S",letters:"SⓈＳẞŚṤŜṠŠṦṢṨȘŞⱾꞨꞄ"},{base:"T",letters:"TⓉＴṪŤṬȚŢṰṮŦƬƮȾꞆ"},{base:"TZ",letters:"Ꜩ"},{base:"U",letters:"UⓊＵÙÚÛŨṸŪṺŬÜǛǗǕǙỦŮŰǓȔȖƯỪỨỮỬỰỤṲŲṶṴɄ"},{base:"V",letters:"VⓋＶṼṾƲꝞɅ"},{base:"VY",letters:"Ꝡ"},{base:"W",letters:"WⓌＷẀẂŴẆẄẈⱲ"},{base:"X",letters:"XⓍＸẊẌ"},{base:"Y",letters:"YⓎＹỲÝŶỸȲẎŸỶỴƳɎỾ"},{base:"Z",letters:"ZⓏＺŹẐŻŽẒẔƵȤⱿⱫꝢ"},{base:"a",letters:"aⓐａẚàáâầấẫẩãāăằắẵẳȧǡäǟảåǻǎȁȃạậặḁąⱥɐ"},{base:"aa",letters:"ꜳ"},{base:"ae",letters:"æǽǣ"},{base:"ao",letters:"ꜵ"},{base:"au",letters:"ꜷ"},{base:"av",letters:"ꜹꜻ"},{base:"ay",letters:"ꜽ"},{base:"b",letters:"bⓑｂḃḅḇƀƃɓ"},{base:"c",letters:"cⓒｃćĉċčçḉƈȼꜿↄ"},{base:"d",letters:"dⓓｄḋďḍḑḓḏđƌɖɗꝺ"},{base:"dz",letters:"ǳǆ"},{base:"e",letters:"eⓔｅèéêềếễểẽēḕḗĕėëẻěȅȇẹệȩḝęḙḛɇɛǝ"},{base:"f",letters:"fⓕｆḟƒꝼ"},{base:"g",letters:"gⓖｇǵĝḡğġǧģǥɠꞡᵹꝿ"},{base:"h",letters:"hⓗｈĥḣḧȟḥḩḫẖħⱨⱶɥ"},{base:"hv",letters:"ƕ"},{base:"i",letters:"iⓘｉìíîĩīĭïḯỉǐȉȋịįḭɨı"},{base:"j",letters:"jⓙｊĵǰɉ"},{base:"k",letters:"kⓚｋḱǩḳķḵƙⱪꝁꝃꝅꞣ"},{base:"l",letters:"lⓛｌŀĺľḷḹļḽḻſłƚɫⱡꝉꞁꝇ"},{base:"lj",letters:"ǉ"},{base:"m",letters:"mⓜｍḿṁṃɱɯ"},{base:"n",letters:"nⓝｎǹńñṅňṇņṋṉƞɲŉꞑꞥ"},{base:"nj",letters:"ǌ"},{base:"o",letters:"oⓞｏòóôồốỗổõṍȭṏōṑṓŏȯȱöȫỏőǒȍȏơờớỡởợọộǫǭøǿɔꝋꝍɵ"},{base:"oi",letters:"ƣ"},{base:"ou",letters:"ȣ"},{base:"oo",letters:"ꝏ"},{base:"p",letters:"pⓟｐṕṗƥᵽꝑꝓꝕ"},{base:"q",letters:"qⓠｑɋꝗꝙ"},{base:"r",letters:"rⓡｒŕṙřȑȓṛṝŗṟɍɽꝛꞧꞃ"},{base:"s",letters:"sⓢｓßśṥŝṡšṧṣṩșşȿꞩꞅẛ"},{base:"t",letters:"tⓣｔṫẗťṭțţṱṯŧƭʈⱦꞇ"},{base:"tz",letters:"ꜩ"},{base:"u",letters:"uⓤｕùúûũṹūṻŭüǜǘǖǚủůűǔȕȗưừứữửựụṳųṷṵʉ"},{base:"v",letters:"vⓥｖṽṿʋꝟʌ"},{base:"vy",letters:"ꝡ"},{base:"w",letters:"wⓦｗẁẃŵẇẅẘẉⱳ"},{base:"x",letters:"xⓧｘẋẍ"},{base:"y",letters:"yⓨｙỳýŷỹȳẏÿỷẙỵƴɏỿ"},{base:"z",letters:"zⓩｚźẑżžẓẕƶȥɀⱬꝣ"}],c={},d=0;d<b.length;d++)for(var e=b[d].letters.split(""),f=0;f<e.length;f++)c[e[f]]=b[d].base;return function(b){return B(b)?a(b):b}}]),b.module("a8m.ltrim",[]).filter("ltrim",function(){return function(a,b){var c=b||"\\s";return B(a)?a.replace(new RegExp("^"+c+"+"),""):a}}),b.module("a8m.match",[]).filter("match",function(){return function(a,b,c){var d=new RegExp(b,c);return B(a)?a.match(d):null}}),b.module("a8m.phoneUS",[]).filter("phoneUS",function(){return function(a){return a+="","("+a.slice(0,3)+") "+a.slice(3,6)+"-"+a.slice(6)}}),b.module("a8m.repeat",[]).filter("repeat",[function(){return function(a,b,c){var d=~~b;return B(a)&&d?w(a,--b,c||""):a}}]),b.module("a8m.rtrim",[]).filter("rtrim",function(){return function(a,b){var c=b||"\\s";return B(a)?a.replace(new RegExp(c+"+$"),""):a}}),b.module("a8m.slugify",[]).filter("slugify",[function(){return function(a,b){var c=z(b)?"-":b;return B(a)?a.toLowerCase().replace(/\s+/g,c):a}}]),b.module("a8m.split",[]).filter("split",function(){function a(a){return a.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g,"\\$&")}return function(b,c,d){var f,g,h,i;return z(b)||!B(b)?null:(z(c)&&(c=""),isNaN(d)&&(d=0),f=new RegExp(a(c),"g"),g=b.match(f),e(g)||d>=g.length?[b]:0===d?b.split(c):(h=b.split(c),i=h.splice(0,d+1),h.unshift(i.join(c)),h))}}),b.module("a8m.starts-with",[]).filter("startsWith",function(){return function(a,b,c){var d=c||!1;return!B(a)||z(b)?a:(a=d?a:a.toLowerCase(),!a.indexOf(d?b:b.toLowerCase()))}}),b.module("a8m.stringular",[]).filter("stringular",function(){return function(a){var b=Array.prototype.slice.call(arguments,1);return a.replace(/{(\d+)}/g,function(a,c){return z(b[c])?a:b[c]})}}),b.module("a8m.strip-tags",[]).filter("stripTags",function(){return function(a){return B(a)?a.replace(/<\S[^><]*>/g,""):a}}),b.module("a8m.test",[]).filter("test",function(){return function(a,b,c){var d=new RegExp(b,c);return B(a)?d.test(a):a}}),b.module("a8m.trim",[]).filter("trim",function(){return function(a,b){var c=b||"\\s";return B(a)?a.replace(new RegExp("^"+c+"+|"+c+"+$","g"),""):a}}),b.module("a8m.truncate",[]).filter("truncate",function(){return function(a,b,c,d){return b=z(b)?a.length:b,d=d||!1,c=c||"",!B(a)||a.length<=b?a:a.substring(0,d?a.indexOf(" ",b)===-1?a.length:a.indexOf(" ",b):b)+c}}),b.module("a8m.ucfirst",[]).filter({ucfirst:x,titleize:x}),b.module("a8m.uri-component-encode",[]).filter("uriComponentEncode",["$window",function(a){return function(b){return B(b)?a.encodeURIComponent(b):b}}]),b.module("a8m.uri-encode",[]).filter("uriEncode",["$window",function(a){return function(b){return B(b)?a.encodeURI(b):b}}]),b.module("a8m.wrap",[]).filter("wrap",function(){return function(a,b,c){return B(a)&&y(b)?[b,a,c||b].join(""):a}}),b.module("a8m.filter-watcher",[]).provider("filterWatcher",function(){this.$get=["$window","$rootScope",function(a,b){function c(b,c){function d(){var b=[];return function(c,d){if(D(d)&&!e(d)){if(~b.indexOf(d))return"[Circular]";b.push(d)}return a==d?"$WINDOW":a.document==d?"$DOCUMENT":k(d)?"$SCOPE":d}}return[b,JSON.stringify(c,d())].join("#").replace(/"/g,"")}function d(a){var b=a.targetScope.$id;F(l[b],function(a){delete j[a]}),delete l[b]}function f(){m(function(){b.$$phase||(j={})},2e3)}function g(a,b){var c=a.$id;return z(l[c])&&(a.$on("$destroy",d),l[c]=[]),l[c].push(b)}function h(a,b){var d=c(a,b);return j[d]}function i(a,b,d,e){var h=c(a,b);return j[h]=e,k(d)?g(d,h):f(),e}var j={},l={},m=a.setTimeout;return{isMemoized:h,memoize:i}}]}),b.module("angular.filter",["a8m.ucfirst","a8m.uri-encode","a8m.uri-component-encode","a8m.slugify","a8m.latinize","a8m.strip-tags","a8m.stringular","a8m.truncate","a8m.starts-with","a8m.ends-with","a8m.wrap","a8m.trim","a8m.ltrim","a8m.rtrim","a8m.repeat","a8m.test","a8m.match","a8m.split","a8m.phoneUS","a8m.to-array","a8m.concat","a8m.contains","a8m.unique","a8m.is-empty","a8m.after","a8m.after-where","a8m.before","a8m.before-where","a8m.defaults","a8m.where","a8m.reverse","a8m.remove","a8m.remove-with","a8m.group-by","a8m.count-by","a8m.chunk-by","a8m.search-field","a8m.fuzzy-by","a8m.fuzzy","a8m.omit","a8m.pick","a8m.every","a8m.filter-by","a8m.xor","a8m.map","a8m.first","a8m.last","a8m.flatten","a8m.join","a8m.range","a8m.math.max","a8m.math.min","a8m.math.abs","a8m.math.percent","a8m.math.radix","a8m.math.sum","a8m.math.degrees","a8m.math.radians","a8m.math.byteFmt","a8m.math.kbFmt","a8m.math.shortFmt","a8m.angular","a8m.conditions","a8m.is-null","a8m.filter-watcher"])}(window,window.angular);

/***/ }),
/* 109 */
/***/ (function(module, exports) {

/*! 
 * angular-loading-bar v0.9.0
 * https://chieffancypants.github.io/angular-loading-bar
 * Copyright (c) 2016 Wes Cruver
 * License: MIT
 */
/*
 * angular-loading-bar
 *
 * intercepts XHR requests and creates a loading bar.
 * Based on the excellent nprogress work by rstacruz (more info in readme)
 *
 * (c) 2013 Wes Cruver
 * License: MIT
 */


(function() {

'use strict';

// Alias the loading bar for various backwards compatibilities since the project has matured:
angular.module('angular-loading-bar', ['cfp.loadingBarInterceptor']);
angular.module('chieffancypants.loadingBar', ['cfp.loadingBarInterceptor']);


/**
 * loadingBarInterceptor service
 *
 * Registers itself as an Angular interceptor and listens for XHR requests.
 */
angular.module('cfp.loadingBarInterceptor', ['cfp.loadingBar'])
  .config(['$httpProvider', function ($httpProvider) {

    var interceptor = ['$q', '$cacheFactory', '$timeout', '$rootScope', '$log', 'cfpLoadingBar', function ($q, $cacheFactory, $timeout, $rootScope, $log, cfpLoadingBar) {

      /**
       * The total number of requests made
       */
      var reqsTotal = 0;

      /**
       * The number of requests completed (either successfully or not)
       */
      var reqsCompleted = 0;

      /**
       * The amount of time spent fetching before showing the loading bar
       */
      var latencyThreshold = cfpLoadingBar.latencyThreshold;

      /**
       * $timeout handle for latencyThreshold
       */
      var startTimeout;


      /**
       * calls cfpLoadingBar.complete() which removes the
       * loading bar from the DOM.
       */
      function setComplete() {
        $timeout.cancel(startTimeout);
        cfpLoadingBar.complete();
        reqsCompleted = 0;
        reqsTotal = 0;
      }

      /**
       * Determine if the response has already been cached
       * @param  {Object}  config the config option from the request
       * @return {Boolean} retrns true if cached, otherwise false
       */
      function isCached(config) {
        var cache;
        var defaultCache = $cacheFactory.get('$http');
        var defaults = $httpProvider.defaults;

        // Choose the proper cache source. Borrowed from angular: $http service
        if ((config.cache || defaults.cache) && config.cache !== false &&
          (config.method === 'GET' || config.method === 'JSONP')) {
            cache = angular.isObject(config.cache) ? config.cache
              : angular.isObject(defaults.cache) ? defaults.cache
              : defaultCache;
        }

        var cached = cache !== undefined ?
          cache.get(config.url) !== undefined : false;

        if (config.cached !== undefined && cached !== config.cached) {
          return config.cached;
        }
        config.cached = cached;
        return cached;
      }


      return {
        'request': function(config) {
          // Check to make sure this request hasn't already been cached and that
          // the requester didn't explicitly ask us to ignore this request:
          if (!config.ignoreLoadingBar && !isCached(config)) {
            $rootScope.$broadcast('cfpLoadingBar:loading', {url: config.url});
            if (reqsTotal === 0) {
              startTimeout = $timeout(function() {
                cfpLoadingBar.start();
              }, latencyThreshold);
            }
            reqsTotal++;
            cfpLoadingBar.set(reqsCompleted / reqsTotal);
          }
          return config;
        },

        'response': function(response) {
          if (!response || !response.config) {
            $log.error('Broken interceptor detected: Config object not supplied in response:\n https://github.com/chieffancypants/angular-loading-bar/pull/50');
            return response;
          }

          if (!response.config.ignoreLoadingBar && !isCached(response.config)) {
            reqsCompleted++;
            $rootScope.$broadcast('cfpLoadingBar:loaded', {url: response.config.url, result: response});
            if (reqsCompleted >= reqsTotal) {
              setComplete();
            } else {
              cfpLoadingBar.set(reqsCompleted / reqsTotal);
            }
          }
          return response;
        },

        'responseError': function(rejection) {
          if (!rejection || !rejection.config) {
            $log.error('Broken interceptor detected: Config object not supplied in rejection:\n https://github.com/chieffancypants/angular-loading-bar/pull/50');
            return $q.reject(rejection);
          }

          if (!rejection.config.ignoreLoadingBar && !isCached(rejection.config)) {
            reqsCompleted++;
            $rootScope.$broadcast('cfpLoadingBar:loaded', {url: rejection.config.url, result: rejection});
            if (reqsCompleted >= reqsTotal) {
              setComplete();
            } else {
              cfpLoadingBar.set(reqsCompleted / reqsTotal);
            }
          }
          return $q.reject(rejection);
        }
      };
    }];

    $httpProvider.interceptors.push(interceptor);
  }]);


/**
 * Loading Bar
 *
 * This service handles adding and removing the actual element in the DOM.
 * Generally, best practices for DOM manipulation is to take place in a
 * directive, but because the element itself is injected in the DOM only upon
 * XHR requests, and it's likely needed on every view, the best option is to
 * use a service.
 */
angular.module('cfp.loadingBar', [])
  .provider('cfpLoadingBar', function() {

    this.autoIncrement = true;
    this.includeSpinner = true;
    this.includeBar = true;
    this.latencyThreshold = 100;
    this.startSize = 0.02;
    this.parentSelector = 'body';
    this.spinnerTemplate = '<div id="loading-bar-spinner"><div class="spinner-icon"></div></div>';
    this.loadingBarTemplate = '<div id="loading-bar"><div class="bar"><div class="peg"></div></div></div>';

    this.$get = ['$injector', '$document', '$timeout', '$rootScope', function ($injector, $document, $timeout, $rootScope) {
      var $animate;
      var $parentSelector = this.parentSelector,
        loadingBarContainer = angular.element(this.loadingBarTemplate),
        loadingBar = loadingBarContainer.find('div').eq(0),
        spinner = angular.element(this.spinnerTemplate);

      var incTimeout,
        completeTimeout,
        started = false,
        status = 0;

      var autoIncrement = this.autoIncrement;
      var includeSpinner = this.includeSpinner;
      var includeBar = this.includeBar;
      var startSize = this.startSize;

      /**
       * Inserts the loading bar element into the dom, and sets it to 2%
       */
      function _start() {
        if (!$animate) {
          $animate = $injector.get('$animate');
        }

        $timeout.cancel(completeTimeout);

        // do not continually broadcast the started event:
        if (started) {
          return;
        }

        var document = $document[0];
        var parent = document.querySelector ?
          document.querySelector($parentSelector)
          : $document.find($parentSelector)[0]
        ;

        if (! parent) {
          parent = document.getElementsByTagName('body')[0];
        }

        var $parent = angular.element(parent);
        var $after = parent.lastChild && angular.element(parent.lastChild);

        $rootScope.$broadcast('cfpLoadingBar:started');
        started = true;

        if (includeBar) {
          $animate.enter(loadingBarContainer, $parent, $after);
        }

        if (includeSpinner) {
          $animate.enter(spinner, $parent, loadingBarContainer);
        }

        _set(startSize);
      }

      /**
       * Set the loading bar's width to a certain percent.
       *
       * @param n any value between 0 and 1
       */
      function _set(n) {
        if (!started) {
          return;
        }
        var pct = (n * 100) + '%';
        loadingBar.css('width', pct);
        status = n;

        // increment loadingbar to give the illusion that there is always
        // progress but make sure to cancel the previous timeouts so we don't
        // have multiple incs running at the same time.
        if (autoIncrement) {
          $timeout.cancel(incTimeout);
          incTimeout = $timeout(function() {
            _inc();
          }, 250);
        }
      }

      /**
       * Increments the loading bar by a random amount
       * but slows down as it progresses
       */
      function _inc() {
        if (_status() >= 1) {
          return;
        }

        var rnd = 0;

        // TODO: do this mathmatically instead of through conditions

        var stat = _status();
        if (stat >= 0 && stat < 0.25) {
          // Start out between 3 - 6% increments
          rnd = (Math.random() * (5 - 3 + 1) + 3) / 100;
        } else if (stat >= 0.25 && stat < 0.65) {
          // increment between 0 - 3%
          rnd = (Math.random() * 3) / 100;
        } else if (stat >= 0.65 && stat < 0.9) {
          // increment between 0 - 2%
          rnd = (Math.random() * 2) / 100;
        } else if (stat >= 0.9 && stat < 0.99) {
          // finally, increment it .5 %
          rnd = 0.005;
        } else {
          // after 99%, don't increment:
          rnd = 0;
        }

        var pct = _status() + rnd;
        _set(pct);
      }

      function _status() {
        return status;
      }

      function _completeAnimation() {
        status = 0;
        started = false;
      }

      function _complete() {
        if (!$animate) {
          $animate = $injector.get('$animate');
        }

        $rootScope.$broadcast('cfpLoadingBar:completed');
        _set(1);

        $timeout.cancel(completeTimeout);

        // Attempt to aggregate any start/complete calls within 500ms:
        completeTimeout = $timeout(function() {
          var promise = $animate.leave(loadingBarContainer, _completeAnimation);
          if (promise && promise.then) {
            promise.then(_completeAnimation);
          }
          $animate.leave(spinner);
        }, 500);
      }

      return {
        start            : _start,
        set              : _set,
        status           : _status,
        inc              : _inc,
        complete         : _complete,
        autoIncrement    : this.autoIncrement,
        includeSpinner   : this.includeSpinner,
        latencyThreshold : this.latencyThreshold,
        parentSelector   : this.parentSelector,
        startSize        : this.startSize
      };


    }];     //
  });       // wtf javascript. srsly
})();       //


/***/ }),
/* 110 */
/***/ (function(module, exports) {

/*! angular-easyfb
version: 1.5.1
build date: 2016-05-27
author: Robin Fan
https://github.com/pc035860/angular-easyfb.git */
!function(a){function b(b,c){var d="ezfb-social-plugin-wrap",e="display: inline-block; width: 0; height: 0; overflow: hidden;",f=["fbPage","fbComments"],g=function(a){var b='<span class="'+d+'" style="'+e+'">';return a.wrap(b).parent()},h=function(a){var b='<div class="'+d+'">';return a.wrap(b).parent()},i=function(a){return a.parent().hasClass(d)},j=function(a){var b=a.parent();return b.after(a).remove(),a};a.directive(c,["ezfb","$q","$document",function(a,d,e){var k=f.indexOf(c)>=0,l=c.replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase();return{restrict:"EC",require:"?^ezfbXfbml",compile:function(c,d){return c.removeClass(l),function(c,d,e,f){function m(a){return function(){var b;n&&a===o&&(b=e.onrender,b&&c.$eval(b),n=!1,j(d))}}if(!f){var n=!1,o=0;a.$rendered().then(function(){d.addClass(l),c.$watch(function(){var a=[];return angular.forEach(b,function(b){a.push(e[b])}),a},function(b){var c;o++,n?a.XFBML.parse(d.parent()[0],m(o)):(n=!0,c=k?h:g,a.XFBML.parse(c(d)[0],m(o)))},!0)}),d.bind("$destroy",function(){i(d)&&j(d)})}}}}}])}a.provider("ezfb",function(){function a(a,b){return angular.isObject(b)?void angular.extend(a,b):angular.copy(a)}function b(a,b,c){return function(){return a.apply(b,c)}}var c={COMPLETED_REGISTRATION:"fb_mobile_complete_registration",VIEWED_CONTENT:"fb_mobile_content_view",SEARCHED:"fb_mobile_search",RATED:"fb_mobile_rate",COMPLETED_TUTORIAL:"fb_mobile_tutorial_completion",ADDED_TO_CART:"fb_mobile_add_to_cart",ADDED_TO_WISHLIST:"fb_mobile_add_to_wishlist",INITIATED_CHECKOUT:"fb_mobile_initiated_checkout",ADDED_PAYMENT_INFO:"fb_mobile_add_payment_info",ACHIEVED_LEVEL:"fb_mobile_level_achieved",UNLOCKED_ACHIEVEMENT:"fb_mobile_achievement_unlocked",SPENT_CREDITS:"fb_mobile_spent_credits"},d={CURRENCY:"fb_currency",REGISTRATION_METHOD:"fb_registration_method",CONTENT_TYPE:"fb_content_type",CONTENT_ID:"fb_content_id",SEARCH_STRING:"fb_search_string",SUCCESS:"fb_success",MAX_RATING_VALUE:"fb_max_rating_value",PAYMENT_INFO_AVAILABLE:"fb_payment_info_available",NUM_ITEMS:"fb_num_items",LEVEL:"fb_level",DESCRIPTION:"fb_description"},e=-1,f={api:[1,2,3],ui:1,getAuthResponse:e,getLoginStatus:0,login:0,logout:0,"Event.subscribe":1,"Event.unsubscribe":1,"XFBML.parse":1,"Canvas.Prefetcher.addStaticResource":e,"Canvas.Prefetcher.setCollectionMode":e,"Canvas.getPageInfo":0,"Canvas.hideFlashElement":e,"Canvas.scrollTo":e,"Canvas.setAutoGrow":e,"Canvas.setDoneLoading":0,"Canvas.setSize":e,"Canvas.setUrlHandler":0,"Canvas.showFlashElement":e,"Canvas.startTimer":e,"Canvas.stopTimer":0,"AppEvents.logEvent":e,"AppEvents.logPurchase":e,"AppEvents.activateApp":e},g="en_US",h={status:!0,cookie:!0,xfbml:!0,version:"v2.6"},i=["$window","$document","$timeout","ezfbAsyncInit","ezfbLocale",function(a,b,c,d,e){!function(a){var b=function(){var b,c="facebook-jssdk",d=a.getElementsByTagName("script")[0];a.getElementById(c)||(b=a.createElement("script"),b.id=c,b.async=!0,b.src="//connect.facebook.net/"+e+"/sdk.js",d.parentNode.insertBefore(b,d))};c(b,0,!1)}(b[0]),a.fbAsyncInit=d}],j=i,k=["$window","ezfbInitParams",function(a,b){a.FB.init(b)}],l=k;return{setInitParams:function(b){a(h,b)},getInitParams:function(){return a(h)},setLocale:function(a){g=a},getLocale:function(){return g},setLoadSDKFunction:function(a){if(!angular.isArray(a)&&!angular.isFunction(a))throw new Error("Init function type error.");j=a},getLoadSDKFunction:function(){return j},setInitFunction:function(a){if(!angular.isArray(a)&&!angular.isFunction(a))throw new Error("Init function type error.");l=a},getInitFunction:function(){return l},$get:["$window","$q","$document","$parse","$rootScope","$injector","$timeout",function(i,m,n,o,p,q,r){var s,t,u,v,w,x;return v={},w=m.defer(),(h.appId||l!==k)&&w.resolve(),s=m.defer(),t=m.defer(),n[0].getElementById("fb-root")||n.find("body").append('<div id="fb-root"></div>'),x=function(){w.promise.then(function(){if(h.xfbml){var a=function(){u.$$xfbmlRendered=!0,r(function(){t.resolve(!0)}),u.Event.unsubscribe("xfbml.render",a)};u.Event.subscribe("xfbml.render",a)}else r(function(){t.resolve(!1)});q.invoke(l,null,{ezfbInitParams:h}),u.$$ready=!0,s.resolve()})},q.invoke(j,null,{ezfbAsyncInit:x,ezfbLocale:g}),u={$$ready:!1,$$xfbmlRendered:!1,$ready:function(a){return angular.isFunction(a)&&s.promise.then(a),s.promise},$rendered:function(a){return angular.isFunction(a)&&t.promise.then(a),t.promise},init:function(b){a(h,b),w.resolve()},AppEvents:{EventNames:c,ParameterNames:d}},angular.forEach(f,function(a,c){var d=o(c),f=d.assign;f(u,function(){var f=b(function(b){var f,g;if(f=m.defer(),g=function(a){var d,e;for(d=angular.isFunction(b[a])?b[a]:angular.noop,e=function(){var a=Array.prototype.slice.call(arguments);p.$$phase?(d.apply(null,a),f.resolve.apply(f,a)):p.$apply(function(){d.apply(null,a),f.resolve.apply(f,a)})};b.length<=a;)b.push(null);var g;if("Event.subscribe"===c)g=b[0],angular.isUndefined(v[g])&&(v[g]=[]),v[g].push({original:d,wrapped:e});else if("Event.unsubscribe"===c&&(g=b[0],angular.isArray(v[g]))){var h,i,j=v[g].length;for(h=0;j>h;h++)if(i=v[g][h],i.original===d){e=i.wrapped,v[g].splice(h,1);break}}b[a]=e},a!==e)if(angular.isNumber(a))g(a);else if(angular.isArray(a)){var h,j;for(h=0;h<a.length;h++)if(j=a[h],b.length==j||b.length==j+1&&angular.isFunction(b[j])){g(j);break}}var k=d(i.FB);if(!k)throw new Error("Facebook API `FB."+c+"` doesn't exist.");return k.apply(i.FB,b),f.promise},null,[Array.prototype.slice.call(arguments)]);if("getAuthResponse"===c){if(angular.isUndefined(i.FB))throw new Error("`FB` is not ready.");return i.FB.getAuthResponse()}return a!==e?s.promise.then(f):void s.promise.then(f)})}),u}]}}).directive("ezfbXfbml",["ezfb","$parse","$compile","$timeout",function(a,b,c,d){return{restrict:"EAC",controller:function(){},compile:function(e,f){var g=e.html();return function(e,f,h){var i=!0,j=h.onrender,k=function(){i&&(j&&e.$eval(j),i=!1)};a.XFBML.parse(f[0],k);var l=b(h.ezfbXfbml).assign;e.$watch(h.ezfbXfbml,function(b){b&&(i=!0,f.html(g),c(f.contents())(e),d(function(){a.XFBML.parse(f[0],k)}),(l||angular.noop)(e,!1))},!0)}}}}]);var c={fbLike:["action","colorscheme","href","kidDirectedSite","layout","ref","share","showFaces","width"],fbShareButton:["href","layout","width"],fbSend:["colorscheme","href","kidDirectedSite","ref"],fbPost:["href","width"],fbFollow:["colorscheme","href","kidDirectedSite","layout","showFaces","width"],fbComments:["colorscheme","href","mobile","numPosts","orderBy","width"],fbCommentsCount:["href"],fbActivity:["action","appId","colorscheme","filter","header","height","linktarget","maxAge","recommendations","ref","site","width"],fbRecommendations:["action","appId","colorscheme","header","height","linktarget","maxAge","ref","site","width"],fbRecommendationsBar:["action","href","maxAge","numRecommendations","readTime","ref","side","site","trigger"],fbLikeBox:["colorscheme","forceWall","header","height","href","showBorder","showFaces","stream","width"],fbFacepile:["action","appId","colorscheme","href","maxRows","size","width"],fbPage:["href","width","height","hideCover","showFacepile","showPosts"],fbVideo:["href","width","allowfullscreen"],fbAdPreview:["adAccountId","adgroupId","creative","creativeId","adFormat","pageType","targeting","post"],fbSendToMessenger:["messengerAppId","pageId","ref","color","size"],fbMessengermessageus:["messengerAppId","pageId","color","size"]};angular.forEach(c,b)}(angular.module("ezfb",[]));

/***/ }),
/* 111 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * A directive for adding google places autocomplete to a text box
 * google places autocomplete info: https://developers.google.com/maps/documentation/javascript/places
 *
 * Usage:
 *
 * <input type="text"  ng-autocomplete ng-model="autocomplete" options="options" details="details/>
 *
 * + ng-model - autocomplete textbox value
 *
 * + details - more detailed autocomplete result, includes address parts, latlng, etc. (Optional)
 *
 * + options - configuration for the autocomplete (Optional)
 *
 *       + types: type,        String, values can be 'geocode', 'establishment', '(regions)', or '(cities)'
 *       + bounds: bounds,     Google maps LatLngBounds Object, biases results to bounds, but may return results outside these bounds
 *       + country: country    String, ISO 3166-1 Alpha-2 compatible country code. examples; 'ca', 'us', 'gb'
 *       + watchEnter:         Boolean, true; on Enter select top autocomplete result. false(default); enter ends autocomplete
 *
 * example:
 *
 *    options = {
 *        types: '(cities)',
 *        country: 'ca'
 *    }
**/

angular.module( "ngAutocomplete", [])
  .directive('ngAutocomplete', function() {
    return {
      require: 'ngModel',
      scope: {
        ngModel: '=',
        options: '=?',
        details: '=?'
      },

      link: function(scope, element, attrs, controller) {

        //options for autocomplete
        var opts
        var watchEnter = false
        //convert options provided to opts
        var initOpts = function() {

          opts = {}
          if (scope.options) {

            if (scope.options.watchEnter !== true) {
              watchEnter = false
            } else {
              watchEnter = true
            }

            if (scope.options.types) {
              opts.types = []
              opts.types.push(scope.options.types)
              scope.gPlace.setTypes(opts.types)
            } else {
              scope.gPlace.setTypes([])
            }

            if (scope.options.bounds) {
              opts.bounds = scope.options.bounds
              scope.gPlace.setBounds(opts.bounds)
            } else {
              scope.gPlace.setBounds(null)
            }

            if (scope.options.country) {
              opts.componentRestrictions = {
                country: scope.options.country
              }
              scope.gPlace.setComponentRestrictions(opts.componentRestrictions)
            } else {
              scope.gPlace.setComponentRestrictions(null)
            }
          }
        }

        if (scope.gPlace == undefined) {
          scope.gPlace = new google.maps.places.Autocomplete(element[0], {});
        }
        google.maps.event.addListener(scope.gPlace, 'place_changed', function() {
          var result = scope.gPlace.getPlace();
          if (result !== undefined) {
            if (result.address_components !== undefined) {

              scope.$apply(function() {

                scope.details = result;

                controller.$setViewValue(element.val());
              });
            }
            else {
              if (watchEnter) {
                getPlace(result)
              }
            }
          }
        })

        //function to get retrieve the autocompletes first result using the AutocompleteService 
        var getPlace = function(result) {
          var autocompleteService = new google.maps.places.AutocompleteService();
          if (result.name.length > 0){
            autocompleteService.getPlacePredictions(
              {
                input: result.name,
                offset: result.name.length
              },
              function listentoresult(list, status) {
                if(list == null || list.length == 0) {

                  scope.$apply(function() {
                    scope.details = null;
                  });

                } else {
                  var placesService = new google.maps.places.PlacesService(element[0]);
                  placesService.getDetails(
                    {'reference': list[0].reference},
                    function detailsresult(detailsResult, placesServiceStatus) {

                      if (placesServiceStatus == google.maps.GeocoderStatus.OK) {
                        scope.$apply(function() {

                          controller.$setViewValue(detailsResult.formatted_address);
                          element.val(detailsResult.formatted_address);

                          scope.details = detailsResult;

                          //on focusout the value reverts, need to set it again.
                          var watchFocusOut = element.on('focusout', function(event) {
                            element.val(detailsResult.formatted_address);
                            element.unbind('focusout')
                          })

                        });
                      }
                    }
                  );
                }
              });
          }
        }

        controller.$render = function () {
          var location = controller.$viewValue;
          element.val(location);
        };

        //watch options provided to directive
        scope.watchOptions = function () {
          return scope.options
        };
        scope.$watch(scope.watchOptions, function () {
          initOpts()
        }, true);

      }
    };
  });

/***/ }),
/* 112 */
/***/ (function(module, exports, __webpack_require__) {

!function(e,t){ true?module.exports=t(__webpack_require__(9)):"function"==typeof define&&define.amd?define(["angular"],t):t(e.angular)}(this,function(angular){/**
 * AngularJS Google Maps Ver. 1.18.3
 *
 * The MIT License (MIT)
 * 
 * Copyright (c) 2014, 2015, 1016 Allen Kim
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
return angular.module("ngMap",[]),function(){"use strict";var e,t=function(t,n,o,a,r,i,s,p,c){e=i;var u=this,l=r.startSymbol(),g=r.endSymbol();u.mapOptions,u.mapEvents,u.eventListeners,u.addObject=function(e,t){if(u.map){u.map[e]=u.map[e]||{};var n=Object.keys(u.map[e]).length;u.map[e][t.id||n]=t,u.map instanceof google.maps.Map&&("infoWindows"!=e&&t.setMap&&t.setMap&&t.setMap(u.map),t.centered&&t.position&&u.map.setCenter(t.position),"markers"==e&&u.objectChanged("markers"),"customMarkers"==e&&u.objectChanged("customMarkers"))}},u.deleteObject=function(e,t){if(t.map){var n=t.map[e];for(var o in n)n[o]===t&&(google.maps.event.clearInstanceListeners(t),delete n[o]);t.map&&t.setMap&&t.setMap(null),"markers"==e&&u.objectChanged("markers"),"customMarkers"==e&&u.objectChanged("customMarkers")}},u.observeAttrSetObj=function(t,n,o){if(n.noWatcher)return!1;for(var a=e.getAttrsToObserve(t),r=0;r<a.length;r++){var i=a[r];n.$observe(i,s.observeAndSet(i,o))}},u.zoomToIncludeMarkers=function(){if(null!=u.map.markers&&Object.keys(u.map.markers).length>0||null!=u.map.customMarkers&&Object.keys(u.map.customMarkers).length>0){var e=new google.maps.LatLngBounds;for(var t in u.map.markers)e.extend(u.map.markers[t].getPosition());for(var n in u.map.customMarkers)e.extend(u.map.customMarkers[n].getPosition());u.mapOptions.maximumZoom&&(u.enableMaximumZoomCheck=!0),u.map.fitBounds(e)}},u.objectChanged=function(e){!u.map||"markers"!=e&&"customMarkers"!=e||"auto"!=u.map.zoomToIncludeMarkers||u.zoomToIncludeMarkers()},u.initializeMap=function(){var r=u.mapOptions,i=u.mapEvents,m=u.map;if(u.map=p.getMapInstance(n[0]),s.setStyle(n[0]),m){var f=e.filter(o),v=e.getOptions(f),y=e.getControlOptions(f);r=angular.extend(v,y);for(var h in m){var b=m[h];if("object"==typeof b)for(var M in b)u.addObject(h,b[M])}u.map.showInfoWindow=u.showInfoWindow,u.map.hideInfoWindow=u.hideInfoWindow}r.zoom=r.zoom||15;var O=r.center,w=new RegExp(c(l)+".*"+c(g));if(!r.center||"string"==typeof O&&O.match(w))r.center=new google.maps.LatLng(0,0);else if("string"==typeof O&&O.match(/^[0-9.-]*,[0-9.-]*$/)){var L=parseFloat(O.split(",")[0]),k=parseFloat(O.split(",")[1]);r.center=new google.maps.LatLng(L,k)}else if(!(O instanceof google.maps.LatLng)){var $=r.center;delete r.center,s.getGeoLocation($,r.geoLocationOptions).then(function(e){u.map.setCenter(e);var n=r.geoCallback;n&&a(n)(t)},function(){r.geoFallbackCenter&&u.map.setCenter(r.geoFallbackCenter)})}u.map.setOptions(r);for(var C in i){var j=i[C],A=google.maps.event.addListener(u.map,C,j);u.eventListeners[C]=A}u.observeAttrSetObj(d,o,u.map),u.singleInfoWindow=r.singleInfoWindow,google.maps.event.trigger(u.map,"resize"),google.maps.event.addListenerOnce(u.map,"idle",function(){s.addMap(u),r.zoomToIncludeMarkers&&u.zoomToIncludeMarkers(),t.map=u.map,t.$emit("mapInitialized",u.map),o.mapInitialized&&a(o.mapInitialized)(t,{map:u.map})}),r.zoomToIncludeMarkers&&r.maximumZoom&&google.maps.event.addListener(u.map,"zoom_changed",function(){1==u.enableMaximumZoomCheck&&(u.enableMaximumZoomCheck=!1,google.maps.event.addListenerOnce(u.map,"bounds_changed",function(){u.map.setZoom(Math.min(r.maximumZoom,u.map.getZoom()))}))})},t.google=google;var d=e.orgAttributes(n),m=e.filter(o),f=e.getOptions(m,{scope:t}),v=e.getControlOptions(m),y=angular.extend(f,v),h=e.getEvents(t,m);if(Object.keys(h).length&&void 0,u.mapOptions=y,u.mapEvents=h,u.eventListeners={},f.lazyInit){if(o.id&&0===o.id.indexOf(l,0)&&-1!==o.id.indexOf(g,o.id.length-g.length))var b=o.id.slice(2,-2),M=a(b)(t);else var M=o.id;u.map={id:M},s.addMap(u)}else u.initializeMap();f.triggerResize&&google.maps.event.trigger(u.map,"resize"),n.bind("$destroy",function(){p.returnMapInstance(u.map),s.deleteMap(u)})};t.$inject=["$scope","$element","$attrs","$parse","$interpolate","Attr2MapOptions","NgMap","NgMapPool","escapeRegexpFilter"],angular.module("ngMap").controller("__MapController",t)}(),function(){"use strict";var e,t=function(t,o,a,r){r=r[0]||r[1];var i=e.orgAttributes(o),s=e.filter(a),p=e.getOptions(s,{scope:t}),c=e.getEvents(t,s),u=n(p,c);r.addObject("bicyclingLayers",u),r.observeAttrSetObj(i,a,u),o.bind("$destroy",function(){r.deleteObject("bicyclingLayers",u)})},n=function(e,t){var n=new google.maps.BicyclingLayer(e);for(var o in t)google.maps.event.addListener(n,o,t[o]);return n},o=function(n){return e=n,{restrict:"E",require:["?^map","?^ngMap"],link:t}};o.$inject=["Attr2MapOptions"],angular.module("ngMap").directive("bicyclingLayer",o)}(),function(){"use strict";var e,t,n=function(t,n,o,a,r){a=a[0]||a[1];var i=e.filter(o),s=e.getOptions(i,{scope:t}),p=e.getEvents(t,i),c=n[0].parentElement.removeChild(n[0]),u=r();angular.element(c).append(u);for(var l in p)google.maps.event.addDomListener(c,l,p[l]);a.addObject("customControls",c);var g=s.position;a.map.controls[google.maps.ControlPosition[g]].push(c),n.bind("$destroy",function(){a.deleteObject("customControls",c)})},o=function(o,a){return e=o,t=a,{restrict:"E",require:["?^map","?^ngMap"],link:n,transclude:!0}};o.$inject=["Attr2MapOptions","NgMap"],angular.module("ngMap").directive("customControl",o)}(),function(){"use strict";var e,t,n,o,a=function(e){e=e||{},this.el=document.createElement("div"),this.el.style.display="inline-block",this.el.style.visibility="hidden",this.visible=!0;for(var t in e)this[t]=e[t]},r=function(){a.prototype=new google.maps.OverlayView,a.prototype.setContent=function(e,t){this.el.innerHTML=e,this.el.style.position="absolute",t&&n(angular.element(this.el).contents())(t)},a.prototype.getDraggable=function(){return this.draggable},a.prototype.setDraggable=function(e){this.draggable=e},a.prototype.getPosition=function(){return this.position},a.prototype.setPosition=function(e){e&&(this.position=e);var n=this;if(this.getProjection()&&"function"==typeof this.position.lng){var o=function(){if(n.getProjection()){var e=n.getProjection().fromLatLngToDivPixel(n.position),t=Math.round(e.x-n.el.offsetWidth/2),o=Math.round(e.y-n.el.offsetHeight-10);n.el.style.left=t+"px",n.el.style.top=o+"px",n.el.style.visibility="visible"}};n.el.offsetWidth&&n.el.offsetHeight?o():t(o,300)}},a.prototype.setZIndex=function(e){e&&(this.zIndex=e),this.el.style.zIndex=this.zIndex},a.prototype.getVisible=function(){return this.visible},a.prototype.setVisible=function(e){this.el.style.display=e?"inline-block":"none",this.visible=e},a.prototype.addClass=function(e){var t=this.el.className.trim().split(" ");-1==t.indexOf(e)&&t.push(e),this.el.className=t.join(" ")},a.prototype.removeClass=function(e){var t=this.el.className.split(" "),n=t.indexOf(e);n>-1&&t.splice(n,1),this.el.className=t.join(" ")},a.prototype.onAdd=function(){this.getPanes().overlayMouseTarget.appendChild(this.el)},a.prototype.draw=function(){this.setPosition(),this.setZIndex(this.zIndex),this.setVisible(this.visible)},a.prototype.onRemove=function(){this.el.parentNode.removeChild(this.el)}},i=function(n,r){return function(i,s,p,c){c=c[0]||c[1];var u=e.orgAttributes(s),l=e.filter(p),g=e.getOptions(l,{scope:i}),d=e.getEvents(i,l);s[0].style.display="none";var m=new a(g);t(function(){i.$watch("["+r.join(",")+"]",function(){m.setContent(n,i)},!0),m.setContent(s[0].innerHTML,i);var e=s[0].firstElementChild.className;m.addClass("custom-marker"),m.addClass(e),g.position instanceof google.maps.LatLng||o.getGeoLocation(g.position).then(function(e){m.setPosition(e)})});for(var f in d)google.maps.event.addDomListener(m.el,f,d[f]);c.addObject("customMarkers",m),c.observeAttrSetObj(u,p,m),s.bind("$destroy",function(){c.deleteObject("customMarkers",m)})}},s=function(a,s,p,c,u,l){e=c,t=a,n=s,o=u;var g=p.startSymbol(),d=p.endSymbol(),m=new RegExp(l(g)+"([^"+d.substring(0,1)+"]+)"+l(d),"g");return{restrict:"E",require:["?^map","?^ngMap"],compile:function(e){r(),e[0].style.display="none";var t=e.html(),n=t.match(m),o=[];return(n||[]).forEach(function(e){var t=e.replace(g,"").replace(d,"");-1==e.indexOf("::")&&-1==e.indexOf("this.")&&-1==o.indexOf(t)&&o.push(e.replace(g,"").replace(d,""))}),i(t,o)}}};s.$inject=["$timeout","$compile","$interpolate","Attr2MapOptions","NgMap","escapeRegexpFilter"],angular.module("ngMap").directive("customMarker",s)}(),function(){"use strict";var e,t,n,o=function(e,t){e.panel&&(e.panel=document.getElementById(e.panel)||document.querySelector(e.panel));var n=new google.maps.DirectionsRenderer(e);for(var o in t)google.maps.event.addListener(n,o,t[o]);return n},a=function(e,o){var a=new google.maps.DirectionsService,r=o;r.travelMode=r.travelMode||"DRIVING";var i=["origin","destination","travelMode","transitOptions","unitSystem","durationInTraffic","waypoints","optimizeWaypoints","provideRouteAlternatives","avoidHighways","avoidTolls","region"];for(var s in r)-1===i.indexOf(s)&&delete r[s];r.waypoints&&("[]"==r.waypoints||""===r.waypoints)&&delete r.waypoints;var p=function(n){a.route(n,function(n,o){o==google.maps.DirectionsStatus.OK&&t(function(){e.setDirections(n)})})};r.origin&&r.destination&&("current-location"==r.origin?n.getCurrentPosition().then(function(e){r.origin=new google.maps.LatLng(e.coords.latitude,e.coords.longitude),p(r)}):"current-location"==r.destination?n.getCurrentPosition().then(function(e){r.destination=new google.maps.LatLng(e.coords.latitude,e.coords.longitude),p(r)}):p(r))},r=function(r,i,s,p){var c=r;e=p,t=i,n=s;var u=function(n,r,i,s){s=s[0]||s[1];var p=c.orgAttributes(r),u=c.filter(i),l=c.getOptions(u,{scope:n}),g=c.getEvents(n,u),d=c.getAttrsToObserve(p),m=o(l,g);s.addObject("directionsRenderers",m),d.forEach(function(e){!function(e){i.$observe(e,function(n){if("panel"==e)t(function(){var e=document.getElementById(n)||document.querySelector(n);e&&m.setPanel(e)});else if(l[e]!==n){var o=c.toOptionValue(n,{key:e});l[e]=o,a(m,l)}})}(e)}),e.getMap().then(function(){a(m,l)}),r.bind("$destroy",function(){s.deleteObject("directionsRenderers",m)})};return{restrict:"E",require:["?^map","?^ngMap"],link:u}};r.$inject=["Attr2MapOptions","$timeout","NavigatorGeolocation","NgMap"],angular.module("ngMap").directive("directions",r)}(),function(){"use strict";angular.module("ngMap").directive("drawingManager",["Attr2MapOptions",function(e){var t=e;return{restrict:"E",require:["?^map","?^ngMap"],link:function(e,n,o,a){a=a[0]||a[1];var r=t.filter(o),i=t.getOptions(r,{scope:e}),s=t.getControlOptions(r),p=t.getEvents(e,r),c=new google.maps.drawing.DrawingManager({drawingMode:i.drawingmode,drawingControl:i.drawingcontrol,drawingControlOptions:s.drawingControlOptions,circleOptions:i.circleoptions,markerOptions:i.markeroptions,polygonOptions:i.polygonoptions,polylineOptions:i.polylineoptions,rectangleOptions:i.rectangleoptions});o.$observe("drawingControlOptions",function(e){c.drawingControlOptions=t.getControlOptions({drawingControlOptions:e}).drawingControlOptions,c.setDrawingMode(null),c.setMap(a.map)});for(var u in p)google.maps.event.addListener(c,u,p[u]);a.addObject("mapDrawingManager",c),n.bind("$destroy",function(){a.deleteObject("mapDrawingManager",c)})}}}])}(),function(){"use strict";angular.module("ngMap").directive("dynamicMapsEngineLayer",["Attr2MapOptions",function(e){var t=e,n=function(e,t){var n=new google.maps.visualization.DynamicMapsEngineLayer(e);for(var o in t)google.maps.event.addListener(n,o,t[o]);return n};return{restrict:"E",require:["?^map","?^ngMap"],link:function(e,o,a,r){r=r[0]||r[1];var i=t.filter(a),s=t.getOptions(i,{scope:e}),p=t.getEvents(e,i,p),c=n(s,p);r.addObject("mapsEngineLayers",c)}}}])}(),function(){"use strict";angular.module("ngMap").directive("fusionTablesLayer",["Attr2MapOptions",function(e){var t=e,n=function(e,t){var n=new google.maps.FusionTablesLayer(e);for(var o in t)google.maps.event.addListener(n,o,t[o]);return n};return{restrict:"E",require:["?^map","?^ngMap"],link:function(e,o,a,r){r=r[0]||r[1];var i=t.filter(a),s=t.getOptions(i,{scope:e}),p=t.getEvents(e,i,p),c=n(s,p);r.addObject("fusionTablesLayers",c),o.bind("$destroy",function(){r.deleteObject("fusionTablesLayers",c)})}}}])}(),function(){"use strict";angular.module("ngMap").directive("heatmapLayer",["Attr2MapOptions","$window",function(e,t){var n=e;return{restrict:"E",require:["?^map","?^ngMap"],link:function(e,o,a,r){r=r[0]||r[1];var i=n.filter(a),s=n.getOptions(i,{scope:e});if(s.data=t[a.data]||e[a.data],!(s.data instanceof Array))throw"invalid heatmap data";s.data=new google.maps.MVCArray(s.data);{var p=new google.maps.visualization.HeatmapLayer(s);n.getEvents(e,i)}r.addObject("heatmapLayers",p)}}}])}(),function(){"use strict";var e=function(e,t,n,o,a,r,i){var s=e,p=function(e,r,i){var s;!e.position||e.position instanceof google.maps.LatLng||delete e.position,s=new google.maps.InfoWindow(e);for(var p in r)p&&google.maps.event.addListener(s,p,r[p]);var c=n(function(e){angular.isString(i)?o(i).then(function(t){e(angular.element(t).wrap("<div>").parent())},function(e){throw"info-window template request failed: "+e}):e(i)}).then(function(e){var t=e.html().trim();if(1!=angular.element(t).length)throw"info-window working as a template must have a container";s.__template=t.replace(/\s?ng-non-bindable[='"]+/,"")});return s.__open=function(e,n,o){c.then(function(){a(function(){o&&(n.anchor=o);var a=t(s.__template)(n);s.setContent(a[0]),n.$apply(),o&&o.getPosition?s.open(e,o):o&&o instanceof google.maps.LatLng?(s.open(e),s.setPosition(o)):s.open(e);var r=s.content.parentElement.parentElement.parentElement;r.className="ng-map-info-window"})})},s},c=function(e,t,n,o){o=o[0]||o[1],t.css("display","none");var a,c=s.orgAttributes(t),u=s.filter(n),l=s.getOptions(u,{scope:e}),g=s.getEvents(e,u),d=p(l,g,l.template||t);!l.position||l.position instanceof google.maps.LatLng||(a=l.position),a&&i.getGeoLocation(a).then(function(t){d.setPosition(t),d.__open(o.map,e,t);var a=n.geoCallback;a&&r(a)(e)}),o.addObject("infoWindows",d),o.observeAttrSetObj(c,n,d),o.showInfoWindow=o.map.showInfoWindow=o.showInfoWindow||function(t,n,a){var r="string"==typeof t?t:n,i="string"==typeof t?n:a;if("string"==typeof i)if("undefined"!=typeof o.map.markers&&"undefined"!=typeof o.map.markers[i])i=o.map.markers[i];else{if("undefined"==typeof o.map.customMarkers||"undefined"==typeof o.map.customMarkers[i])throw new Error("Cant open info window for id "+i+". Marker or CustomMarker is not defined");i=o.map.customMarkers[i]}var s=o.map.infoWindows[r],p=i?i:this.getPosition?this:null;s.__open(o.map,e,p),o.singleInfoWindow&&(o.lastInfoWindow&&e.hideInfoWindow(o.lastInfoWindow),o.lastInfoWindow=r)},o.hideInfoWindow=o.map.hideInfoWindow=o.hideInfoWindow||function(e,t){var n="string"==typeof e?e:t,a=o.map.infoWindows[n];a.close()},e.showInfoWindow=o.map.showInfoWindow,e.hideInfoWindow=o.map.hideInfoWindow;var m=d.mapId?{id:d.mapId}:0;i.getMap(m).then(function(t){if(d.visible&&d.__open(t,e),d.visibleOnMarker){var n=d.visibleOnMarker;d.__open(t,e,t.markers[n])}})};return{restrict:"E",require:["?^map","?^ngMap"],link:c}};e.$inject=["Attr2MapOptions","$compile","$q","$templateRequest","$timeout","$parse","NgMap"],angular.module("ngMap").directive("infoWindow",e)}(),function(){"use strict";angular.module("ngMap").directive("kmlLayer",["Attr2MapOptions",function(e){var t=e,n=function(e,t){var n=new google.maps.KmlLayer(e);for(var o in t)google.maps.event.addListener(n,o,t[o]);return n};return{restrict:"E",require:["?^map","?^ngMap"],link:function(e,o,a,r){r=r[0]||r[1];var i=t.orgAttributes(o),s=t.filter(a),p=t.getOptions(s,{scope:e}),c=t.getEvents(e,s),u=n(p,c);r.addObject("kmlLayers",u),r.observeAttrSetObj(i,a,u),o.bind("$destroy",function(){r.deleteObject("kmlLayers",u)})}}}])}(),function(){"use strict";angular.module("ngMap").directive("mapData",["Attr2MapOptions","NgMap",function(e,t){var n=e;return{restrict:"E",require:["?^map","?^ngMap"],link:function(e,o,a,r){r=r[0]||r[1];var i=n.filter(a),s=n.getOptions(i,{scope:e}),p=n.getEvents(e,i,p);t.getMap(r.map.id).then(function(t){for(var n in s){var o=s[n];"function"==typeof e[o]?t.data[n](e[o]):t.data[n](o)}for(var a in p)t.data.addListener(a,p[a])})}}}])}(),function(){"use strict";var e,t,n,o=[],a=[],r=function(n,r,i){var s=i.mapLazyLoadParams||i.mapLazyLoad;if(void 0===window.google||void 0===window.google.maps){a.push({scope:n,element:r,savedHtml:o[a.length]}),window.lazyLoadCallback=function(){e(function(){a.forEach(function(e){e.element.html(e.savedHtml),t(e.element.contents())(e.scope)})},100)};var p=document.createElement("script");p.src=s+(s.indexOf("?")>-1?"&":"?")+"callback=lazyLoadCallback",document.querySelector('script[src="'+p.src+'"]')||document.body.appendChild(p)}else r.html(o),t(r.contents())(n)},i=function(e,t){return!t.mapLazyLoad&&void 0,o.push(e.html()),n=t.mapLazyLoad,void 0!==window.google&&void 0!==window.google.maps?!1:(e.html(""),{pre:r})},s=function(n,o){return t=n,e=o,{compile:i}};s.$inject=["$compile","$timeout"],angular.module("ngMap").directive("mapLazyLoad",s)}(),function(){"use strict";angular.module("ngMap").directive("mapType",["$parse","NgMap",function(e,t){return{restrict:"E",require:["?^map","?^ngMap"],link:function(n,o,a,r){r=r[0]||r[1];var i,s=a.name;if(!s)throw"invalid map-type name";if(i=e(a.object)(n),!i)throw"invalid map-type object";t.getMap().then(function(e){e.mapTypes.set(s,i)}),r.addObject("mapTypes",i)}}}])}(),function(){"use strict";var e=function(){return{restrict:"AE",controller:"__MapController",controllerAs:"ngmap"}};angular.module("ngMap").directive("map",[e]),angular.module("ngMap").directive("ngMap",[e])}(),function(){"use strict";angular.module("ngMap").directive("mapsEngineLayer",["Attr2MapOptions",function(e){var t=e,n=function(e,t){var n=new google.maps.visualization.MapsEngineLayer(e);for(var o in t)google.maps.event.addListener(n,o,t[o]);return n};return{restrict:"E",require:["?^map","?^ngMap"],link:function(e,o,a,r){r=r[0]||r[1];var i=t.filter(a),s=t.getOptions(i,{scope:e}),p=t.getEvents(e,i,p),c=n(s,p);r.addObject("mapsEngineLayers",c)}}}])}(),function(){"use strict";var e,t,n,o=function(e,t){var o;if(n.defaultOptions.marker)for(var a in n.defaultOptions.marker)"undefined"==typeof e[a]&&(e[a]=n.defaultOptions.marker[a]);e.position instanceof google.maps.LatLng||(e.position=new google.maps.LatLng(0,0)),o=new google.maps.Marker(e),Object.keys(t).length>0;for(var r in t)r&&google.maps.event.addListener(o,r,t[r]);return o},a=function(a,r,i,s){s=s[0]||s[1];var p,c=e.orgAttributes(r),u=e.filter(i),l=e.getOptions(u,a,{scope:a}),g=e.getEvents(a,u);l.position instanceof google.maps.LatLng||(p=l.position);var d=o(l,g);s.addObject("markers",d),p&&n.getGeoLocation(p).then(function(e){d.setPosition(e),l.centered&&d.map.setCenter(e);var n=i.geoCallback;n&&t(n)(a)}),s.observeAttrSetObj(c,i,d),r.bind("$destroy",function(){s.deleteObject("markers",d)})},r=function(o,r,i){return e=o,t=r,n=i,{restrict:"E",require:["^?map","?^ngMap"],link:a}};r.$inject=["Attr2MapOptions","$parse","NgMap"],angular.module("ngMap").directive("marker",r)}(),function(){"use strict";angular.module("ngMap").directive("overlayMapType",["NgMap",function(e){return{restrict:"E",require:["?^map","?^ngMap"],link:function(t,n,o,a){a=a[0]||a[1];var r=o.initMethod||"insertAt",i=t[o.object];e.getMap().then(function(e){if("insertAt"==r){var t=parseInt(o.index,10);e.overlayMapTypes.insertAt(t,i)}else"push"==r&&e.overlayMapTypes.push(i)}),a.addObject("overlayMapTypes",i)}}}])}(),function(){"use strict";var e=function(e,t){var n=e,o=function(e,o,a,r){if("false"===a.placesAutoComplete)return!1;var i=n.filter(a),s=n.getOptions(i,{scope:e}),p=n.getEvents(e,i),c=new google.maps.places.Autocomplete(o[0],s);for(var u in p)google.maps.event.addListener(c,u,p[u]);var l=function(){t(function(){r&&r.$setViewValue(o.val())},100)};google.maps.event.addListener(c,"place_changed",l),o[0].addEventListener("change",l),a.$observe("types",function(e){if(e){var t=n.toOptionValue(e,{key:"types"});c.setTypes(t)}}),a.$observe("componentRestrictions",function(t){t&&c.setComponentRestrictions(e.$eval(t))})};return{restrict:"A",require:"?ngModel",link:o}};e.$inject=["Attr2MapOptions","$timeout"],angular.module("ngMap").directive("placesAutoComplete",e)}(),function(){"use strict";var e=function(e,t){var n,o=e.name;switch(delete e.name,o){case"circle":e.center instanceof google.maps.LatLng||(e.center=new google.maps.LatLng(0,0)),n=new google.maps.Circle(e);break;case"polygon":n=new google.maps.Polygon(e);break;case"polyline":n=new google.maps.Polyline(e);break;case"rectangle":n=new google.maps.Rectangle(e);break;case"groundOverlay":case"image":var a=e.url,r={opacity:e.opacity,clickable:e.clickable,id:e.id};n=new google.maps.GroundOverlay(a,e.bounds,r)}for(var i in t)t[i]&&google.maps.event.addListener(n,i,t[i]);return n},t=function(t,n,o){var a=t,r=function(t,r,i,s){s=s[0]||s[1];var p,c,u=a.orgAttributes(r),l=a.filter(i),g=a.getOptions(l,{scope:t}),d=a.getEvents(t,l);c=g.name,g.center instanceof google.maps.LatLng||(p=g.center);var m=e(g,d);s.addObject("shapes",m),p&&"circle"==c&&o.getGeoLocation(p).then(function(e){m.setCenter(e),m.centered&&m.map.setCenter(e);var o=i.geoCallback;o&&n(o)(t)}),s.observeAttrSetObj(u,i,m),r.bind("$destroy",function(){s.deleteObject("shapes",m)})};return{restrict:"E",require:["?^map","?^ngMap"],link:r}};t.$inject=["Attr2MapOptions","$parse","NgMap"],angular.module("ngMap").directive("shape",t)}(),function(){"use strict";var e=function(e,t){var n=e,o=function(e,t,n){var o,a;t.container&&(a=document.getElementById(t.container),a=a||document.querySelector(t.container)),a?o=new google.maps.StreetViewPanorama(a,t):(o=e.getStreetView(),o.setOptions(t));for(var r in n)r&&google.maps.event.addListener(o,r,n[r]);return o},a=function(e,a,r){var i=n.filter(r),s=n.getOptions(i,{scope:e}),p=n.getControlOptions(i),c=angular.extend(s,p),u=n.getEvents(e,i);t.getMap().then(function(e){var t=o(e,c,u);e.setStreetView(t),!t.getPosition()&&t.setPosition(e.getCenter()),google.maps.event.addListener(t,"position_changed",function(){t.getPosition()!==e.getCenter()&&e.setCenter(t.getPosition())});var n=google.maps.event.addListener(e,"center_changed",function(){t.setPosition(e.getCenter()),google.maps.event.removeListener(n)})})};return{restrict:"E",require:["?^map","?^ngMap"],link:a}};e.$inject=["Attr2MapOptions","NgMap"],angular.module("ngMap").directive("streetViewPanorama",e)}(),function(){"use strict";angular.module("ngMap").directive("trafficLayer",["Attr2MapOptions",function(e){var t=e,n=function(e,t){var n=new google.maps.TrafficLayer(e);for(var o in t)google.maps.event.addListener(n,o,t[o]);return n};return{restrict:"E",require:["?^map","?^ngMap"],link:function(e,o,a,r){r=r[0]||r[1];var i=t.orgAttributes(o),s=t.filter(a),p=t.getOptions(s,{scope:e}),c=t.getEvents(e,s),u=n(p,c);r.addObject("trafficLayers",u),r.observeAttrSetObj(i,a,u),o.bind("$destroy",function(){r.deleteObject("trafficLayers",u)})}}}])}(),function(){"use strict";angular.module("ngMap").directive("transitLayer",["Attr2MapOptions",function(e){var t=e,n=function(e,t){var n=new google.maps.TransitLayer(e);for(var o in t)google.maps.event.addListener(n,o,t[o]);return n};return{restrict:"E",require:["?^map","?^ngMap"],link:function(e,o,a,r){r=r[0]||r[1];var i=t.orgAttributes(o),s=t.filter(a),p=t.getOptions(s,{scope:e}),c=t.getEvents(e,s),u=n(p,c);r.addObject("transitLayers",u),r.observeAttrSetObj(i,a,u),o.bind("$destroy",function(){r.deleteObject("transitLayers",u)})}}}])}(),function(){"use strict";var e=/([\:\-\_]+(.))/g,t=/^moz([A-Z])/,n=function(){return function(n){return n.replace(e,function(e,t,n,o){return o?n.toUpperCase():n}).replace(t,"Moz$1")}};angular.module("ngMap").filter("camelCase",n)}(),function(){"use strict";var e=function(){return function(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}};angular.module("ngMap").filter("escapeRegexp",e)}(),function(){"use strict";var e=function(){return function(e){try{return JSON.parse(e),e}catch(t){return e.replace(/([\$\w]+)\s*:/g,function(e,t){return'"'+t+'":'}).replace(/'([^']+)'/g,function(e,t){return'"'+t+'"'}).replace(/''/g,'""')}}};angular.module("ngMap").filter("jsonize",e)}(),function(){"use strict";var isoDateRE=/^(\d{4}\-\d\d\-\d\d([tT][\d:\.]*)?)([zZ]|([+\-])(\d\d):?(\d\d))?$/,Attr2MapOptions=function($parse,$timeout,$log,$interpolate,NavigatorGeolocation,GeoCoder,camelCaseFilter,jsonizeFilter,escapeRegExp){var exprStartSymbol=$interpolate.startSymbol(),exprEndSymbol=$interpolate.endSymbol(),orgAttributes=function(e){e.length>0&&(e=e[0]);for(var t={},n=0;n<e.attributes.length;n++){var o=e.attributes[n];t[o.name]=o.value}return t},getJSON=function(e){var t=/^[\+\-]?[0-9\.]+,[ ]*\ ?[\+\-]?[0-9\.]+$/;return e.match(t)&&(e="["+e+"]"),JSON.parse(jsonizeFilter(e))},getLatLng=function(e){var t=e;if(e[0].constructor==Array)if(e[0][0].constructor==Array&&2==e[0][0].length||e[0][0].constructor==Object){for(var n,o=[],a=0;a<e.length;a++)n=e[a].map(function(e){return new google.maps.LatLng(e[0],e[1])}),o.push(n);t=o}else t=e.map(function(e){return new google.maps.LatLng(e[0],e[1])});else!isNaN(parseFloat(e[0]))&&isFinite(e[0])&&(t=new google.maps.LatLng(t[0],t[1]));return t},toOptionValue=function(input,options){var output;try{output=getNumber(input)}catch(err){try{var output=getJSON(input);if(output instanceof Array)output=output[0].constructor==Object?output:output[0]instanceof Array?output[0][0].constructor==Object?output:getLatLng(output):getLatLng(output);else if(output===Object(output)){var newOptions=options;newOptions.doNotConverStringToNumber=!0,output=getOptions(output,newOptions)}}catch(err2){if(input.match(/^[A-Z][a-zA-Z0-9]+\(.*\)$/))try{var exp="new google.maps."+input;output=eval(exp)}catch(e){output=input}else if(input.match(/^([A-Z][a-zA-Z0-9]+)\.([A-Z]+)$/))try{var matches=input.match(/^([A-Z][a-zA-Z0-9]+)\.([A-Z]+)$/);output=google.maps[matches[1]][matches[2]]}catch(e){output=input}else if(input.match(/^[A-Z]+$/))try{var capitalizedKey=options.key.charAt(0).toUpperCase()+options.key.slice(1);options.key.match(/temperatureUnit|windSpeedUnit|labelColor/)?(capitalizedKey=capitalizedKey.replace(/s$/,""),output=google.maps.weather[capitalizedKey][input]):output=google.maps[capitalizedKey][input]}catch(e){output=input}else if(input.match(isoDateRE))try{output=new Date(input)}catch(e){output=input}else if(input.match(new RegExp("^"+escapeRegExp(exprStartSymbol)))&&options.scope)try{var expr=input.replace(new RegExp(escapeRegExp(exprStartSymbol)),"").replace(new RegExp(escapeRegExp(exprEndSymbol),"g"),"");output=options.scope.$eval(expr)}catch(err){output=input}else output=input}}if(("center"==options.key||"position"==options.key)&&output instanceof Array&&(output=new google.maps.LatLng(output[0],output[1])),"bounds"==options.key&&output instanceof Array&&(output=new google.maps.LatLngBounds(output[0],output[1])),"icons"==options.key&&output instanceof Array)for(var i=0;i<output.length;i++){var el=output[i];el.icon.path.match(/^[A-Z_]+$/)&&(el.icon.path=google.maps.SymbolPath[el.icon.path])}if("icon"==options.key&&output instanceof Object){(""+output.path).match(/^[A-Z_]+$/)&&(output.path=google.maps.SymbolPath[output.path]);for(var key in output){var arr=output[key];"anchor"==key||"origin"==key||"labelOrigin"==key?output[key]=new google.maps.Point(arr[0],arr[1]):("size"==key||"scaledSize"==key)&&(output[key]=new google.maps.Size(arr[0],arr[1]))}}return output},getAttrsToObserve=function(e){var t=[],n=new RegExp(escapeRegExp(exprStartSymbol)+".*"+escapeRegExp(exprEndSymbol),"g");if(!e.noWatcher)for(var o in e){var a=e[o];a&&a.match(n)&&t.push(camelCaseFilter(o))}return t},filter=function(e){var t={};for(var n in e)n.match(/^\$/)||n.match(/^ng[A-Z]/)||(t[n]=e[n]);return t},getOptions=function(e,t){t=t||{};var n={};for(var o in e)if(e[o]||0===e[o]){if(o.match(/^on[A-Z]/))continue;if(o.match(/ControlOptions$/))continue;n[o]="string"!=typeof e[o]?e[o]:t.doNotConverStringToNumber&&e[o].match(/^[0-9]+$/)?e[o]:toOptionValue(e[o],{key:o,scope:t.scope})}return n},getEvents=function(e,t){var n={},o=function(e){return"_"+e.toLowerCase()},a=function(t){var n=t.match(/([^\(]+)\(([^\)]*)\)/),o=n[1],a=n[2].replace(/event[ ,]*/,""),r=$parse("["+a+"]");return function(t){function n(e,t){return e[t]}var a=r(e),i=o.split(".").reduce(n,e);i&&i.apply(this,[t].concat(a)),$timeout(function(){e.$apply()})}};for(var r in t)if(t[r]){if(!r.match(/^on[A-Z]/))continue;var i=r.replace(/^on/,"");i=i.charAt(0).toLowerCase()+i.slice(1),i=i.replace(/([A-Z])/g,o);var s=t[r];n[i]=new a(s)}return n},getControlOptions=function(e){var t={};if("object"!=typeof e)return!1;for(var n in e)if(e[n]){if(!n.match(/(.*)ControlOptions$/))continue;var o=e[n],a=o.replace(/'/g,'"');a=a.replace(/([^"]+)|("[^"]+")/g,function(e,t,n){return t?t.replace(/([a-zA-Z0-9]+?):/g,'"$1":'):n});try{var r=JSON.parse(a);for(var i in r)if(r[i]){var s=r[i];if("string"==typeof s?s=s.toUpperCase():"mapTypeIds"===i&&(s=s.map(function(e){return e.match(/^[A-Z]+$/)?google.maps.MapTypeId[e.toUpperCase()]:e})),"style"===i){var p=n.charAt(0).toUpperCase()+n.slice(1),c=p.replace(/Options$/,"")+"Style";r[i]=google.maps[c][s]}else r[i]="position"===i?google.maps.ControlPosition[s]:s}t[n]=r}catch(u){}}return t};return{filter:filter,getOptions:getOptions,getEvents:getEvents,getControlOptions:getControlOptions,toOptionValue:toOptionValue,getAttrsToObserve:getAttrsToObserve,orgAttributes:orgAttributes}};Attr2MapOptions.$inject=["$parse","$timeout","$log","$interpolate","NavigatorGeolocation","GeoCoder","camelCaseFilter","jsonizeFilter","escapeRegexpFilter"],angular.module("ngMap").service("Attr2MapOptions",Attr2MapOptions)}(),function(){"use strict";var e,t=function(t){var n=e.defer(),o=new google.maps.Geocoder;return o.geocode(t,function(e,t){t==google.maps.GeocoderStatus.OK?n.resolve(e):n.reject(t)}),n.promise},n=function(n){return e=n,{geocode:t}};n.$inject=["$q"],angular.module("ngMap").service("GeoCoder",n)}(),function(){"use strict";var e,t,n=function(n,o){return e=n,t=o,{load:function(n){var o=e.defer();if(void 0===window.google||void 0===window.google.maps){window.lazyLoadCallback=function(){t(function(){o.resolve(window.google)},100)};var a=document.createElement("script");a.src=n+(n.indexOf("?")>-1?"&":"?")+"callback=lazyLoadCallback",document.querySelector('script[src="'+a.src+'"]')||document.body.appendChild(a)}else o.resolve(window.google);return o.promise}}};n.$inject=["$q","$timeout"],angular.module("ngMap").service("GoogleMapsApi",n)}(),function(){"use strict";var e,t=function(t){var n=e.defer();return navigator.geolocation?(void 0===t?t={timeout:5e3}:void 0===t.timeout&&(t.timeout=5e3),navigator.geolocation.getCurrentPosition(function(e){n.resolve(e)},function(e){n.reject(e)},t)):n.reject("Browser Geolocation service failed."),n.promise},n=function(n){return e=n,{getCurrentPosition:t}};n.$inject=["$q"],angular.module("ngMap").service("NavigatorGeolocation",n)}(),function(){"use strict";var e,t,n,o=[],a=function(n){var a=t.createElement("div");a.style.width="100%",a.style.height="100%",n.appendChild(a);var r=new e.google.maps.Map(a,{});return o.push(r),r},r=function(e,t){for(var n,a=0;a<o.length;a++){var r=o[a];if(r.id==t&&!r.inUse){var i=r.getDiv();e.appendChild(i),n=r;break}}return n},i=function(e){for(var t,n=0;n<o.length;n++){var a=o[n];if(!a.id&&!a.inUse){var r=a.getDiv();e.appendChild(r),t=a;break}}return t},s=function(e){var t=r(e,e.id)||i(e);return t?n(function(){google.maps.event.trigger(t,"idle")},100):t=a(e),t.inUse=!0,t},p=function(e){e.inUse=!1},c=function(){for(var e=0;e<o.length;e++)o[e]=null;o=[]},u=function(e){for(var t=0;t<o.length;t++)null!==o[t]&&o[t].id==e&&(o[t]=null,o.splice(t,1))},l=function(a,r,i){return t=a[0],e=r,n=i,{mapInstances:o,resetMapInstances:c,getMapInstance:s,returnMapInstance:p,deleteMapInstance:u}};l.$inject=["$document","$window","$timeout"],angular.module("ngMap").factory("NgMapPool",l)}(),function(){"use strict";var e,t,n,o,a,r,i,s,p={},c=function(n,o){var a;return n.currentStyle?a=n.currentStyle[o]:e.getComputedStyle&&(a=t.defaultView.getComputedStyle(n,null).getPropertyValue(o)),a},u=function(e){var t=p[e||0];return t.map instanceof google.maps.Map?void 0:(t.initializeMap(),t.map)},l=function(t,o){function a(n){var o=Object.keys(p),s=p[o[0]];
t&&p[t]?r.resolve(p[t].map):!t&&s&&s.map?r.resolve(s.map):n>i?r.reject("could not find map"):e.setTimeout(function(){a(n+100)},100)}o=o||{},t="object"==typeof t?t.id:t;var r=n.defer(),i=o.timeout||1e4;return a(0),r.promise},g=function(e){if(e.map){var t=Object.keys(p).length;p[e.map.id||t]=e}},d=function(e){var t=Object.keys(p).length-1,n=e.map.id||t;if(e.map){for(var o in e.eventListeners){var a=e.eventListeners[o];google.maps.event.removeListener(a)}e.map.controls&&e.map.controls.forEach(function(e){e.clear()})}e.map.heatmapLayers&&Object.keys(e.map.heatmapLayers).forEach(function(t){e.deleteObject("heatmapLayers",e.map.heatmapLayers[t])}),s.deleteMapInstance(n),delete p[n]},m=function(e,t){var a=n.defer();return!e||e.match(/^current/i)?o.getCurrentPosition(t).then(function(e){var t=e.coords.latitude,n=e.coords.longitude,o=new google.maps.LatLng(t,n);a.resolve(o)},function(e){a.reject(e)}):r.geocode({address:e}).then(function(e){a.resolve(e[0].geometry.location)},function(e){a.reject(e)}),a.promise},f=function(e,t){return function(n){if(n){var o=i("set-"+e),r=a.toOptionValue(n,{key:e});t[o]&&(e.match(/center|position/)&&"string"==typeof r?m(r).then(function(e){t[o](e)}):t[o](r))}}},v=function(e){var t=e.getAttribute("default-style");"true"==t?(e.style.display="block",e.style.height="300px"):("block"!=c(e,"display")&&(e.style.display="block"),c(e,"height").match(/^(0|auto)/)&&(e.style.height="300px"))};angular.module("ngMap").provider("NgMap",function(){var p={};this.setDefaultOptions=function(e){p=e};var c=function(c,y,h,b,M,O,w,L){return e=c,t=y[0],n=h,o=b,a=M,r=O,i=w,s=L,{defaultOptions:p,addMap:g,deleteMap:d,getMap:l,initMap:u,setStyle:v,getGeoLocation:m,observeAndSet:f}};c.$inject=["$window","$document","$q","NavigatorGeolocation","Attr2MapOptions","GeoCoder","camelCaseFilter","NgMapPool"],this.$get=c})}(),function(){"use strict";var e,t=function(t,n){n=n||t.getCenter();var o=e.defer(),a=new google.maps.StreetViewService;return a.getPanoramaByLocation(n||t.getCenter,100,function(e,t){t===google.maps.StreetViewStatus.OK?o.resolve(e.location.pano):o.resolve(!1)}),o.promise},n=function(e,t){var n=new google.maps.StreetViewPanorama(e.getDiv(),{enableCloseButton:!0});n.setPano(t)},o=function(o){return e=o,{getPanorama:t,setPanorama:n}};o.$inject=["$q"],angular.module("ngMap").service("StreetView",o)}(),"ngMap"});

/***/ }),
/* 113 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
 * angular-translate - v2.15.2 - 2017-06-22
 * 
 * Copyright (c) 2017 The angular-translate team, Pascal Precht; Licensed MIT
 */
!function(a,b){ true?!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function(){return b()}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)):"object"==typeof module&&module.exports?module.exports=b():b()}(0,function(){function a(a){"use strict";var b=a.storageKey(),c=a.storage(),d=function(){var d=a.preferredLanguage();angular.isString(d)?a.use(d):c.put(b,a.use())};d.displayName="fallbackFromIncorrectStorageValue",c?c.get(b)?a.use(c.get(b)).catch(d):d():angular.isString(a.preferredLanguage())&&a.use(a.preferredLanguage())}function b(){"use strict";var a,b,c,d=null,e=!1,f=!1;c={sanitize:function(a,b){return"text"===b&&(a=h(a)),a},escape:function(a,b){return"text"===b&&(a=g(a)),a},sanitizeParameters:function(a,b){return"params"===b&&(a=j(a,h)),a},escapeParameters:function(a,b){return"params"===b&&(a=j(a,g)),a},sce:function(a,b,c){return"text"===b?a=i(a):"params"===b&&"filter"!==c&&(a=j(a,g)),a},sceParameters:function(a,b){return"params"===b&&(a=j(a,i)),a}},c.escaped=c.escapeParameters,this.addStrategy=function(a,b){return c[a]=b,this},this.removeStrategy=function(a){return delete c[a],this},this.useStrategy=function(a){return e=!0,d=a,this},this.$get=["$injector","$log",function(g,h){var i={},j=function(a,b,d,e){return angular.forEach(e,function(e){if(angular.isFunction(e))a=e(a,b,d);else if(angular.isFunction(c[e]))a=c[e](a,b,d);else{if(!angular.isString(c[e]))throw new Error("pascalprecht.translate.$translateSanitization: Unknown sanitization strategy: '"+e+"'");if(!i[c[e]])try{i[c[e]]=g.get(c[e])}catch(a){throw i[c[e]]=function(){},new Error("pascalprecht.translate.$translateSanitization: Unknown sanitization strategy: '"+e+"'")}a=i[c[e]](a,b,d)}}),a},k=function(){e||f||(h.warn("pascalprecht.translate.$translateSanitization: No sanitization strategy has been configured. This can have serious security implications. See http://angular-translate.github.io/docs/#/guide/19_security for details."),f=!0)};return g.has("$sanitize")&&(a=g.get("$sanitize")),g.has("$sce")&&(b=g.get("$sce")),{useStrategy:function(a){return function(b){a.useStrategy(b)}}(this),sanitize:function(a,b,c,e){if(d||k(),c||null===c||(c=d),!c)return a;e||(e="service");var f=angular.isArray(c)?c:[c];return j(a,b,e,f)}}}];var g=function(a){var b=angular.element("<div></div>");return b.text(a),b.html()},h=function(b){if(!a)throw new Error("pascalprecht.translate.$translateSanitization: Error cannot find $sanitize service. Either include the ngSanitize module (https://docs.angularjs.org/api/ngSanitize) or use a sanitization strategy which does not depend on $sanitize, such as 'escape'.");return a(b)},i=function(a){if(!b)throw new Error("pascalprecht.translate.$translateSanitization: Error cannot find $sce service.");return b.trustAsHtml(a)},j=function(a,b,c){if(angular.isDate(a))return a;if(angular.isObject(a)){var d=angular.isArray(a)?[]:{};if(c){if(c.indexOf(a)>-1)throw new Error("pascalprecht.translate.$translateSanitization: Error cannot interpolate parameter due recursive object")}else c=[];return c.push(a),angular.forEach(a,function(a,e){angular.isFunction(a)||(d[e]=j(a,b,c))}),c.splice(-1,1),d}return angular.isNumber(a)?a:!0===a||!1===a?a:angular.isUndefined(a)||null===a?a:b(a)}}function c(a,b,c,d){"use strict";var e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u={},v=[],w=a,x=[],y="translate-cloak",z=!1,A=!1,B=".",C=!1,D=!1,E=0,F=!0,G="default",H={default:function(a){return(a||"").split("-").join("_")},java:function(a){var b=(a||"").split("-").join("_"),c=b.split("_");return c.length>1?c[0].toLowerCase()+"_"+c[1].toUpperCase():b},bcp47:function(a){var b=(a||"").split("_").join("-"),c=b.split("-");return c.length>1?c[0].toLowerCase()+"-"+c[1].toUpperCase():b},"iso639-1":function(a){return(a||"").split("_").join("-").split("-")[0].toLowerCase()}},I=function(){if(angular.isFunction(d.getLocale))return d.getLocale();var a,c,e=b.$get().navigator,f=["language","browserLanguage","systemLanguage","userLanguage"];if(angular.isArray(e.languages))for(a=0;a<e.languages.length;a++)if((c=e.languages[a])&&c.length)return c;for(a=0;a<f.length;a++)if((c=e[f[a]])&&c.length)return c;return null};I.displayName="angular-translate/service: getFirstBrowserLanguage";var J=function(){var a=I()||"";return H[G]&&(a=H[G](a)),a};J.displayName="angular-translate/service: getLocale";var K=function(a,b){for(var c=0,d=a.length;c<d;c++)if(a[c]===b)return c;return-1},L=function(){return this.toString().replace(/^\s+|\s+$/g,"")},M=function(a){if(a){for(var b=[],c=angular.lowercase(a),d=0,e=v.length;d<e;d++)b.push(angular.lowercase(v[d]));if(K(b,c)>-1)return a;if(f){var g;for(var h in f)if(f.hasOwnProperty(h)){var i=!1,j=Object.prototype.hasOwnProperty.call(f,h)&&angular.lowercase(h)===angular.lowercase(a);if("*"===h.slice(-1)&&(i=h.slice(0,-1)===a.slice(0,h.length-1)),(j||i)&&(g=f[h],K(b,angular.lowercase(g))>-1))return g}}var k=a.split("_");return k.length>1&&K(b,angular.lowercase(k[0]))>-1?k[0]:void 0}},N=function(a,b){if(!a&&!b)return u;if(a&&!b){if(angular.isString(a))return u[a]}else angular.isObject(u[a])||(u[a]={}),angular.extend(u[a],O(b));return this};this.translations=N,this.cloakClassName=function(a){return a?(y=a,this):y},this.nestedObjectDelimeter=function(a){return a?(B=a,this):B};var O=function(a,b,c,d){var e,f,g,h;b||(b=[]),c||(c={});for(e in a)Object.prototype.hasOwnProperty.call(a,e)&&(h=a[e],angular.isObject(h)?O(h,b.concat(e),c,e):(f=b.length?""+b.join(B)+B+e:e,b.length&&e===d&&(g=""+b.join(B),c[g]="@:"+f),c[f]=h));return c};O.displayName="flatObject",this.addInterpolation=function(a){return x.push(a),this},this.useMessageFormatInterpolation=function(){return this.useInterpolation("$translateMessageFormatInterpolation")},this.useInterpolation=function(a){return n=a,this},this.useSanitizeValueStrategy=function(a){return c.useStrategy(a),this},this.preferredLanguage=function(a){return a?(P(a),this):e};var P=function(a){return a&&(e=a),e};this.translationNotFoundIndicator=function(a){return this.translationNotFoundIndicatorLeft(a),this.translationNotFoundIndicatorRight(a),this},this.translationNotFoundIndicatorLeft=function(a){return a?(q=a,this):q},this.translationNotFoundIndicatorRight=function(a){return a?(r=a,this):r},this.fallbackLanguage=function(a){return Q(a),this};var Q=function(a){return a?(angular.isString(a)?(h=!0,g=[a]):angular.isArray(a)&&(h=!1,g=a),angular.isString(e)&&K(g,e)<0&&g.push(e),this):h?g[0]:g};this.use=function(a){if(a){if(!u[a]&&!o)throw new Error("$translateProvider couldn't find translationTable for langKey: '"+a+"'");return i=a,this}return i},this.resolveClientLocale=function(){return J()};var R=function(a){return a?(w=a,this):l?l+w:w};this.storageKey=R,this.useUrlLoader=function(a,b){return this.useLoader("$translateUrlLoader",angular.extend({url:a},b))},this.useStaticFilesLoader=function(a){return this.useLoader("$translateStaticFilesLoader",a)},this.useLoader=function(a,b){return o=a,p=b||{},this},this.useLocalStorage=function(){return this.useStorage("$translateLocalStorage")},this.useCookieStorage=function(){return this.useStorage("$translateCookieStorage")},this.useStorage=function(a){return k=a,this},this.storagePrefix=function(a){return a?(l=a,this):a},this.useMissingTranslationHandlerLog=function(){return this.useMissingTranslationHandler("$translateMissingTranslationHandlerLog")},this.useMissingTranslationHandler=function(a){return m=a,this},this.usePostCompiling=function(a){return z=!!a,this},this.forceAsyncReload=function(a){return A=!!a,this},this.uniformLanguageTag=function(a){return a?angular.isString(a)&&(a={standard:a}):a={},G=a.standard,this},this.determinePreferredLanguage=function(a){var b=a&&angular.isFunction(a)?a():J();return e=v.length?M(b)||b:b,this},this.registerAvailableLanguageKeys=function(a,b){return a?(v=a,b&&(f=b),this):v},this.useLoaderCache=function(a){return!1===a?s=void 0:!0===a?s=!0:void 0===a?s="$translationCache":a&&(s=a),this},this.directivePriority=function(a){return void 0===a?E:(E=a,this)},this.statefulFilter=function(a){return void 0===a?F:(F=a,this)},this.postProcess=function(a){return t=a||void 0,this},this.keepContent=function(a){return D=!!a,this},this.$get=["$log","$injector","$rootScope","$q",function(a,b,c,d){var f,l,G,H=b.get(n||"$translateDefaultInterpolation"),I=!1,S={},T={},U=function(a,b,c,h,j){!i&&e&&(i=e);var m=j&&j!==i?M(j)||j:i;if(j&&ja(j),angular.isArray(a)){return function(a){for(var e={},f=[],g=0,i=a.length;g<i;g++)f.push(function(a){var f=d.defer(),g=function(b){e[a]=b,f.resolve([a,b])};return U(a,b,c,h,j).then(g,g),f.promise}(a[g]));return d.all(f).then(function(){return e})}(a)}var n=d.defer();a&&(a=L.apply(a));var o=function(){var a=e?T[e]:T[m];if(l=0,k&&!a){var b=f.get(w);if(a=T[b],g&&g.length){var c=K(g,b);l=0===c?1:0,K(g,e)<0&&g.push(e)}}return a}();if(o){var p=function(){j||(m=i),fa(a,b,c,h,m).then(n.resolve,n.reject)};p.displayName="promiseResolved",o.finally(p).catch(angular.noop)}else fa(a,b,c,h,m).then(n.resolve,n.reject);return n.promise},V=function(a){return q&&(a=[q,a].join(" ")),r&&(a=[a,r].join(" ")),a},W=function(a){i=a,k&&f.put(U.storageKey(),i),c.$emit("$translateChangeSuccess",{language:a}),H.setLocale(i);var b=function(a,b){S[b].setLocale(i)};b.displayName="eachInterpolatorLocaleSetter",angular.forEach(S,b),c.$emit("$translateChangeEnd",{language:a})},X=function(a){if(!a)throw"No language key specified for loading.";var e=d.defer();c.$emit("$translateLoadingStart",{language:a}),I=!0;var f=s;"string"==typeof f&&(f=b.get(f));var g=angular.extend({},p,{key:a,$http:angular.extend({},{cache:f},p.$http)}),h=function(b){var d={};c.$emit("$translateLoadingSuccess",{language:a}),angular.isArray(b)?angular.forEach(b,function(a){angular.extend(d,O(a))}):angular.extend(d,O(b)),I=!1,e.resolve({key:a,table:d}),c.$emit("$translateLoadingEnd",{language:a})};h.displayName="onLoaderSuccess";var i=function(a){c.$emit("$translateLoadingError",{language:a}),e.reject(a),c.$emit("$translateLoadingEnd",{language:a})};return i.displayName="onLoaderError",b.get(o)(g).then(h,i),e.promise};if(k&&(f=b.get(k),!f.get||!f.put))throw new Error("Couldn't use storage '"+k+"', missing get() or put() method!");if(x.length){var Y=function(a){var c=b.get(a);c.setLocale(e||i),S[c.getInterpolationIdentifier()]=c};Y.displayName="interpolationFactoryAdder",angular.forEach(x,Y)}var Z=function(a){var b=d.defer();if(Object.prototype.hasOwnProperty.call(u,a))b.resolve(u[a]);else if(T[a]){var c=function(a){N(a.key,a.table),b.resolve(a.table)};c.displayName="translationTableResolver",T[a].then(c,b.reject)}else b.reject();return b.promise},$=function(a,b,c,e,f){var g=d.defer(),h=function(d){if(Object.prototype.hasOwnProperty.call(d,b)&&null!==d[b]){e.setLocale(a);var h=d[b];if("@:"===h.substr(0,2))$(a,h.substr(2),c,e,f).then(g.resolve,g.reject);else{var j=e.interpolate(d[b],c,"service",f,b);j=ia(b,d[b],j,c,a),g.resolve(j)}e.setLocale(i)}else g.reject()};return h.displayName="fallbackTranslationResolver",Z(a).then(h,g.reject),g.promise},_=function(a,b,c,d,e){var f,g=u[a];if(g&&Object.prototype.hasOwnProperty.call(g,b)&&null!==g[b]){if(d.setLocale(a),f=d.interpolate(g[b],c,"filter",e,b),f=ia(b,g[b],f,c,a,e),!angular.isString(f)&&angular.isFunction(f.$$unwrapTrustedValue)){var h=f.$$unwrapTrustedValue();if("@:"===h.substr(0,2))return _(a,h.substr(2),c,d,e)}else if("@:"===f.substr(0,2))return _(a,f.substr(2),c,d,e);d.setLocale(i)}return f},aa=function(a,c,d,e){return m?b.get(m)(a,i,c,d,e):a},ba=function(a,b,c,e,f,h){var i=d.defer();if(a<g.length){var j=g[a];$(j,b,c,e,h).then(function(a){i.resolve(a)},function(){return ba(a+1,b,c,e,f,h).then(i.resolve,i.reject)})}else if(f)i.resolve(f);else{var k=aa(b,c,f);m&&k?i.resolve(k):i.reject(V(b))}return i.promise},ca=function(a,b,c,d,e){var f;if(a<g.length){var h=g[a];f=_(h,b,c,d,e),f||""===f||(f=ca(a+1,b,c,d))}return f},da=function(a,b,c,d,e){return ba(G>0?G:l,a,b,c,d,e)},ea=function(a,b,c,d){return ca(G>0?G:l,a,b,c,d)},fa=function(a,b,c,e,f,h){var i=d.defer(),j=f?u[f]:u,k=c?S[c]:H;if(j&&Object.prototype.hasOwnProperty.call(j,a)&&null!==j[a]){var l=j[a];if("@:"===l.substr(0,2))U(l.substr(2),b,c,e,f).then(i.resolve,i.reject);else{var n=k.interpolate(l,b,"service",h,a);n=ia(a,l,n,b,f),i.resolve(n)}}else{var o;m&&!I&&(o=aa(a,b,e)),f&&g&&g.length?da(a,b,k,e,h).then(function(a){i.resolve(a)},function(a){i.reject(V(a))}):m&&!I&&o?e?i.resolve(e):i.resolve(o):e?i.resolve(e):i.reject(V(a))}return i.promise},ga=function(a,b,c,d,e){var f,h=d?u[d]:u,i=H;if(S&&Object.prototype.hasOwnProperty.call(S,c)&&(i=S[c]),h&&Object.prototype.hasOwnProperty.call(h,a)&&null!==h[a]){var j=h[a];"@:"===j.substr(0,2)?f=ga(j.substr(2),b,c,d,e):(f=i.interpolate(j,b,"filter",e,a),f=ia(a,j,f,b,d,e))}else{var k;m&&!I&&(k=aa(a,b,e)),d&&g&&g.length?(l=0,f=ea(a,b,i,e)):f=m&&!I&&k?k:V(a)}return f},ha=function(a){j===a&&(j=void 0),T[a]=void 0},ia=function(a,c,d,e,f,g){var h=t;return h&&("string"==typeof h&&(h=b.get(h)),h)?h(a,c,d,e,f,g):d},ja=function(a){u[a]||!o||T[a]||(T[a]=X(a).then(function(a){return N(a.key,a.table),a}))};U.preferredLanguage=function(a){return a&&P(a),e},U.cloakClassName=function(){return y},U.nestedObjectDelimeter=function(){return B},U.fallbackLanguage=function(a){if(void 0!==a&&null!==a){if(Q(a),o&&g&&g.length)for(var b=0,c=g.length;b<c;b++)T[g[b]]||(T[g[b]]=X(g[b]));U.use(U.use())}return h?g[0]:g},U.useFallbackLanguage=function(a){if(void 0!==a&&null!==a)if(a){var b=K(g,a);b>-1&&(G=b)}else G=0},U.proposedLanguage=function(){return j},U.storage=function(){return f},U.negotiateLocale=M,U.use=function(a){if(!a)return i;var b=d.defer();b.promise.then(null,angular.noop),c.$emit("$translateChangeStart",{language:a});var e=M(a);return v.length>0&&!e?d.reject(a):(e&&(a=e),j=a,!A&&u[a]||!o||T[a]?T[a]?T[a].then(function(a){return j===a.key&&W(a.key),b.resolve(a.key),a},function(a){return!i&&g&&g.length>0&&g[0]!==a?U.use(g[0]).then(b.resolve,b.reject):b.reject(a)}):(b.resolve(a),W(a)):(T[a]=X(a).then(function(c){return N(c.key,c.table),b.resolve(c.key),j===a&&W(c.key),c},function(a){return c.$emit("$translateChangeError",{language:a}),b.reject(a),c.$emit("$translateChangeEnd",{language:a}),d.reject(a)}),T[a].finally(function(){ha(a)}).catch(angular.noop)),b.promise)},U.resolveClientLocale=function(){return J()},U.storageKey=function(){return R()},U.isPostCompilingEnabled=function(){return z},U.isForceAsyncReloadEnabled=function(){return A},U.isKeepContent=function(){return D},U.refresh=function(a){function b(a){var b=X(a);return T[a]=b,b.then(function(b){u[a]={},N(a,b.table),f[a]=!0},angular.noop),b}if(!o)throw new Error("Couldn't refresh translation table, no loader registered!");c.$emit("$translateRefreshStart",{language:a});var e=d.defer(),f={};if(e.promise.then(function(){for(var a in u)u.hasOwnProperty(a)&&(a in f||delete u[a]);i&&W(i)},angular.noop).finally(function(){c.$emit("$translateRefreshEnd",{language:a})}),a)u[a]?b(a).then(e.resolve,e.reject):e.reject();else{var h=g&&g.slice()||[];i&&-1===h.indexOf(i)&&h.push(i),d.all(h.map(b)).then(e.resolve,e.reject)}return e.promise},U.instant=function(a,b,c,d,f){var h=d&&d!==i?M(d)||d:i;if(null===a||angular.isUndefined(a))return a;if(d&&ja(d),angular.isArray(a)){for(var j={},k=0,l=a.length;k<l;k++)j[a[k]]=U.instant(a[k],b,c,d,f);return j}if(angular.isString(a)&&a.length<1)return a;a&&(a=L.apply(a));var n,o=[];e&&o.push(e),h&&o.push(h),g&&g.length&&(o=o.concat(g));for(var p=0,s=o.length;p<s;p++){var t=o[p];if(u[t]&&void 0!==u[t][a]&&(n=ga(a,b,c,h,f)),void 0!==n)break}if(!n&&""!==n)if(q||r)n=V(a);else{n=H.interpolate(a,b,"filter",f);var v;m&&!I&&(v=aa(a,b,f)),m&&!I&&v&&(n=v)}return n},U.versionInfo=function(){return"2.15.2"},U.loaderCache=function(){return s},U.directivePriority=function(){return E},U.statefulFilter=function(){return F},U.isReady=function(){return C};var ka=d.defer();ka.promise.then(function(){C=!0}),U.onReady=function(a){var b=d.defer();return angular.isFunction(a)&&b.promise.then(a),C?b.resolve():ka.promise.then(b.resolve),b.promise},U.getAvailableLanguageKeys=function(){return v.length>0?v:null},U.getTranslationTable=function(a){return a=a||U.use(),a&&u[a]?angular.copy(u[a]):null};var la=c.$on("$translateReady",function(){ka.resolve(),la(),la=null}),ma=c.$on("$translateChangeEnd",function(){ka.resolve(),ma(),ma=null});if(o){if(angular.equals(u,{})&&U.use()&&U.use(U.use()),g&&g.length)for(var na=function(a){return N(a.key,a.table),c.$emit("$translateChangeEnd",{language:a.key}),a},oa=0,pa=g.length;oa<pa;oa++){var qa=g[oa];!A&&u[qa]||(T[qa]=X(qa).then(na))}}else c.$emit("$translateReady",{language:U.use()});return U}]}function d(a,b){"use strict";var c,d={};return d.setLocale=function(a){c=a},d.getInterpolationIdentifier=function(){return"default"},d.useSanitizeValueStrategy=function(a){return b.useStrategy(a),this},d.interpolate=function(c,d,e,f,g){d=d||{},d=b.sanitize(d,"params",f,e);var h;return angular.isNumber(c)?h=""+c:angular.isString(c)?(h=a(c)(d),h=b.sanitize(h,"text",f,e)):h="",h},d}function e(a,b,c,d,e){"use strict";var g=function(){return this.toString().replace(/^\s+|\s+$/g,"")};return{restrict:"AE",scope:!0,priority:a.directivePriority(),compile:function(h,i){var j=i.translateValues?i.translateValues:void 0,k=i.translateInterpolation?i.translateInterpolation:void 0,l=h[0].outerHTML.match(/translate-value-+/i),m="^(.*)("+b.startSymbol()+".*"+b.endSymbol()+")(.*)",n="^(.*)"+b.startSymbol()+"(.*)"+b.endSymbol()+"(.*)";return function(h,o,p){h.interpolateParams={},h.preText="",h.postText="",h.translateNamespace=f(h);var q={},r=function(a){if(angular.isFunction(r._unwatchOld)&&(r._unwatchOld(),r._unwatchOld=void 0),angular.equals(a,"")||!angular.isDefined(a)){var c=g.apply(o.text()),d=c.match(m);if(angular.isArray(d)){h.preText=d[1],h.postText=d[3],q.translate=b(d[2])(h.$parent);var e=c.match(n);angular.isArray(e)&&e[2]&&e[2].length&&(r._unwatchOld=h.$watch(e[2],function(a){q.translate=a,v()}))}else q.translate=c||void 0}else q.translate=a;v()};!function(a,b,c){if(b.translateValues&&angular.extend(a,d(b.translateValues)(h.$parent)),l)for(var e in c)if(Object.prototype.hasOwnProperty.call(b,e)&&"translateValue"===e.substr(0,14)&&"translateValues"!==e){var f=angular.lowercase(e.substr(14,1))+e.substr(15);a[f]=c[e]}}(h.interpolateParams,p,i);var s=!0;p.$observe("translate",function(a){void 0===a?r(""):""===a&&s||(q.translate=a,v()),s=!1});for(var t in p)p.hasOwnProperty(t)&&"translateAttr"===t.substr(0,13)&&t.length>13&&function(a){p.$observe(a,function(b){q[a]=b,v()})}(t);if(p.$observe("translateDefault",function(a){h.defaultText=a,v()}),j&&p.$observe("translateValues",function(a){a&&h.$parent.$watch(function(){angular.extend(h.interpolateParams,d(a)(h.$parent))})}),l){for(var u in p)Object.prototype.hasOwnProperty.call(p,u)&&"translateValue"===u.substr(0,14)&&"translateValues"!==u&&function(a){p.$observe(a,function(b){var c=angular.lowercase(a.substr(14,1))+a.substr(15);h.interpolateParams[c]=b})}(u)}var v=function(){for(var a in q)q.hasOwnProperty(a)&&void 0!==q[a]&&w(a,q[a],h,h.interpolateParams,h.defaultText,h.translateNamespace)},w=function(b,c,d,e,f,g){c?(g&&"."===c.charAt(0)&&(c=g+c),a(c,e,k,f,d.translateLanguage).then(function(a){x(a,d,!0,b)},function(a){x(a,d,!1,b)})):x(c,d,!1,b)},x=function(b,d,e,f){if(e||void 0!==d.defaultText&&(b=d.defaultText),"translate"===f){(e||!e&&!a.isKeepContent()&&void 0===p.translateKeepContent)&&o.empty().append(d.preText+b+d.postText);var g=a.isPostCompilingEnabled(),h=void 0!==i.translateCompile,j=h&&"false"!==i.translateCompile;(g&&!h||j)&&c(o.contents())(d)}else{var k=p.$attr[f];"data-"===k.substr(0,5)&&(k=k.substr(5)),k=k.substr(15),o.attr(k,b)}};(j||l||p.translateDefault)&&h.$watch("interpolateParams",v,!0),h.$on("translateLanguageChanged",v);var y=e.$on("$translateChangeSuccess",v);o.text().length?r(p.translate?p.translate:""):p.translate&&r(p.translate),v(),h.$on("$destroy",y)}}}}function f(a){"use strict";return a.translateNamespace?a.translateNamespace:a.$parent?f(a.$parent):void 0}function g(a,b){"use strict";return{restrict:"A",priority:a.directivePriority(),link:function(c,d,e){var f,g,i={},j=function(){angular.forEach(f,function(b,f){b&&(i[f]=!0,c.translateNamespace&&"."===b.charAt(0)&&(b=c.translateNamespace+b),a(b,g,e.translateInterpolation,void 0,c.translateLanguage).then(function(a){d.attr(f,a)},function(a){d.attr(f,a)}))}),angular.forEach(i,function(a,b){f[b]||(d.removeAttr(b),delete i[b])})};h(c,e.translateAttr,function(a){f=a},j),h(c,e.translateValues,function(a){g=a},j),e.translateValues&&c.$watch(e.translateValues,j,!0),c.$on("translateLanguageChanged",j);var k=b.$on("$translateChangeSuccess",j);j(),c.$on("$destroy",k)}}}function h(a,b,c,d){"use strict";b&&("::"===b.substr(0,2)?b=b.substr(2):a.$watch(b,function(a){c(a),d()},!0),c(a.$eval(b)))}function i(a,b){"use strict";return{compile:function(c){var d=function(b){b.addClass(a.cloakClassName())},e=function(b){b.removeClass(a.cloakClassName())};return d(c),function(c,f,g){var h=e.bind(this,f),i=d.bind(this,f);g.translateCloak&&g.translateCloak.length?(g.$observe("translateCloak",function(b){a(b).then(h,i)}),b.$on("$translateChangeSuccess",function(){a(g.translateCloak).then(h,i)})):a.onReady(h)}}}}function j(){"use strict";return{restrict:"A",scope:!0,compile:function(){return{pre:function(a,b,c){a.translateNamespace=f(a),a.translateNamespace&&"."===c.translateNamespace.charAt(0)?a.translateNamespace+=c.translateNamespace:a.translateNamespace=c.translateNamespace}}}}}function f(a){"use strict";return a.translateNamespace?a.translateNamespace:a.$parent?f(a.$parent):void 0}function k(){"use strict";return{restrict:"A",scope:!0,compile:function(){return function(a,b,c){c.$observe("translateLanguage",function(b){a.translateLanguage=b}),a.$watch("translateLanguage",function(){a.$broadcast("translateLanguageChanged")})}}}}function l(a,b){"use strict";var c=function(c,d,e,f){if(!angular.isObject(d)){var g=this||{__SCOPE_IS_NOT_AVAILABLE:"More info at https://github.com/angular/angular.js/commit/8863b9d04c722b278fa93c5d66ad1e578ad6eb1f"};d=a(d)(g)}return b.instant(c,d,e,f)};return b.statefulFilter()&&(c.$stateful=!0),c}function m(a){"use strict";return a("translations")}return a.$inject=["$translate"],c.$inject=["$STORAGE_KEY","$windowProvider","$translateSanitizationProvider","pascalprechtTranslateOverrider"],d.$inject=["$interpolate","$translateSanitization"],e.$inject=["$translate","$interpolate","$compile","$parse","$rootScope"],g.$inject=["$translate","$rootScope"],i.$inject=["$translate","$rootScope"],l.$inject=["$parse","$translate"],m.$inject=["$cacheFactory"],angular.module("pascalprecht.translate",["ng"]).run(a),a.displayName="runTranslate",angular.module("pascalprecht.translate").provider("$translateSanitization",b),angular.module("pascalprecht.translate").constant("pascalprechtTranslateOverrider",{}).provider("$translate",c),c.displayName="displayName",angular.module("pascalprecht.translate").factory("$translateDefaultInterpolation",d),d.displayName="$translateDefaultInterpolation",angular.module("pascalprecht.translate").constant("$STORAGE_KEY","NG_TRANSLATE_LANG_KEY"),angular.module("pascalprecht.translate").directive("translate",e),e.displayName="translateDirective",angular.module("pascalprecht.translate").directive("translateAttr",g),g.displayName="translateAttrDirective",angular.module("pascalprecht.translate").directive("translateCloak",i),i.displayName="translateCloakDirective",angular.module("pascalprecht.translate").directive("translateNamespace",j),j.displayName="translateNamespaceDirective",angular.module("pascalprecht.translate").directive("translateLanguage",k),k.displayName="translateLanguageDirective",angular.module("pascalprecht.translate").filter("translate",l),l.displayName="translateFilterFactory",angular.module("pascalprecht.translate").factory("$translationCache",m),m.displayName="$translationCache","pascalprecht.translate"});

/***/ })
]),[78]);