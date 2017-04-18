'use strict';

angular.module('myApp.viewProfile', [ /*'google.places'*/ ])

.controller('ViewProfileCtrl', ['$scope', '$http', 'userInfo', function($scope, $http, userInfo) {

  function setValue(variable) {
    if (typeof variable === 'undefined') {
      return undefined;
    }
    else {
      return variable.toString();
    }
  }

  function setValueScope(variable) {
    if (typeof variable === 'undefined') {
      return undefined;
    }
    if (variable == null) {
      return null;
    }
    else {
      return variable.toString();
    }
  }

  if (userInfo.data._id == $scope.$parent.user._id) {
    $scope.user = $scope.$parent.user;
    var cellphone = setValue($scope.user.privateInfo.cellphone);
    var email = setValue($scope.user.privateInfo.email);
  }
  else {
    $scope.user = userInfo.data;
  }

  var age = setValue($scope.user.age);
  var presentation = setValue($scope.user.presentation);
  //var country_of_origin = setValue($scope.user.country_of_origin);

  $scope.autocompleteOptions = {
    types: ['(cities)']
  };

  function getDataToPerform() {
    var actionProhibited = false;
    var origUser = {
      "privateInfo": {
        "keep": false
      }
    };
    if (cellphone != setValueScope($scope.user.privateInfo.cellphone)) {
      if ($scope.user.privateInfo.cellphone == "") {
        actionProhibited = true;
      }
      else {
        origUser.privateInfo.cellphone = $scope.user.privateInfo.cellphone;
        origUser.privateInfo.keep = true;
      }
    }
    if (email != setValueScope($scope.user.privateInfo.email)) {
      if ($scope.user.privateInfo.email == "") {
        actionProhibited = true;
      }
      else {
        origUser.privateInfo.email = $scope.user.privateInfo.email;
        origUser.privateInfo.keep = true;
      }
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
    if (origUser.privateInfo.keep == false) { //permet de savoir s'il faut garder les privates info à upload ou non
      delete origUser.privateInfo;
    }
    else {
      delete origUser.privateInfo.keep;
    }
    if (angular.equals(origUser, {})) {
      if (actionProhibited == true) {
        return "this action is prohibited";
      }
      else {
        return null;
      }
    }
    if (actionProhibited == true) {
      return "this action is prohibited";
    }
    else {
      return origUser;
    }
  }


  $scope.actualizeUser = function(user_id, _etag) {
    if ($scope.actualized != undefined) {
      delete $scope.actualized;
    }
    var dataToPerform = getDataToPerform();
    if (dataToPerform == "this action is prohibited") {
      console.log("email or cellphone are needed to participate");
      $scope.actualized = "error";
    }
    else {
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
          $scope.actualized = true;
        }, function errorCallback(response) {
          console.log("We couldn't delete a data that was here before. Please contact Dimitri");
          $scope.actualized = false;
        });
      }
    }
  };
}]);
