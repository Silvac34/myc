'use strict';

angular.module('myApp.view_fblogin', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view_fblogin', {
    templateUrl: 'static/view_fblogin/view_fblogin.html',
    controller: 'ViewFblogin'
  });
}])

.controller('ViewFblogin', [function() {

}]);
