'use strict';

angular.module('myApp.viewMyMeals', ['ui.router', 'angular-svg-round-progressbar', 'ui.bootstrap'])

.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('view_my_dtld_meals', {
      url: '/my_meals/:myMealId',
      templateUrl: 'static/viewMyMeals/viewMyMealsDtld/viewMyMealsDtld.html',
      controller: 'ViewMyMealsDtldCtrl'
    });
}])

.controller('ViewMyMealsCtrl', ['$scope', '$http', '$uibModal', function($scope, $http, $uibModal) {

  $scope.loadMeals = function() {
      $http.get('/api/meal/my_meals').then(function(response) {
        $scope.meals = response.data;
      });
    },

    $scope.loadMeals();

  $scope.updateMeal = function(meal) {
    $http.put('/api/meal/' + meal._id, meal);
  };

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

}])

.controller('ViewMyMealsDtldCtrl', ['$scope', '$http', '$stateParams', function($scope, $http, $stateParams) {

  $scope.loadMyMealInfo = function(meal_id) {
    $http.get('/api/meal/' + meal_id + '/private').then(function(response) {
      $scope.meal = response.data;
      var userId = $scope.user._id;

      for (var i = 0; i < $scope.meal.privateInfo.users.length; i++) {
        if ($scope.meal.privateInfo.users[i]._id == userId) {
          if ($scope.meal.privateInfo.users[i].role[0] == "admin") {
            $scope.userRole = $scope.meal.privateInfo.users[i].role[1];
          }
          else {
            $scope.userRole = $scope.meal.privateInfo.users[i].role[0];
          }
        }
      }
    });
  };

  $scope.loadMyMealInfo($stateParams.myMealId);

}])

.filter('MyMealsFiltered', function() {
  return function(input, current) {
    input = input || '';
    var today = new Date();
    var output = [];
    for (var i = 0; i < input.length; i++) {
      var my_meals_date = new Date(input[i].time);
      if (current) {
        if (my_meals_date > today) {
          output.push(input[i]);
        }
      }
      else {
        if (my_meals_date < today) {
          output.push(input[i]);
        }
      }
    }
    return output;
  };
});
