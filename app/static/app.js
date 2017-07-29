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
  'angular.filter'
]);

app.config(['$stateProvider', '$httpProvider', '$urlRouterProvider', '$authProvider', 'ENV', 'cfpLoadingBarProvider', 'ezfbProvider', function($stateProvider, $httpProvider, $urlRouterProvider, $authProvider, ENV, cfpLoadingBarProvider, ezfbProvider) {

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
        meal: ['$http', '$stateParams', '$state', function($http, $stateParams, $state) {
          return $http.get('/api/meals/private/' + $stateParams.myMealId).then(function successCallBack(response) {
            return response;
          }, function errorCallback() {
            $state.go("view_meals.mealsList");
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

}]);


app.run(['$rootScope', '$state', '$auth', '$transitions', function($rootScope, $state, $auth, $transitions) {
  $rootScope.$state = $state;
  var matchSuccess = {};

  var matchOnBefore = {
    to: function(state) {
      return state.data != null && state.data.requiredLogin === true;
    }
  };

  $transitions.onBefore(matchOnBefore, function(trans) {
    if ($auth.isAuthenticated() != true) {
      return trans.router.stateService.target("login");
    }
  });

  $transitions.onSuccess(matchSuccess, function($transitions) {
    document.body.scrollTop = document.documentElement.scrollTop = 0;
    $rootScope.fromState = $transitions.$from();
    $rootScope.fromState = $transitions.$to();
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

app.controller('AppCtrl', ['$scope', '$auth', '$state', 'userServicesFactory', '$http', '$rootScope', '$q', '$window', 'ezfb', '$timeout', function($scope, $auth, $state, userServicesFactory, $http, $rootScope, $q, $window, ezfb, $timeout) {

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
        $state.go(toState, toParams);
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
    if ($auth.isAuthenticated()) {
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