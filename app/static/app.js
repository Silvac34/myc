'use strict';
const angular = require('angular');
//css//
//require('./dist/bootstrap.bundle.js');
//require('./css/app.css');
require('font-awesome-webpack!./css/font-awesome/font-awesome.config.js');
//require('./bower_components/font-awesome/css/font-awesome.min.css');
//controllers//
require('./welcome/welcome.js');
require('./viewCreateMeal/viewCreateMeal.js');
require('./viewMeals/viewMeals.js');
require('./viewMeals/viewMealsDtld/viewMealsDtld.js');
require('./viewMyMeals/viewMyMeals.js');
require('./viewMyMeals/viewMyMealsDtld/viewMyMealsDtld.js');
require('./viewLogin/viewLogin.js');
require('./profile/viewProfile.js');
require('./viewLeaveReviews/viewLeaveReviews.js');
require('./viewManageRequests/viewManageRequests.js');
//components//
require('./components/getAgeService.js');
require('./components/currencySymbolService.js');
require('./components/dateDropdownService.js');
require('./components/facebookService.js');
require('./components/getReviewService.js');
require('./components/userServices.js');
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
