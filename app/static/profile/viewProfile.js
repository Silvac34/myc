'use strict';

angular.module('myApp.viewProfile', ['dateDropdownService'])

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

  $scope.user._created = new Date(parseInt($scope.user._id.substring(0, 8), 16) * 1000);
  var birthdate = setValue($scope.user.birthdate);
  var presentation = setValue($scope.user.presentation);
  if ($scope.user.country_of_origin == undefined) {
    var country_of_origin_name = "";
  }
  else {
    var country_of_origin_name = setValue($scope.user.country_of_origin.name);
  }

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
    if (birthdate != setValueScope($scope.user.birthdate)) {
      origUser.birthdate = $scope.user.birthdate;
    }
    if (presentation != setValueScope($scope.user.presentation)) {
      origUser.presentation = $scope.user.presentation;
    }
    if ($scope.user.country_of_origin != undefined) {
      if (country_of_origin_name != setValueScope($scope.user.country_of_origin.name)) {
        origUser.country_of_origin = $scope.user.country_of_origin;
      }
    }
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
    console.log(dataToPerform);
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
          birthdate = setValue($scope.user.birthdate);
          presentation = setValue($scope.user.presentation);
          if ($scope.user.country_of_origin != undefined) {
            country_of_origin_name = setValue($scope.user.country_of_origin.name);
          }
          $scope.actualized = true;
        }, function errorCallback(response) {
          console.log("We couldn't delete a data that was here before. Please contact Dimitri");
          $scope.actualized = false;
        });
      }
    }
  };

  $http.get("/static/sources/profile/countries.json").then(function(res) {
    $scope.countries = res.data;
  });

}])

.filter('ageFilter', function() {
  function calculateAge(birthday) { // birthday is a date
    var now = new Date;
    var birthday_value = new Date(birthday);
    var ageDifMs = now - birthday_value;
    var ageDate = new Date(ageDifMs); // miliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }

  return function(birthdate) {
    return calculateAge(birthdate);
  };
});
