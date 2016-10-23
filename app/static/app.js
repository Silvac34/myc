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
  'myApp.welcome',
  'userServices'
]);

app.config(['$stateProvider', '$urlRouterProvider', '$authProvider', 'ENV', function($stateProvider, $urlRouterProvider, $authProvider, ENV) {

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
      }
    });
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

app.controller('AppCtrl', ['$scope', '$auth', '$state', 'userServices', function($scope, $auth, $state, userServices) {
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
  

}]);
