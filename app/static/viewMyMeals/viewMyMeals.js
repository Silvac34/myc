'use strict';

angular.module('myApp.viewMyMeals', ['ui.router', 'angular-svg-round-progressbar', 'ui.bootstrap','myApp.viewMyMealsDtld'])

.config(['$stateProvider','$urlRouterProvider',function($stateProvider, $urlRouterProvider) {
  
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
      });
    },

    $scope.loadMeals();

}]);