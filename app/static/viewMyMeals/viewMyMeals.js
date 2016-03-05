'use strict';

angular.module('myApp.viewMyMeals', ['ui.router'])

.config(['$stateProvider','$urlRouterProvider',function($stateProvider, $urlRouterProvider) {

  $stateProvider
      .state('my_meals', {
        url: '/my_meals',
        templateUrl: 'static/viewMyMeals/viewMyMeals.html',
        controller: 'ViewMyMealsCtrl'
      })
}])

.controller('ViewMyMealsCtrl', ['$scope','$http',function($scope,$http) {

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

}]);
