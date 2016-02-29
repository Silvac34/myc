'use strict';

angular.module('myApp.viewMeals', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/viewMeals', {
    templateUrl: 'static/viewMeals/viewMeals.html',
    controller: 'ViewMealsCtrl'
  });
}])

.controller('ViewMealsCtrl', [function() {

}]);
