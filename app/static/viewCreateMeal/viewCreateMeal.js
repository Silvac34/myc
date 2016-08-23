'use strict';

angular.module('myApp.viewCreateMeal', ['ui.router', 'ngAnimate', 'ngMessages', 'ngResource'])

.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

}])

.controller('ViewCreateMealCtrl', ['$scope', '$http', '$resource', '$uibModal', '$state', function($scope, $http, $resource, $uibModal, $state) {
  //$resource will serve for geolocation with $http

  //initialize the editedMeal model
  $scope.editedMeal = $scope.editedMeal || {
      veggies: false,
      time: predefined_date,
      detailedInfo: {
        "requiredGuests": {}
      }
    },


    $scope.createMeal = function() {
      if ($scope.editedMeal.requiredGuests != undefined) {
        $scope.editedMeal.detailedInfo.requiredGuests["cooks"] = $scope.editedMeal.requiredGuests.cooks;
        $scope.editedMeal.detailedInfo.requiredGuests["cleaners"] = $scope.editedMeal.requiredGuests.cleaners;

        $http.post('/api/meals', $scope.editedMeal).then(function() {
          $state.go('view_meals');
        });
      }

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
});


var predefined_date = new Date();
predefined_date.setDate(predefined_date.getDate() + 2);
predefined_date.setHours(20);
predefined_date.setMinutes(30);
