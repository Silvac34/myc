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
    }, // à changer par la fonction qui load uniquement les repas auxquels je participe

    $scope.loadMeals(); // à changer par la fonction qui load uniquement les repas auxquels je participe

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


   $scope.openModalDtldMyMeal = function(meal_id) {
    $uibModal.open({
      animation: true,
      templateUrl: 'static/viewMyMeals/viewMyMealsDtld/viewMyMealsDtld.html',
      controller: 'ViewMyMealsDtldCtrl',
      size: "lg",
      resolve: {
        meal_id: function() {
          return meal_id;
        }
      }
    });
  };

}])

.controller('ViewMyMealsDtldCtrl', ['$scope', '$http', '$stateParams', function($scope, $http, $stateParams) {

  $scope.loadMealInfo = function(meal_id) {
    $http.get('/api/meal/' + meal_id).then(function(response) {
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
    });
  };
  
  //Initialize variable
  $scope.requestRole={}; 
  $scope.requiredGuests = {
    availablePlaces: {}
  };
  $scope.errorSubscribe = {"status":false};
  
  $scope.loadMealInfo($stateParams.myMealId);
  $scope.accordionOneAtATime = true;
  
  $scope.closeAlert = function(){
    $scope.errorSubscribe.status = false;
  };
  

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
      else{
        if (my_meals_date < today) {
          output.push(input[i]);
        }
      }
    }
    return output;
  };
});
