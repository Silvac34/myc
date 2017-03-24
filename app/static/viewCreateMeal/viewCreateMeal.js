'use strict';

angular.module('myApp.viewCreateMeal', ['ui.router', 'ngAnimate'])


.controller('ViewCreateMealCtrl', ['$scope', '$http', '$uibModal', '$state', function($scope, $http, $uibModal, $state) {


  //initialize the editedMeal model
  $scope.editedMeal = $scope.editedMeal || {
      veggies: false,
      time: predefined_date,
      detailedInfo: {
        "requiredGuests": {}
      }
    },


    $scope.createMeal = function() {
      var okToPost = true;
      if ($scope.editedMeal.privateInfo != undefined) {
        if ($scope.editedMeal.privateInfo.adminPhone == null) {
          if ($scope.editedMeal.privateInfo.adminPhone.length == 0) {
            delete $scope.editedMeal.privateInfo.adminPhone;
            okToPost = true;
          }
          else {
            okToPost = false;
          }
        }
      }
      if ($scope.editedMeal.menu != undefined) {
        if ($scope.editedMeal.detailedInfo.requiredGuests != undefined) {
          if ($scope.editedMeal.detailedInfo.requiredGuests.cooks != undefined) {
            if ($scope.editedMeal.detailedInfo.requiredGuests.cooks.nbRquCooks == null) {
              delete $scope.editedMeal.detailedInfo.requiredGuests.cooks; //si on a essayé de rentrer des aides cuisines mais que finalement on en veut plus, on le supprime
            }
            else if ($scope.editedMeal.detailedInfo.requiredGuests.cooks.nbRquCooks < 0) {
              console.log("you are trying to do somehting ilegal with the number of cooks!");
              okToPost = false;
            }
          }
          if ($scope.editedMeal.detailedInfo.requiredGuests.cleaners != undefined) {
            if ($scope.editedMeal.detailedInfo.requiredGuests.cleaners.nbRquCleaners == null) {
              delete $scope.editedMeal.detailedInfo.requiredGuests.cleaners; //si on a essayé de rentrer des aides vaisselles mais que finalement on en veut plus, on le supprime
            }
            else if ($scope.editedMeal.detailedInfo.requiredGuests.cleaners.nbRquCleaners < 0) {
              console.log("you are trying to do somehting ilegal with the number of cleaners!");
              okToPost = false;
            }
          }
          if ($scope.editedMeal.detailedInfo.requiredGuests.simpleGuests != undefined) {
            if ($scope.editedMeal.detailedInfo.requiredGuests.simpleGuests.nbRquSimpleGuests == null) {
              delete $scope.editedMeal.detailedInfo.requiredGuests.simpleGuests; //si on a essayé de rentrer des invités simple mais que finalement on en veut plus, on le supprime
            }
            else if ($scope.editedMeal.detailedInfo.requiredGuests.simpleGuests.nbRquSimpleGuests < 0) {
              console.log("you are trying to do somehting ilegal with the number of cleaners!");
              okToPost = false;
            }
          }
        }

        if (okToPost == true) {
          $http.post('/api/meals', $scope.editedMeal).then(function(response) {
              $state.go("view_my_dtld_meals", {
                "myMealId": response.data._id
              });
            },
            function(response) {
              console.log(response); //sert à préparer le terrain pour afficher les erreurs qui pourraient avoir lieu lors de la publication d'un repas
            });
        }
      }
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
  $scope.date_formats = ['EEEE dd MMMM yyyy','dd-MMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
  $scope.date_format = $scope.date_formats[0];
  $scope.altInputDateFormats = ['M!/d!/yyyy'];

  //required for the calendar toolbar (datamodel : editedMeal.time)

  $scope.ismeridian = false;
  $scope.mstep = 15;

  $scope.formPopoverTimepicker = {
    title: 'Time of the meal',
    templateUrl: 'static/viewCreateMeal/viewCreateMealModal/PopoverTimepickerTemplate.html'
  };


  //enable animations in the modal
  $scope.animationsEnabled = true;

  //modal to get the address of the meal
  $scope.openModalFormLocation = function(size) {

    $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'static/viewCreateMeal/viewCreateMealModal/formModalLocationContent.html',
      controller: 'formCreateMealModalInstanceCtrl',
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
      templateUrl: 'static/viewCreateMeal/viewCreateMealModal/formModalPriceContent.html',
      controller: 'formCreateMealModalInstanceCtrl',
      size: size,
      resolve: {
        editedMeal: function() {
            return $scope.editedMeal;
          } //resolve - {Object.<string, Function>=} - An optional map of dependencies which should be injected into the controller. If any of these dependencies are promises, the router will wait for them all to be resolved or one to be rejected before the controller is instantiated
      }
    });
  };

  //$scope.addressAutocomplete;

}])

//controller for the Modal
.controller('formCreateMealModalInstanceCtrl', function($scope, $uibModalInstance, editedMeal) {

  $scope.editedMeal = editedMeal; //enable the DOM to be modified in the modal

  $scope.okLocation = function() {
    if ($scope.editedMeal.town != undefined && $scope.editedMeal.privateInfo.address != undefined && $scope.editedMeal.addressApprox != undefined) {
      if ($scope.address_complement == undefined) {
        $scope.editedMeal.privateInfo.address = $scope.editedMeal.privateInfo.address;
      }
      else {
        $scope.editedMeal.privateInfo.address = $scope.editedMeal.privateInfo.address + " - " + $scope.address_complement;
      }
      $scope.address_complement = undefined;
      $uibModalInstance.close();
    }
  }; //function to validate the Location modal

  $scope.okPrice = function() {

    if ($scope.editedMeal.price != undefined) {
      if ($scope.editedMeal.detailedInfo.requiredGuests != undefined) {
        if ($scope.editedMeal.detailedInfo.requiredGuests.cooks != undefined) {
          if ($scope.editedMeal.detailedInfo.requiredGuests.cooks.nbRquCooks != undefined) {
            if ($scope.editedMeal.detailedInfo.requiredGuests.cooks.nbRquCooks == 0 || $scope.editedMeal.detailedInfo.requiredGuests.cooks.nbRquCooks == null) {
              delete $scope.editedMeal.detailedInfo.requiredGuests.cooks;
              $uibModalInstance.close();
            }
            else if ($scope.editedMeal.detailedInfo.requiredGuests.cooks.timeCooking != undefined) {
              // on définit l'heure d'arrivée des cuisiniers comme étant le même jour que le jour du repas si besoin d'aides cuisine il y a
              $scope.editedMeal.detailedInfo.requiredGuests.cooks.timeCooking.setDate($scope.editedMeal.time.getDate());
              $scope.editedMeal.detailedInfo.requiredGuests.cooks.timeCooking.setFullYear($scope.editedMeal.time.getFullYear());
              $scope.editedMeal.detailedInfo.requiredGuests.cooks.timeCooking.setMonth($scope.editedMeal.time.getMonth());
              if ($scope.editedMeal.detailedInfo.requiredGuests.cooks.timeCooking.getHours() <= $scope.editedMeal.time.getHours()) {
                $uibModalInstance.close();
              }
            }
          }
          else if ($scope.editedMeal.detailedInfo.requiredGuests.cooks.nbRquCooks == null) {
            delete $scope.editedMeal.detailedInfo.requiredGuests.cooks;
            $uibModalInstance.close();
          }
        }
        else {
          $uibModalInstance.close();
        }
      }
      else {
        $uibModalInstance.close();
      }
    }
  }; //function to validate the Price modal

  $scope.cancel = function() {
    $uibModalInstance.dismiss('cancel');
  }; //funcion to dismiss the modal
});

var predefined_date = new Date();
predefined_date.setDate(predefined_date.getDate());
predefined_date.setHours(20);
predefined_date.setMinutes(30);