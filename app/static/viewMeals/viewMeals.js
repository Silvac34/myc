'use strict';

var modViewMeals = angular.module('myApp.viewMeals', ['ui.router','angular-svg-round-progressbar','ui.bootstrap'])

.config(['$stateProvider','$urlRouterProvider',function($stateProvider, $urlRouterProvider) {

}])


.controller('ViewMealsCtrl', ['$scope','$http',function($scope,$http) {

  $scope.loadMeals = function () {
    $http.get('/api/meals').success(function (data) {
      $scope.meals = data;
    })
  }
  
  $scope.reverse = false;
  $scope.SortOrder='asc';

  $scope.loadMeals();

}]);


modViewMeals.controller('ModalFilterCtrl', function($scope, $uibModal, $log) {

  //$scope.items = ['item1', 'item2', 'item3'];

  $scope.open = function(size) {

    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'static/viewMeals/viewFilter/filterMobile.html',
      controller: 'ModalInstanceCtrl',
      size: size,
//      resolve: {
//        items: function() {
//          return $scope.items;
//        }
//      }
    });

    modalInstance.result.then(function(selectedItem) {
      $scope.selected = selectedItem;
    }, function() {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };

});

// Please note that $uibModalInstance represents a modal window (instance) dependency.
// It is not the same as the $uibModal service used above.

modViewMeals.controller('ModalInstanceCtrl', function($scope, $uibModalInstance) {

  $scope.dateFilterMin = $scope.dateFilterMin || {
    opened: false
    //value: Date('01.01.2016')
  },
  
  $scope.dateFilterMin_open = function() {
    $scope.dateFilterMin.opened = true;
  };
  
  $scope.dateFilterMax = $scope.dateFilterMax || {
    opened: false
    //value: Date('01.01.2016')
  },
  
  $scope.dateFilterMax_open = function() {
    $scope.dateFilterMax.opened = true;
  };

});