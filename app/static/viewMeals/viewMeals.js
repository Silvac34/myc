'use strict';

var modViewMeals = angular.module('myApp.viewMeals', ['ui.router', 'angular-svg-round-progressbar', 'ui.bootstrap', 'myApp.viewMealsDtld', 'ngMap', 'ngSanitize'])

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


modViewMeals.controller('ViewMealsCtrl', ['$scope', '$state', '$uibModal', '$auth', 'response', '$timeout', 'NgMap', '$filter', '$compile', '$http', function($scope, $state, $uibModal, $auth, response, $timeout, NgMap, $filter, $compile, $http) {

  $scope.meals = response.data['_items']; //récupère les données passées lorsqu'on charge la page (chargement lors de loading de la page)

  $http.get("/static/sources/profile/countries.json").then(function(res) {
    $scope.countries = res.data;
  });

  $scope.$watch("manualSubscriptionPending", function(newValue, oldValue) { //permet de savoir si dans les données chargées, il y a des meals en attente de validation
    if (newValue == true && oldValue == undefined) {
      $timeout(function() {
        $scope.manualSubscriptionPending = false;
      }, 4000);
    }
  });

  //on définit le prix du repas qui doit s'afficher
  $http.get("/static/sources/profile/countries.json").then(function(res) {
    $http.get("/static/sources/createMeal/currency.json").then(function(result_currency) {
      $http.get("/static/sources/createMeal/currency_symbol.json").then(function(result_currency_symbol) {
        for (var j = 0; j < $scope.meals.length; j++) {
          if ("cooks" in $scope.meals[j].detailedInfo.requiredGuests) {
              $scope.meals[j].mealPrice = $scope.meals[j].detailedInfo.requiredGuests.cooks.price; // si aide cuisine alors le prix du repas est le prix de l'aide cuisine
          }
          else if ("cleaners" in $scope.meals[j].detailedInfo.requiredGuests) {
              $scope.meals[j].mealPrice = $scope.meals[j].detailedInfo.requiredGuests.cleaners.price;  // si pas aide cuisine et aide vaisselle alors le prix du repas est le prix de l'aide vaisselle
          }
          else if ("simpleGuests" in $scope.meals[j].detailedInfo.requiredGuests) {
              $scope.meals[j].mealPrice = $scope.meals[j].detailedInfo.requiredGuests.simpleGuests.price; //sinon c'est soit le prix d'aide cuisine s'il n'y a ni l'un ni l'autre
          }
          else{
            $scope.meals[j].mealPrice = $scope.meals[j].detailedInfo.requiredGuests.hosts.price; // si le repas n'a pas d'invités (par précaution), c'est le prix de l'hôte
          }
          $scope.meals[j].priceUnit = Math.ceil(10 * $scope.meals[j].price / $scope.meals[j].nbGuests) / 10; //sera utilisé pour viewMyMealDtld pour la phrase de variation de prix
          var currency = result_currency.data[$scope.meals[j].address.country_code];
          $scope.meals[j].currency_symbol = result_currency_symbol.data[currency].symbol_native; ////récupère correctement la monnaie où s'effectue le repas
          $scope.meals[j].address.country = getCountry($scope.meals[j].address.country_code, res.data); //récupère correctement le pays
        }
      });
    });
  });
  
  

  function getCountry(country_code, jsonData) {
    for (var i = 0; i < jsonData.length; i++) {
      if (jsonData[i].code == country_code) {
        return jsonData[i].name;
      }
    }
  }

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
              meal: function() {
                return $scope.meals[i];
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
    cityFilter: "",
    preferenceFilter: {
      "veggies": false,
      "vegan": false
    }
  };

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
      return ($scope.meals[j].mealPriceMin >= $scope.filter.priceFilterMin.value && $scope.meals[j].mealPriceMin <= $scope.filter.priceFilterMax.value);
    }
    else {
      if ($scope.filter.priceFilterMin.value != null) {
        return ($scope.meals[j].mealPriceMin >= $scope.filter.priceFilterMin.value);
      }
      else if ($scope.filter.priceFilterMax.value != null) {
        return ($scope.meals[j].mealPriceMin <= $scope.filter.priceFilterMax.value);
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
    if ($scope.filter.preferenceFilter.veggies == true && $scope.filter.preferenceFilter.vegan == true) {
      return (meal.veggies == true || meal.vegan == true);
    }
    else {
      if ($scope.filter.preferenceFilter.veggies == true) {
        return meal.veggies == true;
      }
      else if ($scope.filter.preferenceFilter.vegan == true) {
        return meal.vegan == true;
      }
      else {
        return meal;
      }
    }
  };

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  $state.go("view_meals.mealsList");
  $scope.mapInitialized = false;

  $scope.InitializeMealsMap = function() {
    if ($scope.mapInitialized == false) {
      var vm = this;
      NgMap.getMap("mealsMap").then(function(map) {
        vm.map = map;
      });

      $scope.openInfowindow = function(evt) { //ouvre l'infowindow associé à la carte google
        vm.map.showInfoWindow(this.id, this.id); //1er argument = infowindow ID, 2eme argument = marker ID. Pour simplifier, j'ai attribué l'ID du repas aux deux.
      };
      $scope.mapInitialized = true;
    }
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
