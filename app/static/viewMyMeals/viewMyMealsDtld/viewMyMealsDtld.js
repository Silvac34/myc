'use strict';

var modMyMealsDetailed = angular.module('myApp.viewMyMealsDtld', ['ui.router', 'angular-svg-round-progressbar', 'ui.bootstrap']);

modMyMealsDetailed.controller('ViewMyMealsDtldCtrl', ['$scope', '$http', '$stateParams', '$uibModal', function($scope, $http, $stateParams, $uibModal) {

  $scope.loadMyMealInfo = function(meal_id) {
    $http.get('/api/meal/' + meal_id + '/private').then(function(response) {
      $scope.meal = response.data;
      var userId = $scope.user._id;

      for (var i = 0; i < $scope.meal.privateInfo.users.length; i++) {
        if ($scope.meal.privateInfo.users[i]._id == userId) {
          if ($scope.meal.privateInfo.users[i].role[0] == "admin") {
            $scope.userRole = $scope.meal.privateInfo.users[i].role[1];
            $scope.userAdmin = true;
          }
          else {
            $scope.userRole = $scope.meal.privateInfo.users[i].role[0];
            $scope.userAdmin = false;
          }
        }
      }
    });
  };

  $scope.loadMyMealInfo($stateParams.myMealId);

  //modalDelete to delete a meal
  $scope.openModalDelete = function() {

    $uibModal.open({
      animation: true,
      templateUrl:  '/static/viewMyMeals/viewMyMealsDtld/modalviewMyMealsDtld/modalDeleteMyMealDtld.html',
      controller: 'FormModalDeleteInstanceCtrl',
      size: "sm"
    });
  };

}]);

modMyMealsDetailed.filter('MyMealsFiltered', function() {
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

modMyMealsDetailed.controller('FormModalDeleteInstanceCtrl', function($scope, $uibModalInstance) {

  $scope.ok = function() {
    $uibModalInstance.close();
  }; //function to validate the modal

  $scope.cancel = function() {
    $uibModalInstance.dismiss('cancel');
  }; //funcion to dismiss the modal
});