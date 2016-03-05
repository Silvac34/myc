'use strict';

angular.module('myApp.viewCreateMeal', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/create_meal', {
    templateUrl: 'static/viewCreateMeal/viewCreateMeal.html',
    controller: 'ViewCreateMealCtrl'
  });
}])

.controller('ViewCreateMealCtrl', ['$scope', '$http',function($scope, $http) {

  $scope.createMeal = function (meal) {
    $http.post('/api/meal',meal);
  }

}]);
