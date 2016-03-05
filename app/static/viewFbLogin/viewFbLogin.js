'use strict';

angular.module('myApp.viewFbLogin', ['ui.router'])

.config(['$stateProvider','$urlRouterProvider',function($stateProvider, $urlRouterProvider) {

  $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: 'static/viewFbLogin/viewFbLogin.html',
        controller: 'ViewFblogin'
      })
}])

.controller('ViewFbLogin', [function() {

}]);
