'use strict';

// Declare app level module which depends on views, and components
var app = angular.module('myApp', [
  'config',
  'ui.bootstrap',
  'ui.router',
  'ngResource',
  'ngAnimate',
  'ngMessages',
  'satellizer',
  'myApp.viewCreateMeal',
  'myApp.viewMeals',
  'myApp.viewMyMeals',
  'myApp.viewLogin',
  'userServices'
]);

app.config(['$stateProvider', '$urlRouterProvider', '$authProvider', 'ENV', function($stateProvider, $urlRouterProvider, $authProvider, ENV) {

  $stateProvider
    .state('welcome', {
      url: '/welcome',
      templateUrl: 'static/welcome/welcome.html',
      controller: 'WelcomeCtrl'
    })
  $stateProvider
    .state('login', {
      url: '/login',
      templateUrl: 'static/viewLogin/viewLogin.html',
      controller: 'ViewLoginCtrl'
    })
  $stateProvider
    .state('view_meals', {
      url: '/view_meals',
      templateUrl: 'static/viewMeals/viewMeals.html',
      controller: 'ViewMealsCtrl',
      data: {
        requiredLogin: true
      }
    })
  $stateProvider
    .state('create_meal', {
      url: '/create_meal',
      templateUrl: 'static/viewCreateMeal/viewCreateMeal.html',
      controller: 'ViewCreateMealCtrl',
      data: {
        requiredLogin: true
      }
    })
  $stateProvider
    .state('my_meals', {
      url: '/my_meals',
      templateUrl: 'static/viewMyMeals/viewMyMeals.html',
      controller: 'ViewMyMealsCtrl',
      data: {
        requiredLogin: true
      }
    })
  $urlRouterProvider.otherwise('welcome');

  $authProvider.facebook({
    clientId: ENV.fbClientID,
    redirectUri: ENV.fbRedirectURI,
    scope: ['email']
  });

}]);


app.run(function($rootScope, $state, $auth) {
  $rootScope.$on('$stateChangeStart',
    function(event, toState) {
      var requiredLogin = false;
      // check if this state need login
      if (toState.data && toState.data.requiredLogin)
        requiredLogin = true;

      // if yes and if this user is not logged in, redirect him to login page
      if (requiredLogin && !$auth.isAuthenticated()) {
        event.preventDefault();
        $state.go('login');
      }
    });
});

app.controller('AppCtrl', ['$scope', '$auth', '$state', 'userServices', '$window', function($scope, $auth, $state, userServices, $window) {
  $scope.logout = function() {
    $auth.logout();
    $state.go('login');
  },

  $scope.isAuthenticated = function() {
    return $auth.isAuthenticated();
  },
  
  $scope.getUserProfile = function() {
    if ($auth.isAuthenticated()) {
      userServices.getUserInfo().then(function(data) {
        $scope.user = data;
      });
    }
  };
  

  $scope.getUserProfile();
  $scope.navbarCollapsed = true;
  

  var latlng = $window.navigator.geolocation.getCurrentPosition(function(position) {
    return position.coords.latitude + "," + position.coords.longitude;
  });

 /* var google_map_api_key = "AIzaSyAQsOeNUwks7blgswNuJQqWlJ-MzcdS_UA";
  var google_map_api_link = "json?latlng="+latlng+"&key="+google_map_api_key;
  var address = $resource("https://maps.googleapis.com/maps/api/geocode/:google_map_api_link", {google_map_api_link: '@google_map_api_link'});
  address.get({google_map_api_link:123}, function(user) {
  user.abc = true;
  user.$save();
});
  
 /¨ var locationFactory = function($resource) {
    return $resource("https://maps.googleapis.com/maps/api/geocode/:google_map_api_link", {
      google_map_api_link: '@google_map_api_link'
    }, {
      'get': {
        method: 'GET'
      },
    });
  };*/

}]);
