'use strict';

export default angular.module('myApp.viewLogin', [])

.controller('ViewLoginCtrl', ['$scope', function($scope) {
    if (!$scope.toState) {
        $scope.toState = {
            "name": "welcome"
        };
    }
}]);
