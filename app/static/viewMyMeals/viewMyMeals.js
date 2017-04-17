'use strict';

angular.module('myApp.viewMyMeals', ['ui.router', 'angular-svg-round-progressbar', 'ui.bootstrap', 'myApp.viewMyMealsDtld'])

.controller('ViewMyMealsCtrl', ['$scope', 'response', '$uibModal', '$filter', function($scope, response, $uibModal, $filter) {

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
    return ($filter('date')(meal.time) >= $filter('date')(now) && $filter('date')(meal.time, "yyyy") >= $filter('date')(now, "yyyy") && meal.detailedInfo.pending == false);
  };

  $scope.pastMealsFilter = function(meal) {
    return (($filter('date')(meal.time) < $filter('date')(now) && $filter('date')(meal.time, "yyyy") < $filter('date')(now, "yyyy")) || ($filter('date')(meal.time) >= $filter('date')(now) && $filter('date')(meal.time, "yyyy") < $filter('date')(now, "yyyy")));
  };
  
  $scope.pendingMealsFilter = function(meal) {
    return ($filter('date')(meal.time) >= $filter('date')(now) && $filter('date')(meal.time, "yyyy") >= $filter('date')(now, "yyyy") && meal.detailedInfo.pending == true);
  };

}]);