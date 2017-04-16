'use strict';

var modViewMeals = angular.module('myApp.viewMeals', ['ui.router', 'angular-svg-round-progressbar', 'ui.bootstrap', 'myApp.viewMealsDtld'])

.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('view_meals.filterInternet', {
      views: {
        'filterInternet': {
          templateUrl: 'static/viewMeals/viewFilter/filterInternet.html',
          controller: 'filterMealCtrl'
        }
      }
    });
}])


.controller('ViewMealsCtrl', ['$scope', 'viewMealsFilterService', '$state', '$uibModal', '$auth', 'response', '$timeout', function($scope, viewMealsFilterService, $state, $uibModal, $auth, response, $timeout) {

  $scope.meals = response.data['_items'];

  $scope.$watch("manualSubscriptionPending", function(newValue, oldValue) {
    if (newValue == true && oldValue == undefined) {
      $timeout(function() {
        $scope.manualSubscriptionPending = false;
      }, 4000);
    }
  });

  $scope.filter = function() {
      return viewMealsFilterService.get();
    },

    $scope.openModalFilter = function(filter) {
      $uibModal.open({
        animation: true,
        templateUrl: 'static/viewMeals/viewFilter/filterMobile.html',
        controller: 'filterMealModalCtrl',
        resolve: {
          filter: function() {
            return filter;
          }
        }
      });
    };



  $scope.openModalDtld = function(meal_id) {
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
    }
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
  };





  $scope.reverse = false;
  $scope.SortOrder = 'asc';

  $state.go('view_meals.filterInternet');

}]);

modViewMeals.controller('filterMealModalCtrl', function($scope, $uibModalInstance) {
  $scope.cancel = function() {
    $uibModalInstance.close();
  };

  $scope.initializeFilters = function() {
    $scope.filter = {
      weekDays: [{
        label: 'Mon',
        selected: false,
        ind: 1
      }, {
        label: 'Tu',
        selected: false,
        ind: 2
      }, {
        label: 'Wed',
        selected: false,
        ind: 3
      }, {
        label: 'Th',
        selected: false,
        ind: 4
      }, {
        label: 'Fr',
        selected: false,
        ind: 5
      }, {
        label: 'Sat',
        selected: false,
        ind: 6
      }, {
        label: 'Sun',
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
  };

  $scope.clearAndCloseFilterMobile = function() {
    $scope.initializeFilters();
    $uibModalInstance.close();
  };

});

modViewMeals.controller('filterMealCtrl', ['$scope', 'viewMealsFilterService', function($scope, viewMealsFilterService) {

  $scope.dateFilterMin_open = function() {
    $scope.filter.dateFilterMin.opened = true;
  };

  $scope.dateFilterMax_open = function() {
    $scope.filter.dateFilterMax.opened = true;
  };

  $scope.applyFilters = function() {
    viewMealsFilterService.set($scope.filter);
  };

  $scope.initializeFilters = function() {
    $scope.filter = {
      weekDays: [{
        label: 'Mon',
        selected: false,
        ind: 1
      }, {
        label: 'Tu',
        selected: false,
        ind: 2
      }, {
        label: 'Wed',
        selected: false,
        ind: 3
      }, {
        label: 'Th',
        selected: false,
        ind: 4
      }, {
        label: 'Fr',
        selected: false,
        ind: 5
      }, {
        label: 'Sat',
        selected: false,
        ind: 6
      }, {
        label: 'Sun',
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
  };


  $scope.getFilters = function() {
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
  }),

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
          filtered.push(items[i])
        }
      }
      return filtered;
    }
  })