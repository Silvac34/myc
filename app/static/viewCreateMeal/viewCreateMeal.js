'use strict';

angular.module('myApp.viewCreateMeal', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/create_meal', {
    templateUrl: 'static/viewCreateMeal/viewCreateMeal.html',
    controller: 'ViewCreateMealCtrl'
  });
}])

.controller('ViewCreateMealCtrl', ['$scope', '$http',function($scope, $http) {

  $scope.loadMeals = function () {
    $http.get('/api/meals').success(function (data) {
      $scope.meals = data;
    })
  }

  $scope.createMeal = function (meal) {
    $http.post('/api/meal',meal);
    $scope.loadMeals();
  }

$scope.updateMeal = function (meal){
    $http.put('/api/meal/'+ meal._id,meal)
  }

  $scope.deleteMeal = function(meal_id){
  $http.delete('/api/meal/'+ meal_id).success(function(){
      for (var i in $scope.meals)
      {if ($scope.meals[i]._id == meal_id)
        {$scope.meals.splice(i, 1);
          break;
          alert($scope.meals[i].label)}
        }});

      }

  $scope.loadMeals();

}]);
