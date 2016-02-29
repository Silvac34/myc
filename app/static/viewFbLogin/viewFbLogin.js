'use strict';

angular.module('myApp.viewFbLogin', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/viewFbLogin', {
    templateUrl: 'static/viewFbLogin/viewFbLogin.html',
    controller: 'ViewFblogin'
  });
}])

.controller('ViewFbLogin', [function() {

}]);
