'use strict';

angular.module('myApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'static/view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', ['$scope', '$http',function($scope, $http) {

  $scope.loadMeals = function () {
      $http.get('/api/meals').success(function (data) {
          $scope.meals = data;
      })
}

  $scope.createMeal = function () {
    $http.post('/api/meal');
    $scope.loadMeals();
  }

}]);
