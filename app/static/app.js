'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'myApp.viewCreateMeal',
  'myApp.viewMeals',
  'myApp.viewFbLogin'
]).
config(['$routeProvider', function($routeProvider) {
//  $routeProvider.when('/view_fblogin',{redirectTo: '/view_fblogin'})
//  $routeProvider.when('/view2',{redirectTo: '/view2'})
  $routeProvider.otherwise({redirectTo: '/create_meal'});
}]);
