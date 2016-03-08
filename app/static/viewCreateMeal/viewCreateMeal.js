'use strict';

angular.module('myApp.viewCreateMeal', ['ui.router'])

.config(['$stateProvider','$urlRouterProvider',function($stateProvider, $urlRouterProvider) {

  /*$stateProvider
      .state('create_meal', {
        url: '/create_meal',
        templateUrl: 'static/viewCreateMeal/viewCreateMeal.html',
        controller: 'ViewCreateMealCtrl'
      })*/
}])

.controller('ViewCreateMealCtrl', ['$scope', '$http',function($scope, $http) {

  $scope.createMeal = function (meal) {
    $http.post('/api/meal',meal);
  }

}]);
