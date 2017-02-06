'use strict';

angular.module('myApp.viewMyMeals', ['ui.router', 'angular-svg-round-progressbar', 'ui.bootstrap', 'myApp.viewMyMealsDtld'])

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
      $http.get('/api/meals/private').then(function(response) {
        $scope.meals = response.data['_items'];
        var userId = $scope.user._id;

        for (var j = 0; j < $scope.meals.length; j++) {
          for (var i = 0; i < $scope.meals[j].privateInfo.users.length; i++) {
            if ($scope.meals[j].privateInfo.users[i]._id == userId) {
              var userRole = $scope.meals[j].privateInfo.users[i].role[0];
              if(userRole == "simpleGuest"){
                $scope.meals[j].priceUser = $scope.meals[j].detailedInfo.requiredGuests.simpleGuest.price;
              }
              if(userRole == "admin"){
                $scope.meals[j].priceUser = $scope.meals[j].detailedInfo.requiredGuests.hosts.price;
              }
              if(userRole == "cook"){
                $scope.meals[j].priceUser = $scope.meals[j].detailedInfo.requiredGuests.cooks.price;
              }
              if(userRole == "cleaner"){
                $scope.meals[j].priceUser = $scope.meals[j].detailedInfo.requiredGuests.cleaners.price;
              }
            }
          }
        }
      });
    },

    $scope.loadMeals();

}]);