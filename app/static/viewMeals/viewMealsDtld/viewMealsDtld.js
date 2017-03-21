'use strict';

var modMealsDetailed = angular.module('myApp.viewMealsDtld', ['angular-svg-round-progressbar', 'ui.bootstrap'])


.controller('ViewMealsDtldCtrl', ['$scope', '$http', 'meal_id', '$uibModalInstance', '$state', 'isAuthenticated', function($scope, $http, meal_id, $uibModalInstance, $state, isAuthenticated) {

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
          $scope.requestRole.name = "cleaner";
        }
      }
      if (!$scope.meal.detailedInfo.requiredGuests.simpleGuests || $scope.meal.detailedInfo.requiredGuests.simpleGuests.nbRemainingPlaces <= 0) {
        $scope.requiredGuests.availablePlaces['simpleGuests'] = false;
      }
      else {
        $scope.requiredGuests.availablePlaces['simpleGuests'] = true;
        if (!$scope.requestRole) {
          $scope.requestRole.name = "simpleGuest";
        }
      }
      $scope.goToMeal = $scope.meal.detailedInfo.subscribed;
    });
  };


  $scope.subscribeMeal = function(meal_id, role) {
    $http.post('/api/meals/' + meal_id + '/subscription', {
      "requestRole": role
    }).then(function(response) {
      //$scope.loadMealInfo(meal_id);
      $scope.meal.nbRemainingPlaces -= 1;
      $scope.meal.detailedInfo.requiredGuests[$scope.requestRole.name + "s"].nbRemainingPlaces -= 1;
      $scope.goToMeal = true;
      $uibModalInstance.close();
      $state.go("view_my_dtld_meals", {
        "myMealId": meal_id
      });
    }, function(response) {
      $scope.loadMealInfo(meal_id);
      $scope.errorSubscribe.status = true;
      if (RegExp(response.data = "requestRole")) {
        $scope.errorSubscribe.message = "you have to select a role to participate";
      }
      else {
        $scope.errorSubscribe.message = response.data;
      }
    });
  };

  /*$scope.subscribeMealAuth = function(meal_id, role, isAuth, provider, toState){
    if(isAuth){
      subscribeMea(meal_id,role);
    }
    else{
      $scope.auth(provider, toState)
      
      //view_my_dtld_meals({myMealId: meal_id})
    }
  };*/

  //Initialize variable
  $scope.isAuthenticated = isAuthenticated;
  $scope.requestRole = {};
  $scope.requiredGuests = {
    availablePlaces: {}
  };
  
  $scope.errorSubscribe = {
    "status": false
  };
  $scope.goToMeal = false;

  $scope.loadMealInfo(meal_id);
  $scope.accordionOneAtATime = true;

  $scope.closeAlert = function() {
    $scope.errorSubscribe.status = false;
  };

  $scope.cancel = function() {
    $uibModalInstance.dismiss('cancel');
  }; //funcion to dismiss the modal


}]);
