'use strict';

angular.module('myApp.welcome', [])

.controller('WelcomeCtrl', ['$scope', function($scope) {
    $scope.status = {
        isopenWelcome: false
    };

}]);
