'use strict';

angular.module('myApp.viewCreateMeal', ['ui.router', 'ngAnimate', 'ngMessages', 'ngResource'])

.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.when('/create_meal', '/create_meal/diner');
  $stateProvider
    .state('create_meal.diner', {
      parent: 'create_meal',
      url: '/diner',
      templateUrl: 'static/viewCreateMeal/viewCreateMealDiner/viewCreateMealDiner.html',
      controller: 'ViewCreateMealCtrl'
    }),
    $stateProvider
    .state('create_meal.profile', {
      parent: 'create_meal',
      url: '/profile',
      templateUrl: 'static/viewCreateMeal/viewCreateMealProfile/viewCreateMealProfile.html',
      controller: 'ViewCreateMealCtrl'
    }),
    $stateProvider
    .state('create_meal.payment', {
      parent: 'create_meal',
      url: '/payment',
      templateUrl: 'static/viewCreateMeal/viewCreateMealPayment/viewCreateMealPayment.html',
      controller: 'ViewCreateMealCtrl'
    });
}])


.controller('ViewCreateMealCtrl', ['$scope', '$http', '$resource', '$uibModal', function($scope, $http, $resource, $uibModal) {
  //$resource will serve for geolocation with $http

  //initialize the editedMeal model
  $scope.editedMeal = $scope.editedMeal || {
      veggies: false,
      town: "Santiago",
      time: predefined_date,
      detailedInfo: {
        "requiredHelpers": []
      }
    },



    $scope.helpBox = $scope.helpBox || {
      helpBuying: false,
      helpCooking: false,
      helpCleaning: false,
      notHelping: true
    },

    $scope.animation = $scope.animation || {
      is_animated: false,
      is_not_animated: true,
      next_page: false,
      last_page: false,
      first_next_page: true
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
        $scope.helpBox.helpCleaning = false;
    },

    $scope.includingHelp = function() {
      $scope.helpBox.notHelping = false;
    },


    $scope.createMeal = function() {
      if ($scope.helpBox.helpBuying == true) {
        $scope.editedMeal.detailedInfo.requiredHelpers.push({
          "buyers": $scope.buyers
        });
      }
      if ($scope.helpBox.helpCooking == true) {
        $scope.editedMeal.detailedInfo.requiredHelpers.push({
          "cooks": $scope.cooks
        });
      }
      if ($scope.helpBox.helpCleaning == true) {
        $scope.editedMeal.detailedInfo.requiredHelpers.push({
          "cleaners": $scope.cleaners
        });
      }
      $http.post('/api/meals', $scope.editedMeal);

      //TODO : rediriger vers page du repas
    };

  //required for the calendar toolbar (datamodel : editedMeal.time)

  $scope.dateOptions = {
      formatYear: 'yy',
      maxDate: new Date(2020, 5, 22),
      minDate: new Date(),
      startingDay: 1
    },


    $scope.clear = function() {
      $scope.editedMeal.time = null;
    };

  $scope.date_open = function() {
    $scope.date_popup.opened = true;
  };

  $scope.date_popup = {
    opened: false
  };

  //date formats for datepicker
  $scope.date_formats = ['dd-MMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
  $scope.date_format = $scope.date_formats[0];
  $scope.altInputDateFormats = ['M!/d!/yyyy'];

  //required for the calendar toolbar (datamodel : editedMeal.time)

  $scope.ismeridian = false;
  $scope.mstep = 15;

  $scope.formPopoverTimepicker = {
    title: 'Hora de la cena',
    templateUrl: 'PopoverTimepickerTemplate.html'
  };


  //enable animations in the modal
  $scope.animationsEnabled = true;

  //modal to get the address of the meal
  $scope.openModalFormLocation = function(size) {

    $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'formModalLocationContent.html',
      controller: 'FormModalInstanceCtrl',
      size: size,
      resolve: {
        editedMeal: function() {
            return $scope.editedMeal;
          } //resolve - {Object.<string, Function>=} - An optional map of dependencies which should be injected into the controller. If any of these dependencies are promises, the router will wait for them all to be resolved or one to be rejected before the controller is instantiated
      }
    });
  };


  //modal to define the price of the meal and the number of participants
  $scope.openModalFormPrice = function(size) {

    $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'formModalPriceContent.html',
      controller: 'FormModalInstanceCtrl',
      size: size,
      resolve: {
        editedMeal: function() {
            return $scope.editedMeal;
          } //resolve - {Object.<string, Function>=} - An optional map of dependencies which should be injected into the controller. If any of these dependencies are promises, the router will wait for them all to be resolved or one to be rejected before the controller is instantiated
      }
    });
  };

}])

//controller for the Location Modal
.controller('FormModalInstanceCtrl', function($scope, $uibModalInstance, editedMeal) {

  $scope.editedMeal = editedMeal; //enable the DOM to be modified in the modal

  $scope.ok = function() {
    $uibModalInstance.close();
  }; //function to validate the modal

  $scope.cancel = function() {
    $uibModalInstance.dismiss('cancel');
  }; //funcion to dismiss the modal
})


var predefined_date = new Date();
predefined_date.setDate(predefined_date.getDate() + 2);
predefined_date.setHours(20);
predefined_date.setMinutes(30);
