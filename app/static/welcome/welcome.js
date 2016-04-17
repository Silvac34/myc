'use strict';

angular.module('myApp.welcome', ['ui.router'])

.config(['$stateProvider','$urlRouterProvider',function($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('welcome', {
        url: '/welcome',
        templateUrl: 'static/welcome/welcome.html',
        controller: 'WelcomeCtrl',
      })
}])

.controller('WelcomeCtrl', ['$scope','$http',function($scope,$http) {
 $scope 
}]);
