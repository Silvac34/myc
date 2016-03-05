'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ui.router',
  'myApp.viewCreateMeal',
  'myApp.viewMeals',
  'myApp.viewMyMeals',
  'myApp.viewFbLogin'
]).
config(['$stateProvider','$urlRouterProvider',function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/view_meals');
}]);
