'use strict';

angular.module('myApp.viewMyMeals', ['ui.router', 'angular-svg-round-progressbar', 'ui.bootstrap','myApp.viewMyMealsDtld'])

.controller('ViewMyMealsCtrl', ['$scope', '$http', '$uibModal', function($scope, $http, $uibModal) {

  $scope.loadMeals = function() {
      $http.get('/api/meal/my_meals').then(function(response) {
        $scope.meals = response.data;
      });
    },

    $scope.loadMeals();

}]);