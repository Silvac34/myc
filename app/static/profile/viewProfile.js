'use strict';

export default angular.module('myApp.viewProfile', ['dateDropdownService'])

  .controller('ViewProfileCtrl', ['$scope', '$http', 'userInfo', 'ENV', 'ezfb', '$timeout', 'getUserReviewServiceFactory', 'getSpecificUserFactory', '$state', '$uibModal', '$auth', function($scope, $http, userInfo, ENV, ezfb, $timeout, getUserReviewServiceFactory, getSpecificUserFactory, $state, $uibModal, $auth) {

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
          "keep": false,
          "preferences": {}
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
      if ($scope.user.gender) {
        if (gender != setValueScope($scope.user.gender)) {
          origUser.gender = $scope.user.gender;
        }
      }
      if (spoken_languages != setValueScope($scope.user.spoken_languages)) {
        origUser.spoken_languages = $scope.user.spoken_languages;
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
            setDietaryPreferencesToTrue(); //si la liste des villes pour les notifications devient vide alors on définit comme faux les préférences végétariennes et veganes de l'user
          }
        }
        if ("preferences")
          if ("omnivorous_notification" in $scope.user.privateInfo.preferences) {
            if (omnivorous_notification != setValueScope($scope.user.privateInfo.preferences.omnivorous_notification)) {
              origUser.privateInfo.preferences["omnivorous_notification"] = $scope.user.privateInfo.preferences.omnivorous_notification;
              origUser.privateInfo.keep = true;
              origUser.privateInfo.user_ref = $scope.user_ref;
            }
          }
        if ("veggies_notification" in $scope.user.privateInfo.preferences) {
          if (veggies_notification != setValueScope($scope.user.privateInfo.preferences.veggies_notification)) {
            origUser.privateInfo.preferences["veggies_notification"] = $scope.user.privateInfo.preferences.veggies_notification;
            origUser.privateInfo.keep = true;
            origUser.privateInfo.user_ref = $scope.user_ref;
          }
        }
        if ("vegan_notification" in $scope.user.privateInfo.preferences) {
          if (vegan_notification != setValueScope($scope.user.privateInfo.preferences.vegan_notification)) {
            origUser.privateInfo.preferences["vegan_notification"] = $scope.user.privateInfo.preferences.vegan_notification;
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

    function checkIfSpokenLanguageIsNew(languageToAdd) {
      if ($scope.user.spoken_languages == undefined) {
        $scope.user.spoken_languages = [languageToAdd];
      }
      else {
        if ($scope.user.spoken_languages.includes(languageToAdd) == false) {
          $scope.user.spoken_languages.push(languageToAdd);
        }
      }
    }

    function setDietaryPreferencesToTrue() {
      if ($scope.user.privateInfo.preferences.city_notification.length == 0) {
        $scope.user.privateInfo.preferences.omnivorous_notification = true;
        $scope.user.privateInfo.preferences.veggies_notification = true;
        $scope.user.privateInfo.preferences.vegan_notification = true;
      }
    }

    if ($scope.$parent.user == undefined) { // si l'utilisateur n'est pas connecté
      $state.go('login');
    }
    else {
      if (userInfo.data._id == $scope.$parent.user._id) { // si l'utilisateur consulte son profil
        $scope.user = $scope.$parent.user;
        var cellphone = setValue($scope.user.privateInfo.cellphone);
        var email = setValue($scope.user.privateInfo.email);
        var city_notification = "";
        var omnivorous_notification = "";
        var veggies_notification = "";
        var vegan_notification = "";
        if ("preferences" in $scope.user.privateInfo) {
          if ("city_notification" in $scope.user.privateInfo.preferences) {
            city_notification = setValue($scope.user.privateInfo.preferences.city_notification);
          }
          if ("omnivorous_notification" in $scope.user.privateInfo.preferences) {
            omnivorous_notification = setValue($scope.user.privateInfo.preferences.omnivorous_notification);
          }
          if ("veggies_notification" in $scope.user.privateInfo.preferences) {
            veggies_notification = setValue($scope.user.privateInfo.preferences.veggies_notification);
          }
          if ("vegan_notification" in $scope.user.privateInfo.preferences) {
            vegan_notification = setValue($scope.user.privateInfo.preferences.vegan_notification);
          }
        }
        else { //si l'utilisateur actualise son profil et qu'il n'a pas de préférence alors par défaut il a des notifications sur tout les repas. Ca permet dans le back la reqûete sql en utilisant celery
          $scope.user.privateInfo.preferences = {
            "omnivorous_notification": true,
            "veggies_notification": true,
            "vegan_notification": true
          };
        }
      }
      else { //si l'utilisateur consulte le profil de quelqu'un d'autre
        $scope.user = userInfo.data;

        $http.get('api/meals?where={"users._id": "' + $scope.user._id + '"}').then(function(res) { // on récupère les meals de l'utilisateur dont on consulte le profil
          $scope.meals = res.data._items;
          for (var j = 0; j < $scope.meals.length; j++) {
            if ("cooks" in $scope.meals[j].detailedInfo.requiredGuests) {
              $scope.meals[j].mealPrice = $scope.meals[j].detailedInfo.requiredGuests.cooks.price; // si aide cuisine alors le prix du repas est le prix de l'aide cuisine
            }
            else if ("cleaners" in $scope.meals[j].detailedInfo.requiredGuests) {
              $scope.meals[j].mealPrice = $scope.meals[j].detailedInfo.requiredGuests.cleaners.price; // si pas aide cuisine et aide vaisselle alors le prix du repas est le prix de l'aide vaisselle
            }
            else if ("simpleGuests" in $scope.meals[j].detailedInfo.requiredGuests) {
              $scope.meals[j].mealPrice = $scope.meals[j].detailedInfo.requiredGuests.simpleGuests.price; //sinon c'est soit le prix d'aide cuisine s'il n'y a ni l'un ni l'autre
            }
            else {
              $scope.meals[j].mealPrice = $scope.meals[j].detailedInfo.requiredGuests.hosts.price; // si le repas n'a pas d'invités (par précaution), c'est le prix de l'hôte
            }
            $scope.meals[j].priceUnit = Math.ceil(10 * $scope.meals[j].price / $scope.meals[j].nbGuests) / 10; //sera utilisé pour viewMyMealDtld pour la phrase de variation de prix
          }
        });

        $state.go("profile.mealsList"); //on active le ui-view de meals-liste

        //on définit le prix du repas qui doit s'afficher

        $scope.openModalDtld = function(meal_id) { //permet d'ouvrir les modals de chacun de repas associés
          for (var i = 0; i < $scope.meals.length; i++) {
            if ($scope.meals[i]._id == meal_id) {
              if ($scope.meals[i].detailedInfo.subscribed == true) {
                $state.go("view_my_dtld_meals", {
                  "myMealId": meal_id
                });
              }
              else {
                var modalInstance = $uibModal.open({
                  animation: true,
                  templateUrl: 'static/viewMeals/viewMealsDtld/viewMealsDtld.html',
                  controller: 'ViewMealsDtldCtrl',
                  size: "lg",
                  windowClass: 'modal-meal-window',
                  resolve: {
                    meal: function() {
                      return $scope.meals[i];
                    },
                    isAuthenticated: function() {
                      return $auth.isAuthenticated();
                    }
                  }
                });
                modalInstance.result.then(function(result) {
                  var result_value = result;
                  if (result_value == undefined) {
                    result_value = {
                      "manualSubscriptionPending": false,
                      "pending": false
                    };
                  }
                  $scope.manualSubscriptionPending = result_value.manualSubscriptionPending;
                  for (var i = 0; i < $scope.meals.length; i++) {
                    if ($scope.meals[i]._id == meal_id) {
                      $scope.meals[i].detailedInfo.pending = result_value.pending;
                    }
                  }
                });
              }
            }
          }
        };
      }
      $scope.user._created = new Date(parseInt($scope.user._id.substring(0, 8), 16) * 1000);
      $scope.user.reviews = $scope.user.reviews || {};
      $scope.user.reviews.positive = $scope.user.reviews.positive || 0;
      $scope.user.reviews.neutral = $scope.user.reviews.neutral || 0;
      $scope.user.reviews.negative = $scope.user.reviews.negative || 0;
      var birthdate = setValue($scope.user.birthdate);
      var presentation = setValue($scope.user.presentation);
      if ($scope.user.gender) {
        var gender = setValue($scope.user.gender);
      }
      var spoken_languages = setValue($scope.user.spoken_languages);
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

      $scope.addSpokenLanguage = function($event) {
        if (event.which === 13 && event.type == "keypress" || event.type == "click") {
          checkIfSpokenLanguageIsNew(this.userSpokenLanguage.name);
          delete this.userSpokenLanguage;
        }
      };

      $scope.removeSpokenLanguage = function() {
        var index = $scope.user.spoken_languages.indexOf(this.spoken_language);
        if (index > -1) {
          $scope.user.spoken_languages.splice(index, 1);
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
              if ($scope.user.gender) {
                gender = setValue($scope.user.gender);
              }
              spoken_languages = setValue($scope.user.spoken_languages);
              if ($scope.user.country_of_origin != undefined) {
                country_of_origin_name = setValue($scope.user.country_of_origin.name);
              }
              if ("preferences" in $scope.user.privateInfo) {
                if ("city_notification" in $scope.user.privateInfo.preferences) {
                  city_notification = setValue($scope.user.privateInfo.preferences.city_notification);
                }
                if ("omnivorous_notification" in $scope.user.privateInfo.preferences) {
                  omnivorous_notification = setValue($scope.user.privateInfo.preferences.omnivorous_notification);
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