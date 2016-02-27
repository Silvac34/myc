'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'myApp.view1',
  'myApp.view2',
  'myApp.view_fblogin'
]).
config(['$routeProvider', function($routeProvider) {
//  $routeProvider.when('/view_fblogin',{redirectTo: '/view_fblogin'})
//  $routeProvider.when('/view2',{redirectTo: '/view2'})
  $routeProvider.otherwise({redirectTo: '/view1'});
}]);
