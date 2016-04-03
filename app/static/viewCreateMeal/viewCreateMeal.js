'use strict';

angular.module('myApp.viewCreateMeal', ['ui.router'])

.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.when('/create_meal', '/create_meal/diner');
  $stateProvider
    .state('create_meal.diner', {
      url: '/diner',
      templateUrl: 'static/viewCreateMeal/viewCreateMealDiner/viewCreateMealDiner.html',
      controller: 'ViewCreateMealCtrl'
    })
  $stateProvider
    .state('create_meal.profile', {
      url: '/profile',
      templateUrl: 'static/viewCreateMeal/viewCreateMealProfile/viewCreateMealProfile.html',
      controller: 'ViewCreateMealCtrl'
    })
  $stateProvider
    .state('create_meal.payment', {
      url: '/payment',
      templateUrl: 'static/viewCreateMeal/viewCreateMealPayment/viewCreateMealPayment.html',
      controller: 'ViewCreateMealCtrl'
    });
}])

.controller('ViewCreateMealCtrl', ['$scope', '$http', function($scope, $http) {

  $scope.createMeal = function(meal) {
      $http.post('/api/meal', meal);
    },


    $scope.editedMeal = {
      buying: false,
      cooking: false,
      cleaning: false,
      notHelping: false

    },

    $scope.excludingHelp = function() {
      $scope.editedMeal.buying = false,
        $scope.editedMeal.cooking = false,
        $scope.editedMeal.cleaning = false
    },

    $scope.includingHelp = function() {
      $scope.editedMeal.notHelping = false
    }

  ////ngrepeat for the cooking question
  $scope.nbCookers = [{
    number_cooker: "0",
    default_option: true
  }, {
    number_cooker: "1",
    default_option: false
  }, {
    number_cooker: "2",
    default_option: false
  }, {
    number_cooker: "3",
    default_option: false
  }, {
    number_cooker: "4",
    default_option: false
  }, {
    number_cooker: "5",
    default_option: false
  }];
  //ngrepeat for the cleaning question
  $scope.nbCleaners = [{
    number_cleaner: "0",
    default_option: true
  }, {
    number_cleaner: "1",
    default_option: false
  }, {
    number_cleaner: "2",
    default_option: false
  }, {
    number_cleaner: "3",
    default_option: false
  }, {
    number_cleaner: "4",
    default_option: false
  }, {
    number_cleaner: "5",
    default_option: false
  }];

}])

.controller('ViewCreateMealProfileCtrl', ['$scope', '$http', function($scope, $http) {
  $scope
}]);  
