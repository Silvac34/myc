'use strict';

var modMealsDetailed = angular.module('myApp.viewMealsDtld', ['angular-svg-round-progressbar', 'ui.bootstrap'])


.controller('ViewMealsDtldCtrl', ['$scope', '$http', 'meal_id', function($scope, $http, meal_id) {

  $scope.loadMealInfo = function(meal_id) {
    $http.get('/api/meal/' + meal_id, meal_id).then(function(response) {
      $scope.meal = response.data;
      
      /*to check wether there is available space for each rôle*/
      if (!$scope.meal.detailedInfo.requiredGuests.cooks||$scope.meal.detailedInfo.requiredGuests.cooks.nbRemainingPlaces <= 0) {
        $scope.requiredGuests.availablePlaces['cooks'] = false;
      }
      else $scope.requiredGuests.availablePlaces['cooks'] = true
      if (!$scope.meal.detailedInfo.requiredGuests.cleaners||$scope.meal.detailedInfo.requiredGuests.cleaners.nbRemainingPlaces <= 0) {
        $scope.requiredGuests.availablePlaces['cleaners'] = false;
      }
      else $scope.requiredGuests.availablePlaces['cleaners'] = true;
      if (!$scope.meal.detailedInfo.requiredGuests.simpleGuests||$scope.meal.detailedInfo.requiredGuests.simpleGuests.nbRemainingPlaces <= 0) {
        $scope.requiredGuests.availablePlaces['simpleGuests'] = false;
      }
      else $scope.requiredGuests.availablePlaces['simpleGuests'] = true;
    });
  }

  $scope.requiredGuests={availablePlaces:{}} /*to initialize the variable */
  
  $scope.loadMealInfo(meal_id);

  $scope.accordionOneAtATime = true;

}]);
