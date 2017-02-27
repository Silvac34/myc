'use strict';

angular.module('myApp.viewLogin', ['ui.router', 'satellizer','userServices'])

.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {}])

.controller('ViewLoginCtrl', ['$scope', '$auth', '$state','userServices', function($scope, $auth, $state,userServices) {

  $scope.signUp = function() {
    $auth
      .signup({
        email: $scope.email,
        password: $scope.password
      })
      .then(function(response) {
        // set the token received from server
        $auth.setToken(response);
        // go to secret page
        $state.go('view_meals');
      })
      .catch(function(response) {
        console.log("error response", response);
      });
  };

  $scope.login = function() {
    $auth
      .login({
        email: $scope.email,
        password: $scope.password
      })
      .then(function(response) {
        $auth.setToken(response);
        $state.go('view_meals');
      })
      .catch(function(response) {
        console.log("error response", response);
      });
  };


  $scope.auth = function(provider) {
    $auth.authenticate(provider)
      .then(function(response) {
        console.debug("success", response);
        $scope.getUserInfo();
        $state.go('view_meals');
      })
      .catch(function(response) {
        console.debug("catch", response);
      });
  };

  $scope.getUserInfo = function() {
    userServices.getUserInfo().then(function(data) {
      $scope.$parent.user = data;
    });
  };

}]);
