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

  $scope.createMeal = function (meal) {
    $http.post('/api/meal',meal);
    $scope.loadMeals();
  }

$scope.updateMeal = function (meal){
    $http.put('/api/meal',meal)
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
