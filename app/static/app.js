'use strict';

// Declare app level module which depends on views, and components
var app = angular.module('myApp', [
  'ui.router',
  'ngAnimate',
  'satellizer',
  'myApp.viewCreateMeal',
  'myApp.viewMeals',
  'myApp.viewMyMeals',
  'myApp.viewLogin'
]);

app.config(['$stateProvider','$urlRouterProvider','$authProvider',function($stateProvider, $urlRouterProvider,$authProvider) {

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
    data: {requiredLogin: true}
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
    data: {requiredLogin: true}
  });
    
  $urlRouterProvider.otherwise('view_meals');

  $authProvider.facebook({
      clientId: '1533480140278594',
      // by default, the redirect URI is http://localhost:5000
      redirectUri: 'https://ide.c9.io/kevin_maillet/shareat'
    });

}]);


app.run(function ($rootScope, $state, $auth) {
  $rootScope.$on('$stateChangeStart',
  function (event, toState) {
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

/*app.controller('ViewCreateMealCtrl', function($scope) {
    
    // we will store all of our form data in this object
    $scope.formData = {};
    
    // function to process the form
    $scope.processForm = function() {
        alert('awesome!');
    };
    
});
*/
