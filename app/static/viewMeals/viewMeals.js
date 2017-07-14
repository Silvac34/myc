'use strict';

var modViewMeals = angular.module('myApp.viewMeals', ['ui.router', 'angular-svg-round-progressbar', 'ui.bootstrap', 'myApp.viewMealsDtld', 'ngMap', 'ngSanitize'])

modViewMeals.config(['$stateProvider', function($stateProvider) {

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

  $scope.meals = response; //récupère les données passées lorsqu'on charge la page (chargement lors de loading de la page)

  /*$scope.$watch("manualSubscriptionPending", function(newValue, oldValue) { //permet de savoir si dans les données chargées, il y a des meals en attente de validation
    if (newValue == true && oldValue == undefined) {
      $timeout(function() {
        $scope.manualSubscriptionPending = false;
      }, 4000);
    }
  });*/

  $scope.datasUserForEachMeal = function(meal) { //function qui retourne l'utilisateur s'il s'est inscrit
    if ($scope.$parent.$root.user) {
      for (var i = 0; i < meal.users.length; i++) {
        if (meal.users[i]._id == $scope.$parent.$root.user._id) {
          return meal.users[i];
        }
      }
    }
  };

  function checkStatusAccepted(i) {
    if ($scope.datasUserForEachMeal($scope.meals[i])) {
      if ($scope.datasUserForEachMeal($scope.meals[i]).status == "accepted") {
        return true;
      }
      else {
        return false;
      }
    }
    else {
      return false;
    }
  }

  $scope.openModalDtld = function(meal_id) { //permet d'ouvrir les modals de chacun de repas associés
    for (var i = 0; i < $scope.meals.length; i++) {
      if ($scope.meals[i]._id == meal_id) {
        if (checkStatusAccepted(i)) {
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
            scope: $scope,
            resolve: {
              meal: function() {
                return $scope.meals[i];
              },
              isAuthenticated: function() {
                return $auth.isAuthenticated();
              }
            }
          });
          modalInstance.result.then(function(result) {
            $scope.manualSubscriptionPending = result.manualSubscriptionPending;
            $timeout(function() {
              $scope.manualSubscriptionPending = false;
            }, 4000);
          });
        }
      }
    }
  };

  if ($scope.$parent.$root.toState && $scope.$parent.$root.toState.name == "view_my_dtld_meals" && $scope.$parent.$root.fromState && ($scope.$parent.$root.fromState.name == "" || $scope.$parent.$root.fromState.name == "login")) { //permet d'ouvrir le modal associé à un repas que j'essayais d'ouvrir depuis un lien extérieur si je n'étais pas identifier auparavant
    $scope.openModalDtld($scope.$parent.$root.toParams.myMealId);
  }

  //on définit le prix du repas qui doit s'afficher
  for (var j = 0; j < $scope.meals.length; j++) {
    if ("cooks" in $scope.meals[j].detailedInfo.requiredGuests) {
      $scope.meals[j].mealPrice = $scope.meals[j].detailedInfo.requiredGuests.cooks.price; // si aide cuisine alors le prix du repas est le prix de l'aide cuisine
    }
    else if ("cleaners" in $scope.meals[j].detailedInfo.requiredGuests) {
      $scope.meals[j].mealPrice = $scope.meals[j].detailedInfo.requiredGuests.cleaners.price; // si pas aide cuisine et aide vaisselle alors le prix du repas est le prix de l'aide vaisselle
    }
    else if ("simpleGuests" in $scope.meals[j].detailedInfo.requiredGuests) {
      $scope.meals[j].mealPrice = $scope.meals[j].detailedInfo.requiredGuests.simpleGuests.price; //sinon c'est soit le prix d'aide cuisine s'il n'y a ni l'un ni l'autre
    }
    else {
      $scope.meals[j].mealPrice = $scope.meals[j].detailedInfo.requiredGuests.hosts.price; // si le repas n'a pas d'invités (par précaution), c'est le prix de l'hôte
    }
    $scope.meals[j].priceUnit = Math.ceil(10 * $scope.meals[j].price / $scope.meals[j].nbGuests) / 10; //sera utilisé pour viewMyMealDtld pour la phrase de variation de prix
  }

  $scope.countPendingRequestsPerMeal = function(mealId) {
    var numberOfPendingRequests = 0;
    $scope.meals.forEach(function(meal) {
      if (meal._id == mealId) {
        meal.users.forEach(function(user) {
          if (user.status == "pending") {
            numberOfPendingRequests += 1;
          }
        });
      }
    });
    return numberOfPendingRequests;
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
    cityFilter: "",
    preferenceFilter: {
      "veggies": false,
      "vegan": false,
      "halal": false,
      "kosher": false
    },
    helpingTypeFilter: {
      "cooks": false,
      "cleaners": false,
      "simpleGuests": false
    }
  };

  //-------------- FILTERS --------------//

  //code pour faire les filtres selon les weekDays
  $scope.weekDaysFilter = function(meal) { //permet de faire un filtre avec les jours de la semaine selectionnés
    if ($scope.filter.weekDays.some(checkIfWeekDaysSelected) == true) {
      var listMeal = [];
      for (var i = 0; i < $scope.filter.weekDays.length; i++) {
        if ($scope.filter.weekDays[i].selected == true) {
          var mealDate = new Date(meal.time);
          if (mealDate.getDay() == $scope.filter.weekDays[i].ind) {
            listMeal.push(meal);
          }
        }
      }
      return listMeal[0];
    }
    else {
      return meal;
    }
  };

  var now = new Date();

  $scope.futurMealsFilter = function(meal) {
    return (Date.parse(meal.time) >= now.getTime());
  };

  $scope.pastMealsFilter = function(meal) {
    return (Date.parse(meal.time) < now.getTime());
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
      return (meal.mealPrice >= $scope.filter.priceFilterMin.value && $scope.meal.mealPriceMin <= $scope.filter.priceFilterMax.value);
    }
    else {
      if ($scope.filter.priceFilterMin.value != null) {
        return (meal.mealPrice >= $scope.filter.priceFilterMin.value);
      }
      else if ($scope.filter.priceFilterMax.value != null) {
        return (meal.mealPrice <= $scope.filter.priceFilterMax.value);
      }
      else {
        return meal;
      }
    }
  };

  $scope.cityRangeFilter = function(meal) {
    if ($scope.filter.cityFilter != "") {
      var city = "";
      if ($scope.filter.cityFilter.match(",")) {
        city = $scope.filter.cityFilter.split(",")[0];
      }
      else {
        city = $scope.filter.cityFilter;
      }
      if (city.match(" ")) { //si la ville a des espaces, on met en majuscule chacune des premières lettres
        var arrayCity = city.split(" ");
        city = "";
        for (var i = 0; i < arrayCity.length; i++) {
          arrayCity[i] = capitalizeFirstLetter(arrayCity[i]);
          city += arrayCity[i] + " ";
        }
        city = city.substring(0, city.length - 1);
      }
      else {
        city = capitalizeFirstLetter(city);
      } // on met en majuscule la première lettre
      return meal.address.town.match(city);
    }
    else {
      return meal;
    }
  };

  $scope.preferenceFilter = function(meal) {
    var count = 0;
    for (var value in $scope.filter.preferenceFilter) {
      if ($scope.filter.preferenceFilter[value] == true) {
        if (meal[value] == true) {
          return meal;
        }
      }
      else {
        count += 1;
      }
    }
    if (count == Object.keys($scope.filter.preferenceFilter).length) {
      return meal;
    }
  };

  $scope.helpingTypeFilter = function(meal) {
    var count = 0;
    for (var value in $scope.filter.helpingTypeFilter) {
      if ($scope.filter.helpingTypeFilter[value] == true) {
        if (meal.detailedInfo.requiredGuests[value] && meal.detailedInfo.requiredGuests[value]["nbRemainingPlaces"] > 0) {
          return meal;
        }
      }
      else {
        count += 1;
      }
    }
    if (count == Object.keys($scope.filter.helpingTypeFilter).length) {
      return meal;
    }
  };

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  //-------------- INITIALIZING --------------//

  $state.go("view_meals.mealsList");

  $scope.InitializeMealsMap = function() {
    var vm = this;
    NgMap.getMap("mealsMap").then(function(map) {
      vm.map = map;
    });

    $scope.openInfowindow = function(evt) { //ouvre l'infowindow associé à la carte google
      vm.map.showInfoWindow(this.id, this.id); //1er argument = infowindow ID, 2eme argument = marker ID. Pour simplifier, j'ai attribué l'ID du repas aux deux.
    };
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
    $scope.filter.dateFilterMin.value = null;
    $scope.filter.dateFilterMax.value = null;
    $scope.filter.priceFilterMin.value = null;
    $scope.filter.priceFilterMax.value = null;
    $scope.filter.cityFilter = "";
    $scope.filter.preferenceFilter.veggies = false;
    $scope.filter.preferenceFilter.vegan = false;
    $scope.filter.preferenceFilter.halal = false;
    $scope.filter.preferenceFilter.kosher = false;
    $scope.filter.helpingTypeFilter.cooks = false;
    $scope.filter.helpingTypeFilter.cleaners = false;
    $scope.filter.helpingTypeFilter.simpleGuests = false;
    $uibModalInstance.close();
  };

});
