'use strict';

angular.module('myApp.welcome', ['ui.router'])

.controller('WelcomeCtrl', ['$scope', function($scope) {
    $scope.myInterval = 5000;
    $scope.noWrapSlides = false;
    $scope.active = 0;
    var slides = $scope.slides = [];
}]);
