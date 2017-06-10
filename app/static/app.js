'use strict';

// Declare app level module which depends on views, and components
var app = angular.module('myApp', [
  'config',
  'ui.bootstrap',
  'ui.router',
  'satellizer',
  'myApp.viewCreateMeal',
  'myApp.viewMeals',
  'myApp.viewMyMeals',
  'myApp.viewLogin',
  'myApp.viewProfile',
  'myApp.welcome',
  'userServices',
  'angular-loading-bar',
  'ezfb',
  'getReviewService',
  'getAgeService'
]);

app.config(['$stateProvider', '$httpProvider', '$urlRouterProvider', '$authProvider', 'ENV', 'cfpLoadingBarProvider', 'ezfbProvider', function($stateProvider, $httpProvider, $urlRouterProvider, $authProvider, ENV, cfpLoadingBarProvider, ezfbProvider) {

  if (!$httpProvider.defaults.headers.get) {
    $httpProvider.defaults.headers.common = {};
  }

  $httpProvider.defaults.headers.common["Cache-Control"] = "no-cache";
  $httpProvider.defaults.headers.common.Pragma = "no-cache"; // ajoute le header à chaque requête http pour que chrome n'utilse pas son cache pour sauvegarder les données (permet d'afficher correctement les pendings requests)
  
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
        response: function($http) {
          /*var date = new Date();
          var now = date.toISOString();*/
          return $http.get('/api/meals' /*?where={"time": {"$gte": "' + now + '"} }'*/ ); //on met en commentaire la requête filtrée pour repas > now
        }
      }
    });
  $stateProvider
    .state('create_meal', {
      url: '/create_meal',
      templateUrl: 'static/viewCreateMeal/viewCreateMeal.html',
      controller: 'ViewCreateMealCtrl',
      data: {
        requiredLogin: true
      }
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
        response: function($http) {
          return $http.get('/api/meals/private');
        }
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
        userResolve: function(userServicesFactory) {
          return userServicesFactory();
        },
        meal: function($http, $stateParams, $state) {
          return $http.get('/api/meals/private/' + $stateParams.myMealId).then(function successCallBack(response) {
            return response;
          }, function errorCallback() {
            $state.go("view_meals.mealsList");
          });
        }
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
      templateUrl: 'static/footer/information/concept/concept.html',
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
      resolve: {
        userInfo: function($http, $stateParams) {
          return $http.get('/api/users/' + $stateParams.userId);
        }
      }
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


app.run(function($rootScope, $state, $auth) {
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

  // enable to get the state in the view
  $rootScope.$state = $state;

});

app.controller('AppCtrl', ['$scope', '$auth', '$state', 'userServicesFactory', '$http', '$rootScope', '$q', '$window', 'ezfb', function($scope, $auth, $state, userServicesFactory, $http, $rootScope, $q, $window, ezfb) {

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
      });
    }
  };

  authVerification();

  $scope.status = {
    isopen: false
  };

}]);


app.filter('ageFilter', ['getAgeServiceFactory', function(getAgeServiceFactory) {
  return function(birthdate) {
    return getAgeServiceFactory(birthdate);
  };
}]);