'use strict';

var modMealsDetailed = angular.module('myApp.viewMealsDtld', ['angular-svg-round-progressbar','ui.bootstrap'])


.controller('ViewMealsDtldCtrl', ['$scope','$http','meal_id',function($scope,$http,meal_id) {
  
  $scope.loadMealInfo = function(meal_id) {
    $http.get('/api/meal/' + meal_id,meal_id).success(function(data) {
      $scope.meal = data;
    });
  }
  
  $scope.loadMealInfo(meal_id)
  
  $scope.accordionOneAtATime=true;
  
}]);

