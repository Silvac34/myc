'use strict';

var modViewMeals = angular.module('myApp.viewMeals', ['ui.router', 'angular-svg-round-progressbar', 'ui.bootstrap', 'myApp.viewMealsDtld', 'ngMap'])

modViewMeals.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('view_meals.mealsMap', {
      views: {
        'mealsMap': {
          templateUrl: 'static/viewMeals/viewMealsContainer/mealsMap.html',
        }
      }
    })
    .state('view_meals.mealsList', {
      views: {
        'mealsList': {
          templateUrl: 'static/viewMeals/viewMealsContainer/mealsList.html',
        }
      }
    });
}]);


modViewMeals.controller('ViewMealsCtrl', ['$scope', '$state', '$uibModal', '$auth', 'response', '$timeout', 'NgMap', '$filter', '$compile', function($scope, $state, $uibModal, $auth, response, $timeout, NgMap, $filter, $compile) {

  $scope.meals = response.data['_items']; //récupère les données passées lorsqu'on charge la page (chargement lors de loading de la page)

  $scope.$watch("manualSubscriptionPending", function(newValue, oldValue) { //permet de savoir si dans les données chargées, il y a des meals en attente de validation
    if (newValue == true && oldValue == undefined) {
      $timeout(function() {
        $scope.manualSubscriptionPending = false;
      }, 4000);
    }
  });

  function defineAllMealPrice() { //on définit le prix du repas qui doit s'afficher
    for (var j = 0; j < $scope.meals.length; j++) {
      $scope.meals[j].mealPrice = $scope.meals[j].price / $scope.meals[j].nbGuests; // de base c'est le nombre de participant diviser par le prix des courses (en dernier recours)
      if ("cooks" in $scope.meals[j].detailedInfo.requiredGuests) {
        $scope.meals[j].mealPrice = $scope.meals[j].detailedInfo.requiredGuests.cooks.price; //sinon c'est soit le prix d'aide cuisine
      }
      else if ("cleaners" in $scope.meals[j].detailedInfo.requiredGuests) {
        $scope.meals[j].mealPrice = $scope.meals[j].detailedInfo.requiredGuests.cleaners.price; //ou le prix aide vaisselle
      }
      else if ("simpleGuests" in $scope.meals[j].detailedInfo.requiredGuests) {
        $scope.meals[j].mealPrice = $scope.meals[j].detailedInfo.requiredGuests.simpleGuests.price; //enfin, s'il n'y a pas d'aide, c'est le prix invité
      }
    }
  }

  defineAllMealPrice();

  $scope.openModalDtld = function(meal_id) { //permet d'ouvrir les modals de chacun de repas associés
    for (var i = 0; i < $scope.meals.length; i++) {
      if ($scope.meals[i]._id == meal_id) {
        if ($scope.meals[i].detailedInfo.subscribed == true) {
          $state.go("view_my_dtld_meals", {
            "myMealId": meal_id
          });
        }
        else {
          var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'static/viewMeals/viewMealsDtld/viewMealsDtld.html',
            controller: 'ViewMealsDtldCtrl',
            size: "lg",
            windowClass: 'modal-meal-window',
            resolve: {
              meal_id: function() {
                return meal_id;
              },
              isAuthenticated: function() {
                return $auth.isAuthenticated();
              }
            }
          });
          modalInstance.result.then(function(result) {
            var result_value = result;
            if (result_value == undefined) {
              result_value = {
                "manualSubscriptionPending": false,
                "pending": false
              };
            }
            $scope.manualSubscriptionPending = result_value.manualSubscriptionPending;
            for (var i = 0; i < $scope.meals.length; i++) {
              if ($scope.meals[i]._id == meal_id) {
                $scope.meals[i].detailedInfo.pending = result_value.pending;
              }
            }
          });
        }
      }
    }
  };

  $scope.isCollapsed = {
    "weekDays": false,
    "period": false,
    "price": false,
    "place": false
  }; //permet de faire apparaître tous les filtres lors du chargement de la page
  $scope.reverse = false; //permet de filtrer du plus récent au plus ancien
  $scope.SortOrder = 'asc';

  $scope.openModalFilter = function(filter) { //permet d'ouvrir le modal de filtres lorsqu'on est sur mobile
    $uibModal.open({
      animation: true,
      templateUrl: 'static/viewMeals/viewFilter/filterMobile.html',
      controller: 'filterMealModalCtrl',
      scope: $scope
    });
  };

  $scope.filter = {
    weekDays: [{
      label: 'Monday',
      selected: false,
      ind: 1
    }, {
      label: 'Tuesday',
      selected: false,
      ind: 2
    }, {
      label: 'Wednesday',
      selected: false,
      ind: 3
    }, {
      label: 'Thursday',
      selected: false,
      ind: 4
    }, {
      label: 'Friday',
      selected: false,
      ind: 5
    }, {
      label: 'Saturday',
      selected: false,
      ind: 6
    }, {
      label: 'Sunday',
      selected: false,
      ind: 0
    }],
    dateFilterMin: {
      opened: false,
      value: null
    },
    dateFilterMax: {
      opened: false,
      value: null
    },
    priceFilterMin: {
      value: null
    },
    priceFilterMax: {
      value: null
    },
    placeFilter: null
  };

  //code pour faire les filtres selon les weekDays
  $scope.weekDaysFilter = function(meal) { //permet de faire un filtre avec les jours de la semaine selectionnés
    if ($scope.filter.weekDays.some(checkIfWeekDaysSelected) == true) {
      for (var i = 0; i < $scope.filter.weekDays.length; i++) {
        if ($scope.filter.weekDays[i].selected == true) {
          var mealDate = new Date(meal.time);
          return (mealDate.getDay() == $scope.filter.weekDays[i].ind);
        }
      }
    }
    else {
      return meal;
    }
  };

  function checkIfWeekDaysSelected(element, index, array) { //vérifie si au moins un des jours de la semaine a été selectionné dans les filtres
    return element.selected == true;
  }

  //code pour faire les filtres selon une période fixe de temps
  $scope.dateFilterMin_open = function() {
    $scope.filter.dateFilterMin.opened = true;
  };

  $scope.dateFilterMax_open = function() {
    $scope.filter.dateFilterMax.opened = true;
  };

  $scope.dateRangeFilter = function(meal) {
    var mealDate = new Date(meal.time);
    if ($scope.filter.dateFilterMin.value != null && $scope.filter.dateFilterMax.value != null) {
      return (mealDate >= $scope.filter.dateFilterMin.value && mealDate <= $scope.filter.dateFilterMax.value);
    }
    else {
      if ($scope.filter.dateFilterMin.value != null) {
        return (mealDate >= $scope.filter.dateFilterMin.value);
      }
      else if ($scope.filter.dateFilterMax.value != null) {
        return (mealDate <= $scope.filter.dateFilterMax.value);
      }
      else {
        return meal;
      }
    }
  };

  $scope.priceRangeFilter = function(meal) {
    if ($scope.filter.priceFilterMin.value != null && $scope.filter.priceFilterMax.value != null) {
      return ($scope.meals[j].mealPrice >= $scope.filter.priceFilterMin.value && $scope.meals[j].mealPrice <= $scope.filter.priceFilterMax.value);
    }
    else {
      if ($scope.filter.priceFilterMin.value != null) {
        return ($scope.meals[j].mealPrice >= $scope.filter.priceFilterMin.value);
      }
      else if ($scope.filter.priceFilterMax.value != null) {
        return ($scope.meals[j].mealPrice <= $scope.filter.priceFilterMax.value);
      }
      else {
        return meal;
      }
    }
  };

  $scope.placeRangeFilter = function(meal) {
    if ($scope.filter.placeFilter != null) {
        return (meal.address.town == $scope.filter.placeFilter.split(",")[0]);
    }
    else {
      return meal;
    }
  };

  $state.go("view_meals.mealsList");
  NgMap.getMap("map").then(function(map) {
    $scope.map = map;
  });

  $scope.openInfowindow = function(evt) { //ouvre l'infowindow associé à la carte google
    $scope.map.showInfoWindow(this.id, this.id); //1er argument = infowindow ID, 2eme argument = marker ID. Pour simplifier, j'ai attribué l'ID du repas aux deux.
  };

}]);

modViewMeals.controller('filterMealModalCtrl', function($scope, $uibModalInstance) {
  $scope.cancel = function() {
    $uibModalInstance.close();
  };

  $scope.clearAndCloseFilterMobile = function() {
    for (var i = 0; i < $scope.filter.weekDays.length; i++) {
      $scope.filter.weekDays[i].selected = false;
    }
    $uibModalInstance.close();
  };

});