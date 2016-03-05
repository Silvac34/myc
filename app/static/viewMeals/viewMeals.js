'use strict';

angular.module('myApp.viewMeals', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view_meals', {
    templateUrl: 'static/viewMeals/viewMeals.html',
    controller: 'ViewMealsCtrl'
  });
}])

.controller('ViewMealsCtrl', ['$scope','$http',function($scope,$http) {

  $scope.loadMeals = function () {
    $http.get('/api/meals').success(function (data) {
      $scope.meals = data;
    })
  }

$scope.loadMeals();

}]);
