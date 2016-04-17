'use strict';

angular.module('myApp.viewCreateMeal', ['ui.router','ngAnimate'])

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
    requiredHelpers:[]
  }, 
  
  $scope.helpBox = $scope.helpBox || {
    helpBuying: false, 
    helpCooking: false,
    helpCleaning: false,
    notHelping: true
  }
 
   $scope.animation = $scope.animation || {
    is_animated: false,
    is_not_animated: true,
    next_page: true,
    last_page: false
  },
  
  
  $scope.change_animation_to_the_right = function() {
      $scope.animation.next_page = true;
      $scope.animation.last_page = false;
      $scope.animation.is_animated = true;
      $scope.animation.is_not_animated = false;
  },
  
  $scope.change_animation_to_the_left = function() {
      $scope.animation.next_page = false;
      $scope.animation.last_page = true;
  },

  //initialize the buyers model
  $scope.buyers = $scope.buyers || {
      deliveryTime: "",
      ingredient: ""
    },

    $scope.cooks = $scope.cooks || {
      nbCooks: "",
      timeCooking: ""
    },

    $scope.cleaners = $scope.cleaners || {
      nbCleaners: ""
    },

  $scope.excludingHelp = function() {
    $scope.helpBox.helpBuying = false,
      $scope.helpBox.helpCooking = false,
      $scope.helpBox.helpCleaning = false
  }



  $scope.createMeal = function() {
    if ($scope.helpBox.helpBuying == true) {
      //$scope.editedMeal.requiredHelpers.buyers = $scope.buyers
      $scope.editedMeal.requiredHelpers.push({"buyers":$scope.buyers})
    }
    if ($scope.helpBox.helpCooking == true) {
      $scope.editedMeal.requiredHelpers.push({"cooks":$scope.cooks})
    }
    if ($scope.helpBox.helpCleaning == true) {
      $scope.editedMeal.requiredHelpers.push({"cleaners":$scope.cleaners})
    }
    $http.post('/api/meal', $scope.editedMeal);
    
    //TODO : rediriger vers page du repas
  }


}])

.controller('ViewCreateMealProfileCtrl', ['$scope', '$http', function($scope, $http) {
  $scope
}]);  
