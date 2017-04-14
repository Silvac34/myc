'use strict';

var modMyMealsDetailed = angular.module('myApp.viewMyMealsDtld', ['ui.router', 'angular-svg-round-progressbar', 'ui.bootstrap', 'ngAnimate']);

modMyMealsDetailed.controller('ViewMyMealsDtldCtrl', ['$scope', '$http', '$stateParams', '$uibModal', 'ENV', '$timeout', function($scope, $http, $stateParams, $uibModal, ENV, $timeout) {

  $scope.loadMyMealInfo = function(meal_id) {
    $http.get('/api/meals/private/' + meal_id).then(function(response) {
      $scope.meal = response.data;
      var userId = $scope.user._id;
      for (var i = 0; i < $scope.meal.privateInfo.users.length; i++) {
        if ($scope.meal.privateInfo.users[i]._id == userId) {
          $scope.userRole = $scope.meal.privateInfo.users[i].role[0];
        }
      }
    });
  };

  $scope.loadMyMealInfo($stateParams.myMealId);
  $scope.data_href_comment = ENV.fbRedirectURI + "#/my_meals/" + $stateParams.myMealId;
  $scope.data_href_publishOnFacebook = ENV.fbRedirectURI + "#/view_meals";

  //modalDelete to delete a meal
  $scope.openModalDelete = function() {

    $uibModal.open({
      animation: true,
      templateUrl: '/static/viewMyMeals/viewMyMealsDtld/modalviewMyMealsDtld/modalDeleteMyMealDtld.html',
      controller: 'modalDeleteInstanceCtrl',
      size: "sm",
      resolve: {
        _etag: function() {
            return $scope.meal._etag;
          } //resolve - {Object.<string, Function>=} - An optional map of dependencies which should be injected into the controller. If any of these dependencies are promises, the router will wait for them all to be resolved or one to be rejected before the controller is instantiated
      }
    });
  };


  //modalEdit to delete a meal
  $scope.openModalEdit = function() {

    $uibModal.open({
      animation: true,
      templateUrl: '/static/viewMyMeals/viewMyMealsDtld/modalviewMyMealsDtld/modalEditMyMealDtld.html',
      controller: 'modalEditInstanceCtrl',
      size: "lg",
      resolve: {
        meal: function() {
            return $scope.meal;
          } //resolve - {Object.<string, Function>=} - An optional map of dependencies which should be injected into the controller. If any of these dependencies are promises, the router will wait for them all to be resolved or one to be rejected before the controller is instantiated
      }
    });
  };

  //modalUnsubscribe to unsubscribe to a meal
  $scope.openModalUnsubscribe = function() {

    $uibModal.open({
      animation: true,
      templateUrl: '/static/viewMyMeals/viewMyMealsDtld/modalviewMyMealsDtld/modalUnsubscribeMyMealDtld.html',
      controller: 'modalUnsubscribeInstanceCtrl',
      size: "sm"
    });
  };

  function successfullySubscribed(variable) {
    $scope.successSubscribedMessage = variable || false;
    if ($scope.successSubscribedMessage == true) {
      $timeout(function() {
        $scope.successSubscribedMessage = false;
      }, 3000);
    }
  }
  successfullySubscribed($stateParams.successSubscribedMessage);

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

modMyMealsDetailed.controller('modalDeleteInstanceCtrl', function($scope, $http, $stateParams, $uibModalInstance, $state, _etag) {

  $scope.deleteMyMeal = function(meal_id, _etag) {

    $http.delete('/api/meals/private/' + meal_id, {
      headers: {
        "If-Match": _etag
      }
    }).then(function(response) {
      //rajouter en fonction de la réponse un popup ?
    });
  };

  $scope.delete = function() {
    $scope.deleteMyMeal($stateParams.myMealId, _etag);
    $uibModalInstance.close();
    $state.go('view_meals', {
      reload: true,
      inherit: false,
      notify: false
    });

  }; //function to validate the modal

  $scope.cancel = function() {
    $uibModalInstance.dismiss('cancel');
  }; //funcion to dismiss the modal

});

modMyMealsDetailed.controller('modalEditInstanceCtrl', function($scope, $http, $stateParams, $uibModalInstance, $state, meal) {

  $scope.editMyMeal = function(meal_id) {
    $http.patch('/api/meals/private/' + meal_id).then(function(response) {
      //rajouter en fonction de la réponse un popup ?
    });
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
  $scope.date_format = 'dd-MMM-yyyy';
  $scope.altInputDateFormats = ['M!/d!/yyyy'];

  //required for the calendar toolbar (datamodel : editedMeal.time)

  $scope.ismeridian = false;
  $scope.mstep = 15;

  $scope.formPopoverTimepickerMM = {
    title: 'Hora de la cena',
    templateUrl: 'PopoverTimepickerTemplateMM.html'
  };

  $scope.formPopoverTimepickerTimeCooking = {
    title: 'Llegada de los que ayudan a cocinar',
    templateUrl: 'PopoverTimepickerTemplateTimeCooking.html'
  };

  $scope.meal = meal;
  $scope.nbCooksInscribed = $scope.meal.detailedInfo.requiredGuests.cooks.nbRquCooks - $scope.meal.detailedInfo.requiredGuests.cooks.nbRemainingPlaces;
  if ($scope.meal.detailedInfo.requiredGuests.cleaners != undefined) {
    $scope.nbCleanersInscribed = $scope.meal.detailedInfo.requiredGuests.cleaners.nbRquCleaners - $scope.meal.detailedInfo.requiredGuests.cleaners.nbRemainingPlaces;
  }
  else {
    $scope.nbCleanersInscribed = 0;
  }
  if ($scope.meal.detailedInfo.requiredGuests.simpleGuests != undefined) {
    $scope.nbSimpleGuestsInscribed = $scope.meal.detailedInfo.requiredGuests.simpleGuests.nbRquSimpleGuests - $scope.meal.detailedInfo.requiredGuests.simpleGuests.nbRemainingPlaces;
  }
  else {
    $scope.nbSimpleGuestsInscribed = 0;
  }
  $scope.edit = function() {
    if (($scope.nbCooksInscribed <= ($scope.meal.detailedInfo.requiredGuests.cooks.nbRquCooks - 1) || $scope.nbCooksInscribed == undefined) && ($scope.nbCleanersInscribed <= $scope.meal.detailedInfo.requiredGuests.cleaners.nbRquCleaners || $scope.nbCleanersInscribed == undefined) && ($scope.nbSimpleGuestsInscribed <= $scope.meal.detailedInfo.requiredGuests.simpleGuests.nbRquSimpleGuests || $scope.nbSimpleGuestsInscribed == undefined)) {
      $scope.editMyMeal($stateParams.myMealId);
      $uibModalInstance.close();
      $state.reload();
    }
  }; //function to validate the modal

  $scope.cancel = function() {
    $uibModalInstance.dismiss('cancel');
  }; //funcion to dismiss the modal

});

modMyMealsDetailed.controller('modalUnsubscribeInstanceCtrl', function($scope, $http, $stateParams, $uibModalInstance, $state) {

  $scope.unsubscribeMyMeal = function(meal_id) {
    $http.post('/api/meals/' + meal_id + '/unsubscription').then(function(response) {
      //rajouter en fonction de la réponse un popup ?
    });
  };

  $scope.unsubscribe = function() {
    $scope.unsubscribeMyMeal($stateParams.myMealId);
    $uibModalInstance.close();
    $state.go('view_meals', {
      reload: true,
      inherit: false,
      notify: false
    });

  }; //function to validate the modal

  $scope.cancel = function() {
    $uibModalInstance.dismiss('cancel');
  }; //funcion to dismiss the modal

});
