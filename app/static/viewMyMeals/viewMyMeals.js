'use strict';

angular.module('myApp.viewMyMeals', ['ui.router','angular-svg-round-progressbar','ui.bootstrap'])

.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

  /*$stateProvider
      .state('my_meals', {
        url: '/my_meals',
        templateUrl: 'static/viewMyMeals/viewMyMeals.html',
        controller: 'ViewMyMealsCtrl'
      })*/
}])

.controller('ViewMyMealsCtrl', ['$scope', '$http', function($scope, $http) {

  $scope.loadMeals = function() {
      $http.get('/api/meals').then(function(response) {
        $scope.meals = response.data;
      });
    },

    $scope.loadMeals();

  $scope.updateMeal = function(meal) {
    $http.put('/api/meal/' + meal._id, meal)
  }

  $scope.deleteMeal = function(meal_id) {
    $http.delete('/api/meal/' + meal_id).then(function() {
      for (var i in $scope.meals) {
        if ($scope.meals[i]._id == meal_id) {
          $scope.meals.splice(i, 1);
          break;
          alert($scope.meals[i].label)
        }
      }
    });
  };
  
    $scope.openModalDtld = function(meal_id) {
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'static/viewMeals/viewMyMealsDtld/viewMealsDtld.html',
      controller: 'ViewMyMealsDtldCtrl',
      size: "lg",
      windowClass: 'modal-meal-window',
      resolve: {
        meal_id: function() {
          return meal_id;
        }
      }
    });
  };


}]);
