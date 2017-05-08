'use strict';

angular.module('myApp.viewProfile', ['dateDropdownService'])

.controller('ViewProfileCtrl', ['$scope', '$http', 'userInfo', 'ENV', 'ezfb', function($scope, $http, userInfo, ENV, ezfb) {

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
  var whymycommuneaty = setValue($scope.user.whymycommuneaty);
  var country_of_origin_name = "";
  if ($scope.user.country_of_origin != undefined) {
    country_of_origin_name = setValue($scope.user.country_of_origin.name);
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
    if (whymycommuneaty != setValueScope($scope.user.whymycommuneaty)) {
      origUser.whymycommuneaty = $scope.user.whymycommuneaty;
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
          whymycommuneaty = setValue($scope.user.whymycommuneaty);
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

  //$scope pour le plugin checkbox messenger
  $scope.origin = ENV.fbRedirectURI + "#/create_meal/" + userInfo.data._id;
  $scope.page_id = ENV.page_id;
  $scope.app_id = ENV.appId;
  $scope.user_ref = Math.floor((Math.random() * 10000000000000) + 1);

  $scope.$applyAsync(function() { //on relance le plugin pour qu'il prenne en compte correctement les paramètres du scope / on l'appelle après que le scope se soit mis en place
    ezfb.XFBML.parse(document.getElementById('fb-messenger-checkbox')); //XFBML.parse relance le plugin
  });

  function confirmOptIn() {
    ezfb.AppEvents.logEvent('MessengerCheckboxUserConfirmation', null, {
      'app_id': ENV.appId,
      'page_id': ENV.page_id,
      'ref': $scope.$parent.$root.user._id,
      'user_ref': $scope.user_ref
    });
  }

}])

.filter('ageFilter', ['getAgeServiceFactory', function(getAgeServiceFactory) {
  return function(birthdate) {
    return getAgeServiceFactory(birthdate);
  };
}]);
