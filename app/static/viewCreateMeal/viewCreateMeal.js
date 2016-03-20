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
    //ngrepeat for the veggie question
    $scope.choices = [{option: "Si", default_option: false}, {option: "No",  default_option: true}];
    ////ngrepeat for the cooking question
    $scope.nbCookers = [{number_cooker: "0", default_option: true}, {number_cooker: "1", default_option: false}, {number_cooker: "2", default_option: false}, {number_cooker: "3", default_option: false}, {number_cooker: "4", default_option: false}, {number_cooker: "5", default_option: false}];
    //ngrepeat for the cleaning question
    $scope.nbCleaners = [{number_cleaner: "0", default_option: true}, {number_cleaner: "1", default_option: false}, {number_cleaner: "2", default_option: false}, {number_cleaner: "3", default_option: false}, {number_cleaner: "4", default_option: false}, {number_cleaner: "5", default_option: false}];
    
}]);
