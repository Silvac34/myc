'use strict';

angular.module('myApp.viewProfile', [ /*'google.places'*/ ])

.controller('ViewProfileCtrl', ['$scope', '$http', function($scope, $http) {

  $scope.user = $scope.$parent.user;

  var setValue = function(variable) {
    if (typeof variable === 'undefined') {
      return undefined;
    }
    else {
      return variable.toString();
    }
  };

  var setValueScope = function(variable) {
    if (typeof variable === 'undefined') {
      return undefined;
    }
    if (variable == null) {
      return null;
    }
    else {
      return variable.toString();
    }
  };

  var cellphone = setValue($scope.user.privateInfo.cellphone);
  var email = setValue($scope.user.privateInfo.email);
  var age = setValue($scope.user.age);
  var presentation = setValue($scope.user.presentation);
  //var country_of_origin = setValue($scope.user.country_of_origin);

  $scope.autocompleteOptions = {
    types: ['(cities)']
  };

  function getDataToPerform() {
    var origUser = {
      "privateInfo": {
        "keep": false
      }
    };
    if (cellphone != setValueScope($scope.user.privateInfo.cellphone)) {
      origUser.privateInfo.cellphone = $scope.user.privateInfo.cellphone;
      origUser.privateInfo.keep = true;
    }
    if (email != setValueScope($scope.user.privateInfo.email)) {
      origUser.privateInfo.email = $scope.user.privateInfo.email;
      origUser.privateInfo.keep = true;
    }
    if (age != setValueScope($scope.user.age)) {
      origUser.age = $scope.user.age;
    }
    if (presentation != setValueScope($scope.user.presentation)) {
      origUser.presentation = $scope.user.presentation;
    }
    /*if (country_of_origin != setValueScope($scope.user.country_of_origin)) {
      origUser.country_of_origin = $scope.user.country_of_origin;
    }*/
    if (origUser.privateInfo.keep == false) {
      delete origUser.privateInfo;
    }
    else {
      delete origUser.privateInfo.keep;
    }
    if (angular.equals(origUser, {})) {
      return null;
    }
    return origUser;
  }


  $scope.actualizeUser = function(user_id, _etag) {
    var dataToPerform = getDataToPerform();
    if (dataToPerform != null) { //check si dataToPerfom est vide
      var config = {
        headers: {
          'IF-Match': _etag
        }
      };
      $http.patch('api/users/private/' + user_id, dataToPerform, config).then(function successCallBack(response) {
        $scope.user._etag = response.data._etag;
        cellphone = setValue($scope.user.privateInfo.cellphone);
        email = setValue($scope.user.privateInfo.email);
        age = setValue($scope.user.age);
        presentation = setValue($scope.user.presentation);
        //country_of_origin = setValue($scope.user.country_of_origin);
      }, function errorCallback(response) {
        console.log("We couldn't delete a data that was here before. Please contact Dimitri");
      });
    }
  };

}]);
