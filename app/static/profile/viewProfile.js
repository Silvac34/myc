'use strict';

angular.module('myApp.viewProfile', [])

.controller('ViewProfileCtrl', ['$scope', 'userServices', function($scope, userServices) {

  $scope.getUserProfile = function() {
      userServices.getUserInfo().then(function(data) {
        $scope.user = data;
      });
  };

  $scope.getUserProfile();

}]);
