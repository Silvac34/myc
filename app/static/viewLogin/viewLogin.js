'use strict';

export default angular.module('myApp.viewLogin', [])

.controller('ViewLoginCtrl', ['$scope', function($scope) {
    $scope.toState = $scope.toState || "welcome";
}]);
