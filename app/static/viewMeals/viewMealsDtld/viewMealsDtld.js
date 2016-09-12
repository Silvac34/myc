'use strict';

var modMealsDetailed = angular.module('myApp.viewMealsDtld', ['angular-svg-round-progressbar', 'ui.bootstrap'])


<<<<<<< HEAD
.controller('ViewMealsDtldCtrl', ['$scope', '$http', 'meal_id', '$state', function($scope, $http, meal_id, $state) {
=======
.controller('ViewMealsDtldCtrl', ['$scope', '$http', 'meal_id', '$uibModalInstance', function($scope, $http, meal_id, $uibModalInstance) {
>>>>>>> master

  $scope.loadMealInfo = function(meal_id) {
    $http.get('/api/meals/' + meal_id).then(function(response) {
      $scope.meal = response.data;

      /*to check wether there is available space for each rôle*/
      if (!$scope.meal.detailedInfo.requiredGuests.cooks || $scope.meal.detailedInfo.requiredGuests.cooks.nbRemainingPlaces <= 0) {
        $scope.requiredGuests.availablePlaces['cooks'] = false;
      }
      else {
        $scope.requiredGuests.availablePlaces['cooks'] = true;
        $scope.requestRole.name = "cook";
      }
      if (!$scope.meal.detailedInfo.requiredGuests.cleaners || $scope.meal.detailedInfo.requiredGuests.cleaners.nbRemainingPlaces <= 0) {
        $scope.requiredGuests.availablePlaces['cleaners'] = false;
      }
      else {
        $scope.requiredGuests.availablePlaces['cleaners'] = true;
        if (!$scope.requestRole) {
          $scope.requestRole.name = "cleaner"
        }
      }
      if (!$scope.meal.detailedInfo.requiredGuests.simpleGuests || $scope.meal.detailedInfo.requiredGuests.simpleGuests.nbRemainingPlaces <= 0) {
        $scope.requiredGuests.availablePlaces['simpleGuests'] = false;
      }
      else {
        $scope.requiredGuests.availablePlaces['simpleGuests'] = true;
        if (!$scope.requestRole) {
          $scope.requestRole.name = "simpleGuest"
        }
      }
      $scope.goToMeal= $scope.meal.detailedInfo.subscribed
    });
  }
  
  
  $scope.subscribeMeal = function(meal_id,role) {
    $http.post('/api/meals/' + meal_id +'/subscription', {"requestRole":role}).then(function(response) {
      //$scope.loadMealInfo(meal_id);
      $scope.meal.nbRemainingPlaces -=  1 
      $scope.meal.detailedInfo.requiredGuests[$scope.requestRole.name + "s"].nbRemainingPlaces -= 1 
      $scope.goToMeal = true;
    }, function(response){
      $scope.loadMealInfo(meal_id);
      $scope.errorSubscribe.status = true
      $scope.errorSubscribe.message = response.data
    })
  }
  
  //Initialize variable
  $scope.requestRole={}; 
  $scope.requiredGuests = {
    availablePlaces: {}
  } 
  $scope.errorSubscribe = {"status":false};
  $scope.goToMeal = false;
  
  $scope.loadMealInfo(meal_id);
  $scope.accordionOneAtATime = true;
  
  $scope.closeAlert = function(){
<<<<<<< HEAD
    $scope.errorSubscribe.status = false
  }
=======
    $scope.errorSubscribe.status = false;
  };

  $scope.cancel = function() {
    $uibModalInstance.dismiss('cancel');
  }; //funcion to dismiss the modal
  
>>>>>>> master

}]);
