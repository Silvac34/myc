'use strict';

var modViewMeals = angular.module('myApp.viewMeals', ['ui.router', 'angular-svg-round-progressbar', 'ui.bootstrap', 'myApp.viewMealsDtld'])

modViewMeals.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('view_meals.filterInternet', {
      views: {
        'filterInternet': {
          templateUrl: 'static/viewMeals/viewFilter/filterInternet.html',
          controller: 'filterMealCtrl'
        }
      }
    })
    .state('view_meals.mealsMap', {
      views: {
        'mealsMap': {
          templateUrl: 'static/viewMeals/viewMealsContainer/mealsMap.html',
          controller: 'mealsMapCtrl'
        }
      }
    })
    .state('view_meals.mealsList', {
      views: {
        'mealsList': {
          templateUrl: 'static/viewMeals/viewMealsContainer/mealsList.html',
          controller: 'mealsListCtrl'
        }
      }
    });
}]);


modViewMeals.controller('ViewMealsCtrl', ['$scope', 'viewMealsFilterService', '$state', '$uibModal', '$auth', 'response', '$timeout', '$filter', function($scope, viewMealsFilterService, $state, $uibModal, $auth, response, $timeout, $filter) {

  $scope.meals = response.data['_items']; //récupère les données passées lorsqu'on charge la page (chargement lors de loading de la page)

  $scope.$watch("manualSubscriptionPending", function(newValue, oldValue) {//permet de savoir si dans les données chargées, il y a des meals en attente de validation
    if (newValue == true && oldValue == undefined) {
      $timeout(function() {
        $scope.manualSubscriptionPending = false;
      }, 4000);
    }
  });

  /*  $scope.filter = function() {
        return viewMealsFilterService.get();
      },
  */
  $scope.openModalDtld = function(meal_id) { //permet d'ouvrir les modals de chacun de repas associés
    if (this.meal.detailedInfo.subscribed == true) {
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
  };
  $scope.isCollapsed = false; //permet de faire apparaître tous les filtres lors du chargement de la page
  $scope.reverse = false; //permet de filtrer du plus récent au plus ancien
  $scope.SortOrder = 'asc';
  
  $scope.openModalFilter = function(filter) {//permet d'ouvrir le modal de filtres lorsqu'on est sur mobile
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
        opened: false
      },
      dateFilterMax: {
        opened: false,
      }
  };

  $scope.weekDaysFilter = function(meal) {
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

  function checkIfWeekDaysSelected(element, index, array) {
    return element.selected == true;
  }
  
  //$state.go('view_meals.filterInternet');
  /*
    $scope.dateFilterMin_open = function() {
      $scope.filter.dateFilterMin.opened = true;
    };

    $scope.dateFilterMax_open = function() {
      $scope.filter.dateFilterMax.opened = true;
    };

    $scope.applyFilters = function() {
      viewMealsFilterService.set($scope.filter);
    };*/

  /*$scope.initializeFilters = function() {
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
        opened: false
      },
      dateFilterMax: {
        opened: false,
      }
    };
  };*/

  /*$scope.getFilters = function() {
    var appliedFilters = viewMealsFilterService.get();
    if (appliedFilters == "") {
      $scope.initializeFilters();
    }
    else {
      $scope.filter = appliedFilters;
    }
  };

  $scope.getFilters();
  $scope.applyFilters(); // Set up dataBinding with the service from the beginning
*/
}]);

modViewMeals.controller('filterMealModalCtrl', function($scope, $uibModalInstance) {
  $scope.cancel = function() {
    $uibModalInstance.close();
  };

  $scope.clearAndCloseFilterMobile = function() {
    $scope.initializeFilters();
    $uibModalInstance.close();
  };

});

modViewMeals.controller('filterMealCtrl', ['$scope', 'viewMealsFilterService', function($scope, viewMealsFilterService) {


}]);


modViewMeals.service('viewMealsFilterService', function() {
  var filter = "";
  return {
    get: function() {
      return filter;
    },
    set: function(value) {
      filter = value;
    }
  };
});

modViewMeals.filter('dateRange', function() {
  return function(items, from, to) {
    var filtered = [];
    if (!items || !items.length) {
      return;
    }
    if (from == null && to == null) {
      return items;
    }
    if (to == null) {
      for (var i = 0; i < items.length; ++i) {
        var itemTime = new Date(items[i].time);
        if (itemTime >= from) {
          filtered.push(items[i]);
        }
      }
    }
    else {
      var too = new Date(to);
      too.setDate(to.getDate() + 1); //If we want the upper limit to be the end of the day  
    }
    if (from == null) {
      for (var i = 0; i < items.length; ++i) {
        var itemTime = new Date(items[i].time);
        if (itemTime <= too) {
          filtered.push(items[i]);
        }
      }
    }
    if (from != null && to != null) {
      for (var i = 0; i < items.length; ++i) {
        var itemTime = new Date(items[i].time);
        if (itemTime >= from && itemTime <= too) {
          filtered.push(items[i]);
        }
      }
    }
    return filtered;
  };
});

modViewMeals.filter('fWeekDays', function() {
  return function(items, weekDays) {
    var filtered = [];
    var selectedDays = [];
    if (!items || !items.length || !weekDays || !weekDays.length) {
      return;
    }
    for (var i = 0; i < weekDays.length; ++i) {
      if (weekDays[i].selected == true) {
        selectedDays.push(weekDays[i].ind);
      }
    }
    if (selectedDays.length == 0) {
      return items;
    }
    for (var i = 0; i < items.length; ++i) {
      var itemTime = new Date(items[i].time);
      if (selectedDays.indexOf(itemTime.getDay()) != -1) {
        filtered.push(items[i]);
      }
    }
    return filtered;
  };
});