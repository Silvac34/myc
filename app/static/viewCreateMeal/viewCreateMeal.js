'use strict';

angular.module('myApp.viewCreateMeal', ['ui.router'])

.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.when('/create_meal', '/create_meal/diner');
  $stateProvider
    .state('create_meal.diner', {
      parent: 'create_meal',
      url: '/diner',
      templateUrl: 'static/viewCreateMeal/viewCreateMealDiner/viewCreateMealDiner.html',
      controller: 'ViewCreateMealCtrl'
    })
  $stateProvider
    .state('create_meal.profile', {
      parent: 'create_meal',
      url: '/profile',
      templateUrl: 'static/viewCreateMeal/viewCreateMealProfile/viewCreateMealProfile.html',
      controller: 'ViewCreateMealCtrl'
    })
  $stateProvider
    .state('create_meal.payment', {
      parent: 'create_meal',
      url: '/payment',
      templateUrl: 'static/viewCreateMeal/viewCreateMealPayment/viewCreateMealPayment.html',
      controller: 'ViewCreateMealCtrl'
    });
}])

.controller('ViewCreateMealCtrl', ['$scope', '$http', function($scope, $http) {

  //initialize the editedMeal model
  $scope.editedMeal = $scope.editedMeal || {
    veggies: false,
    town: "Santiago",
    requiredHelpers:[],
    helpBuying: false,
    helpCooking: false,
    helpCleaning: false,
    notHelping: true
  };

  //initialize the buyers model
  $scope.buyers = $scope.buyers || {
      time: ""
    },

    $scope.cooks = $scope.cooks || {
      nbCooks: ""
    },

    $scope.cleaners = $scope.cleaners || {
      nbCleaners: ""
    },



    $scope.includingHelp = function() {
      $scope.editedMeal.notHelping = false
    }

  $scope.excludingHelp = function() {
    $scope.editedMeal.helpBuying = false,
      $scope.editedMeal.helpCooking = false,
      $scope.editedMeal.helpCleaning = false
  }



  $scope.createMeal = function() {
    if ($scope.editedMeal.helpBuying == true) {
      //$scope.editedMeal.requiredHelpers.buyers = $scope.buyers
      $scope.editedMeal.requiredHelpers.push({"buyers":$scope.buyers})
    }
    if ($scope.editedMeal.helpCooking == true) {
      $scope.editedMeal.requiredHelpers.push({"cooks":$scope.cooks})
    }
    if ($scope.editedMeal.helpCleaning == true) {
      $scope.editedMeal.requiredHelpers.push({"cleaners":$scope.cleaners})
    }
    $http.post('/api/meal', meal);
    
    //TODO : rediriger vers page du repas
  }


  ////ngrepeat for the cooking question
  /*  $scope.nbCookers = [{
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
  }];*/

}])

.controller('ViewCreateMealProfileCtrl', ['$scope', '$http', function($scope, $http) {
  $scope
}]);  
