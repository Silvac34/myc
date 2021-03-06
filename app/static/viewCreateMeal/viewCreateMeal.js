'use strict';

export default angular.module('myApp.viewCreateMeal', ['ui.router', 'ngAnimate', 'ezfb', 'ngAutocomplete'])

.controller('ViewCreateMealCtrl', ['$scope', '$http', '$uibModal', '$state', 'ENV', 'ezfb', '$auth', '$rootScope', 'userServicesFactory', function($scope, $http, $uibModal, $state, ENV, ezfb, $auth, $rootScope, userServicesFactory) {
  //$scope pour le plugin checkbox messenger
  $scope.origin = ENV.fbRedirectURI + "#/create_meal";
  $scope.page_id = ENV.page_id;
  $scope.app_id = ENV.appId;
  $scope.user_ref = Math.floor((Math.random() * 10000000000000) + 1);


  if ($scope.$parent.$parent.fromState.name != "") { // si on rafraichit la page alors le state d'avant est vide sinon, on relance le plugin
    $scope.$applyAsync(function() { // pour que le plugin prenne en compte correctement les paramètres alors il faut l'appeler après que le scope se soit mis en place
      ezfb.XFBML.parse(document.getElementById('fb-messenger-checkbox')); //XFBML.parse relance le plugin
    });
  }
  function confirmOptIn() {
    ezfb.AppEvents.logEvent('MessengerCheckboxUserConfirmation', null, {
      'app_id': ENV.appId,
      'page_id': ENV.page_id,
      'ref': $scope.$parent.$root.user._id,
      'user_ref': $scope.user_ref
    });
  }

  //initialize the editedMeal model
  $scope.editedMeal = $scope.editedMeal || {
      veggies: false,
      vegan: false,
      time: predefined_date,
      detailedInfo: {
        "requiredGuests": {}
      },
      automaticSubscription: false,
      address: {},
      privateInfo: {
        "address": {}
      }
    },

    $scope.setValue = function(variable) {
      if (typeof variable === 'undefined') {
        return undefined;
      }
      else {
        return variable.toString();
      }
    };

  $scope.createMeal = function() {
    if ($scope.isAuthenticated() == false) {
      $auth.authenticate('facebook') // connection via facebook
        .then(function(response) {
          console.debug("success", response);
          if ($auth.isAuthenticated()) {
            userServicesFactory().then(function(data) {
              $rootScope.user = data;
              if (data.privateInfo.cellphone) {
                createMealWithPhone();
              }
              else {
                if ($scope.createMealForm.inputCellphone.$modelValue) {
                  $http.patch('api/users/private/' + $rootScope.user._id, {
                    "privateInfo": {
                      "cellphone": $scope.createMealForm.inputCellphone.$modelValue
                    }
                  }, {
                    headers: {
                      "If-Match": $rootScope.user._etag
                    }
                  }).then(function successCallBack(response) {
                    $scope.user._etag = response.data._etag;
                    createMealWithPhone();
                  });
                }
                else {
                  console.log("please fill your number");
                }
              }
            });
          }
        });
    }
    else {
      if ($scope.createMealForm.inputCellphone.$dirty && $scope.createMealForm.inputCellphone.$valid) {
        $http.patch('api/users/private/' + $scope.$parent.$root.user._id, {
          "privateInfo": {
            "cellphone": $scope.$parent.$root.user.privateInfo.cellphone
          }
        }, {
          headers: {
            "If-Match": $scope.$parent.$root.user._etag
          }
        }).then(function successCallBack(response) {
          $scope.user._etag = response.data._etag;
          createMealWithPhone();
        });
      }
      else if ($scope.createMealForm.inputCellphone.$invalid) {
        console.log("please fill your number");
      }
      else {
        createMealWithPhone();
      }
    }
  };

  function setDate(dateToSet) {
    dateToSet.setDate($scope.editedMeal.time.getDate());
    dateToSet.setMonth($scope.editedMeal.time.getMonth());
    dateToSet.setFullYear($scope.editedMeal.time.getFullYear());
  }

  function createMealWithPhone() {
    getAddressFromAutocomplete();
    var okToPost = true;
    if ($scope.editedMeal.menu != undefined) {
      if ($scope.editedMeal.menu.title != undefined) {
        if ($scope.editedMeal.detailedInfo.requiredGuests != undefined) {
          if ($scope.editedMeal.detailedInfo.requiredGuests.cooks != undefined) {
            if ($scope.editedMeal.detailedInfo.requiredGuests.cooks.nbRquCooks == null || $scope.editedMeal.detailedInfo.requiredGuests.cooks.nbRquCooks == 0) {
              delete $scope.editedMeal.detailedInfo.requiredGuests.cooks; //si on a essayé de rentrer des aides cuisines mais que finalement on en veut plus, on le supprime
            }
            else if ($scope.editedMeal.detailedInfo.requiredGuests.cooks.nbRquCooks < 0) {
              console.log("you are trying to do somehting ilegal with the number of cooks!");
              okToPost = false;
            }
            setDate($scope.editedMeal.detailedInfo.requiredGuests.cooks.timeCooking);
            if ($scope.editedMeal.detailedInfo.requiredGuests.cooks.timeCooking > $scope.editedMeal.time) {
              okToPost = false;
            }
          }
          if ($scope.editedMeal.detailedInfo.requiredGuests.cleaners != undefined) {
            if ($scope.editedMeal.detailedInfo.requiredGuests.cleaners.nbRquCleaners == null || $scope.editedMeal.detailedInfo.requiredGuests.cleaners.nbRquCleaners == 0) {
              delete $scope.editedMeal.detailedInfo.requiredGuests.cleaners; //si on a essayé de rentrer des aides vaisselles mais que finalement on en veut plus, on le supprime
            }
            else if ($scope.editedMeal.detailedInfo.requiredGuests.cleaners.nbRquCleaners < 0) {
              console.log("you are trying to do somehting ilegal with the number of cleaners!");
              okToPost = false;
            }
            if ($scope.editedMeal.detailedInfo.requiredGuests.cleaners.timeCleaning) {
              setDate($scope.editedMeal.detailedInfo.requiredGuests.cleaners.timeCleaning);
            }
          }
          if ($scope.editedMeal.detailedInfo.requiredGuests.simpleGuests != undefined) {
            if ($scope.editedMeal.detailedInfo.requiredGuests.simpleGuests.nbRquSimpleGuests == null || $scope.editedMeal.detailedInfo.requiredGuests.simpleGuests.nbRquSimpleGuests == 0) {
              delete $scope.editedMeal.detailedInfo.requiredGuests.simpleGuests; //si on a essayé de rentrer des invités simple mais que finalement on en veut plus, on le supprime
            }
            else if ($scope.editedMeal.detailedInfo.requiredGuests.simpleGuests.nbRquSimpleGuests < 0) {
              console.log("you are trying to do somehting ilegal with the number of cleaners!");
              okToPost = false;
            }
          }
        }
        if ($scope.editedMeal.address.town == undefined || $scope.editedMeal.privateInfo.address.name == undefined) {
          console.log("address is missing");
          okToPost = false;
        }
        if ($scope.editedMeal.price == undefined) {
          console.log("price of the groceries is missing");
          okToPost = false;
        }
        if (okToPost == true) {
          $http.post('/api/meals', $scope.editedMeal).then(function(response) {
              if (!$scope.$parent.$root.user.privateInfo.user_ref) {
                confirmOptIn();
              }
              $state.go("view_my_dtld_meals", {
                "myMealId": response.data._id,
                "successSubscribedMessage": true
              });
            },
            function(response) {
              console.log(response); //sert à préparer le terrain pour afficher les erreurs qui pourraient avoir lieu lors de la publication d'un repas
            });
        }
      }
    }
  }

  function getAddressFromAutocomplete() {
    var precision_needed_for_rounding_lat_lng = 100;
    if ($scope.details != undefined) {
      if ("vicinity" in $scope.details) {
        $scope.editedMeal.address.town = $scope.details.vicinity;
      }
      else {
        $scope.editedMeal.address.town = $scope.autocompleteAddress.split(",")[0];
      }
      $scope.editedMeal.privateInfo.address.name = $scope.details.name;
      $scope.editedMeal.privateInfo.address.utc_offset = $scope.details.utc_offset;
      $scope.editedMeal.privateInfo.address.lat = $scope.details.geometry.location.lat();
      $scope.editedMeal.privateInfo.address.lng = $scope.details.geometry.location.lng();
      $scope.editedMeal.address.lat = Math.round($scope.details.geometry.location.lat() * precision_needed_for_rounding_lat_lng) / precision_needed_for_rounding_lat_lng;
      $scope.editedMeal.address.lng = Math.round($scope.details.geometry.location.lng() * precision_needed_for_rounding_lat_lng) / precision_needed_for_rounding_lat_lng;
      for (var i = 0; i < $scope.details.address_components.length; i++) {
        if ($scope.details.address_components[i].types[0] == "postal_code") {
          $scope.editedMeal.address.postalCode = $scope.details.address_components[i].long_name;
        }
      }
    }
  }

  //required for the calendar toolbar (datamodel : editedMeal.time)

  $scope.dateOptions = {
    formatYear: 'yy',
    maxDate: new Date(2020, 5, 22),
    minDate: new Date(),
    startingDay: 1
  };


  $scope.clear = function() {
    $scope.editedMeal.time = null;
  };

  $scope.date_open = function() {
    $scope.date_popup.opened = true;
  };

  $scope.date_popup = {
    opened: false
  };

  //date formats for datepicker
  $scope.date_formats = ['EEEE dd MMMM yyyy', 'dd-MMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
  $scope.date_format = $scope.date_formats[0];
  $scope.altInputDateFormats = ['M!/d!/yyyy'];

  //required for the calendar toolbar (datamodel : editedMeal.time)

  $scope.ismeridian = false;
  $scope.mstep = 10;

  //enable animations in the modal
  $scope.animationsEnabled = true;

  $scope.autocomplete;

  $scope.editedMeal.currency_symbol = "$";
  $http.get("/static/sources/createMeal/currency.json").then(function(result_currency) {
    $http.get("/static/sources/createMeal/currency_symbol.json").then(function(result_currency_symbol) {
      $http.get("/static/sources/profile/countries.json").then(function(res) {
        $scope.$watch('details', function getCurrency() {
          if ($scope.details != undefined) {
            for (var i = 0; i < $scope.details.address_components.length; i++) {
              if ($scope.details.address_components[i].types[0] == "country") {
                var country_code = $scope.details.address_components[i].short_name;
              }
            }
            var currency = result_currency.data[country_code];
            $scope.editedMeal.currency_symbol = result_currency_symbol.data[currency].symbol_native;
            $scope.editedMeal.address.country = getCountry(country_code, res.data);
          }
        });
      });
    });
  });

  function getCountry(country_code, jsonData) {
    for (var i = 0; i < jsonData.length; i++) {
      if (jsonData[i].code == country_code) {
        return jsonData[i].name;
      }
    }
  }

}]);

var predefined_date = new Date();
predefined_date.setDate(predefined_date.getDate());
predefined_date.setHours(20);
predefined_date.setMinutes(30);