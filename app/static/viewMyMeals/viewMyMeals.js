'use strict';

angular.module('myApp.viewMyMeals', ['ui.router', 'angular-svg-round-progressbar', 'ui.bootstrap', 'myApp.viewMyMealsDtld'])

.controller('ViewMyMealsCtrl', ['$scope', 'response', '$uibModal', function($scope, response, $uibModal) {

  $scope.meals = response.data['_items'];
  var userId = $scope.user._id;

  for (var j = 0; j < $scope.meals.length; j++) {
    for (var i = 0; i < $scope.meals[j].privateInfo.users.length; i++) {
      if ($scope.meals[j].privateInfo.users[i]._id == userId) {
        var userRole = $scope.meals[j].privateInfo.users[i].role[0];
        if (userRole == "simpleGuest") {
          $scope.meals[j].priceUser = $scope.meals[j].detailedInfo.requiredGuests.simpleGuests.price;
        }
        if (userRole == "admin") {
          $scope.meals[j].priceUser = $scope.meals[j].detailedInfo.requiredGuests.hosts.price;
        }
        if (userRole == "cook") {
          $scope.meals[j].priceUser = $scope.meals[j].detailedInfo.requiredGuests.cooks.price;
        }
        if (userRole == "cleaner") {
          $scope.meals[j].priceUser = $scope.meals[j].detailedInfo.requiredGuests.cleaners.price;
        }
      }
    }
  }

  var now = new Date();

  $scope.futurMealsFilter = function(meal) {
    return (Date.parse(meal.time) >= now.getTime());
  };

  $scope.pastMealsFilter = function(meal) {
    return (Date.parse(meal.time) < now.getTime());
  };

}]);