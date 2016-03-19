'use strict';

angular.module('myApp.viewCreateMeal', ['ui.router'])

.config(['$stateProvider','$urlRouterProvider',function($stateProvider, $urlRouterProvider) {

  /*$stateProvider
      .state('create_meal', {
        url: '/create_meal',
        templateUrl: 'static/viewCreateMeal/viewCreateMeal.html',
        controller: 'ViewCreateMealCtrl'
      })*/
}])

.controller('ViewCreateMealCtrl', ['$scope', '$http', function($scope, $http) {

    $scope.createMeal = function(meal) {
            $http.post('/api/meal', meal);
        },


    $scope.checkboxHelpType = {
        buying: false,
        cooking: false,
        cleaning: false,
        notHelping: false

    },
    
    $scope.excludingHelp = function(){
        $scope.checkboxHelpType.buying= false,
        $scope.checkboxHelpType.cooking= false,
        $scope.checkboxHelpType.cleaning= false
    },
    
    $scope.includingHelp = function(){
        $scope.checkboxHelpType.notHelping= false
    }
    
    $scope.choices = [{option: "Si"}, {option: "No"}];
}]);
