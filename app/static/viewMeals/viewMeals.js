'use strict';

angular.module('myApp.viewMeals', ['ui.router','angular-svg-round-progressbar'])

.config(['$stateProvider','$urlRouterProvider',function($stateProvider, $urlRouterProvider) {

}])

.controller('ViewMealsCtrl', ['$scope','$http',function($scope,$http) {

  $scope.loadMeals = function () {
    $http.get('/api/meals').success(function (data) {
      $scope.meals = data;
    })
  }

$scope.loadMeals();


}]);
