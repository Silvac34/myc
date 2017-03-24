'use strict';

angular.module('myApp.welcome', ['ui.router'])

.controller('WelcomeCtrl', ['$scope', function($scope) {
    $scope.status = {
        isopenWelcome: false
    };

  
}]);
