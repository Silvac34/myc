'use strict';

angular.module('myApp.viewProfile', ['dateDropdownService'])

.controller('ViewProfileCtrl', ['$scope', '$http', 'userInfo', 'ENV', 'ezfb', '$timeout', 'getUserReviewServiceFactory', 'getSpecificUserFactory', '$state', function($scope, $http, userInfo, ENV, ezfb, $timeout, getUserReviewServiceFactory, getSpecificUserFactory, $state) {

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
    if (gender != setValueScope($scope.user.gender)) {
      origUser.gender = $scope.user.gender;
    }
    if (speaking_languages != setValueScope($scope.user.speaking_languages)) {
      origUser.speaking_languages = $scope.user.speaking_languages;
    }
    if ("country_of_origin" in $scope.user) {
      if (country_of_origin_name != setValueScope($scope.user.country_of_origin.name)) {
        origUser.country_of_origin = $scope.user.country_of_origin;
      }
    }
    if ("preferences" in $scope.user.privateInfo) {
      if ("city_notification" in $scope.user.privateInfo.preferences) {
        if (city_notification != setValueScope($scope.user.privateInfo.preferences.city_notification)) {
          origUser.privateInfo.preferences = {
            "city_notification": $scope.user.privateInfo.preferences.city_notification
          };
          origUser.privateInfo.keep = true;
          origUser.privateInfo.user_ref = $scope.user_ref;
          setDietaryPreferencesToNull(); //si la liste des villes pour les notifications devient vide alors on définit comme faux les préférences végétariennes et veganes de l'user
        }
      }
      if ("veggies_notification" in $scope.user.privateInfo.preferences) {
        if (veggies_notification != setValueScope($scope.user.privateInfo.preferences.veggies_notification)) {
          origUser.privateInfo.preferences = {
            "veggies_notification": $scope.user.privateInfo.preferences.veggies_notification
          };
          origUser.privateInfo.keep = true;
          origUser.privateInfo.user_ref = $scope.user_ref;
        }
      }
      if ("vegan_notification" in $scope.user.privateInfo.preferences) {
        if (vegan_notification != setValueScope($scope.user.privateInfo.preferences.vegan_notification)) {
          origUser.privateInfo.preferences = {
            "vegan_notification": $scope.user.privateInfo.preferences.vegan_notification
          };
          origUser.privateInfo.keep = true;
          origUser.privateInfo.user_ref = $scope.user_ref;
        }
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

  function addPreferencesToUser() {
    if ($scope.user.privateInfo.preferences == undefined) {
      $scope.user.privateInfo.preferences = {};
    }
  }

  function checkIfCityIsNew(cityToAdd) {
    if ($scope.user.privateInfo.preferences.city_notification == undefined) {
      $scope.user.privateInfo.preferences.city_notification = [cityToAdd];
    }
    else {
      if ($scope.user.privateInfo.preferences.city_notification.includes(cityToAdd) == false) {
        $scope.user.privateInfo.preferences.city_notification.push(cityToAdd);
      }
    }
  }

  function checkIfSpeakingLanguageIsNew(languageToAdd) {
    if ($scope.user.speaking_languages == undefined) {
      $scope.user.speaking_languages = [languageToAdd];
    }
    else {
      if ($scope.user.speaking_languages.includes(languageToAdd) == false) {
        $scope.user.speaking_languages.push(languageToAdd);
      }
    }
  }

  function setDietaryPreferencesToNull() {
    if ($scope.user.privateInfo.preferences.city_notification.length == 0) {
      $scope.user.privateInfo.preferences.veggies_notification = false;
      $scope.user.privateInfo.preferences.vegan_notification = false;
    }
  }

  if ($scope.$parent.user == undefined) {
    $state.go('login');
  }
  else {
    if (userInfo.data._id == $scope.$parent.user._id) {
      $scope.user = $scope.$parent.user;
      var cellphone = setValue($scope.user.privateInfo.cellphone);
      var email = setValue($scope.user.privateInfo.email);
      var city_notification = "";
      var veggies_notification = "";
      var vegan_notification = "";
      if ("preferences" in $scope.user.privateInfo) {
        if ("city_notification" in $scope.user.privateInfo.preferences) {
          city_notification = setValue($scope.user.privateInfo.preferences.city_notification);
        }
        if ("veggies_notification" in $scope.user.privateInfo.preferences) {
          veggies_notification = setValue($scope.user.privateInfo.preferences.veggies_notification);
        }
        if ("vegan_notification" in $scope.user.privateInfo.preferences) {
          vegan_notification = setValue($scope.user.privateInfo.preferences.vegan_notification);
        }
      }
      else { //si l'utilisateur actualise son profil et qu'il n'a pas de préférence alors par défaut il ne veut ni les notifications veggies et vegan. Ca permet dans le back la reqûete sql en utilisant celery
        $scope.user.privateInfo.preferences = {
          "veggies_notification": false,
          "vegan_notification": false
        };
      }
    }
    else {
      $scope.user = userInfo.data;
    }
    $scope.user._created = new Date(parseInt($scope.user._id.substring(0, 8), 16) * 1000);
    $scope.user.reviews = $scope.user.reviews || {};
    $scope.user.reviews.positive = $scope.user.reviews.positive || 0;
    $scope.user.reviews.neutral = $scope.user.reviews.neutral || 0;
    $scope.user.reviews.negative = $scope.user.reviews.negative || 0;
    var birthdate = setValue($scope.user.birthdate);
    var presentation = setValue($scope.user.presentation);
    var gender = setValue($scope.user.gender);
    var speaking_languages = setValue($scope.user.speaking_languages);
    var country_of_origin_name = "";
    if ($scope.user.country_of_origin != undefined) {
      country_of_origin_name = setValue($scope.user.country_of_origin.name);
    }

    $scope.addCityNotificationPreference = function($event) {
      addPreferencesToUser();
      if (event.which === 13 && event.type == "keypress" || event.type == "click") {
        if ("details" in this) {
          if ("vicinity" in this.details) {
            checkIfCityIsNew(this.details.vicinity);
          }
          else if (this.autocomplete != undefined) { //si il n'existe pas vicinity, alors on récupère la première partie de l'adresse avant la première virgule
            if (this.autocomplete.includes(",")) {
              var cityArray = this.autocomplete.split(",");
              checkIfCityIsNew(cityArray[0]);
            }
          }
        }
      }
    };

    $scope.removeCityNotificationPreference = function() {
      var index = $scope.user.privateInfo.preferences.city_notification.indexOf(this.cities);
      if (index > -1) {
        $scope.user.privateInfo.preferences.city_notification.splice(index, 1);
      }
    };

    $scope.addSpeakingLanguage = function($event) {
      if (event.which === 13 && event.type == "keypress" || event.type == "click") {
        checkIfSpeakingLanguageIsNew(this.userSpeakingLanguage.name);
      }
    };

    $scope.removeSpeakingLanguage = function() {
      var index = $scope.user.speaking_languages.indexOf(this.speaking_language);
      if (index > -1) {
        $scope.user.speaking_languages.splice(index, 1);
      }
    };

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
            birthdate = setValue($scope.user.birthdate);
            presentation = setValue($scope.user.presentation);
            gender = setValue($scope.user.gender);
            speaking_languages = setValue($scope.user.speaking_languages);
            if ($scope.user.country_of_origin != undefined) {
              country_of_origin_name = setValue($scope.user.country_of_origin.name);
            }
            if ("preferences" in $scope.user.privateInfo) {
              if ("city_notification" in $scope.user.privateInfo.preferences) {
                city_notification = setValue($scope.user.privateInfo.preferences.city_notification);
              }
              if ("veggies_notification" in $scope.user.privateInfo.preferences) {
                veggies_notification = setValue($scope.user.privateInfo.preferences.veggies_notification);
              }
              if ("vegan_notification" in $scope.user.privateInfo.preferences) {
                vegan_notification = setValue($scope.user.privateInfo.preferences.vegan_notification);
              }
            }
            $scope.actualized = true;
          }, function errorCallback(response) {
            console.log("We couldn't delete a data that was here before. Please contact Dimitri");
            $scope.actualized = false;
          });
        }
      }
      $timeout(function() {
        $scope.actualized = null;
      }, 8000);
    };

    $http.get("/static/sources/profile/countries.json").then(function(res) {
      $scope.countries = res.data;
    });

    $http.get("/static/sources/profile/languages.json").then(function(res) {
      $scope.languages = res.data;
    });

    //$scope pour le plugin checkbox messenger
    $scope.origin = ENV.fbRedirectURI + "#/profile/" + userInfo.data._id;
    $scope.page_id = ENV.page_id;
    $scope.app_id = ENV.appId;
    $scope.user_ref = Math.floor((Math.random() * 10000000000000) + 1).toString();

    if ($scope.$parent.$parent.fromState.name != "") { // si on rafraichit la page alors le state d'avant est vide sinon, on relance le plugin
      $scope.$applyAsync(function() { // pour que le plugin prenne en compte correctement les paramètres alors il faut l'appeler après que le scope se soit mis en place
        ezfb.XFBML.parse(document.getElementById('fb-messenger-checkbox')); //XFBML.parse relance le plugin
      });
    }

    $scope.confirmOptIn = function() {
      ezfb.AppEvents.logEvent('MessengerCheckboxUserConfirmation', null, {
        'app_id': ENV.appId,
        'page_id': ENV.page_id,
        'ref': $scope.$parent.$root.user._id,
        'user_ref': $scope.user_ref
      });
    };

    $scope.reviews = [];
    getUserReviewServiceFactory($scope.user._id).then(function successCallBack(responseGetUserReviews) {
      if (responseGetUserReviews.length > 0) {
        $scope.reviews = responseGetUserReviews;
        $scope.reviews.forEach(function(element) {
          getSpecificUserFactory(element.fromUser._id).then(function successCallBack(responseGetSpecificUser) {
            element.fromUser.datas = responseGetSpecificUser;
          });
        });
      }
    });

    $scope.capitalizeFirstLetter = function(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    };

    $scope.getDateFromObjectId = function(objectId) {
      return new Date(parseInt(objectId.substring(0, 8), 16) * 1000);
    };

  }

}])

.filter('ageFilter', ['getAgeServiceFactory', function(getAgeServiceFactory) {
  return function(birthdate) {
    return getAgeServiceFactory(birthdate);
  };
}]);