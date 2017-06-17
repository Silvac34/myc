'use strict';

var modMealsDetailed = angular.module('myApp.viewMealsDtld', ['angular-svg-round-progressbar', 'ui.bootstrap'])

.controller('ViewMealsDtldCtrl', ['$scope', '$http', 'meal', '$uibModalInstance', '$state', 'isAuthenticated', '$auth', 'userServicesFactory', '$rootScope', 'ENV', 'ezfb', 'getSpecificUserFactory', function($scope, $http, meal, $uibModalInstance, $state, isAuthenticated, $auth, userServicesFactory, $rootScope, ENV, ezfb, getSpecificUserFactory) {

  $scope.meal = meal;

  $scope.meal.users.forEach(function(element) {
    getSpecificUserFactory(element._id).then(function successCallBack(response) {
      element["first_name"] = response.first_name;
      element["last_name"] = response.last_name;
      element["gender"] = response.gender;
      element["picture"] = response.picture;
      if ("birthdate" in response) {
        element["birthdate"] = response.birthdate;
      }
      if ("country_of_origin" in response) {
        element["country_of_origin"] = response.country_of_origin;
      }
      if ("reviews" in response) {
        element["reviews"] = response.reviews;
      }
    });
  });

  $scope.origin = ENV.fbRedirectURI + "#/view_meal";
  $scope.page_id = ENV.page_id;
  $scope.app_id = ENV.appId;
  $scope.user_ref = Math.floor((Math.random() * 10000000000000) + 1);

  if ($scope.$parent.$root.fromState.name != "") { // si on rafraichit la page alors le state d'avant est vide sinon, on relance le plugin
    $scope.$applyAsync(function() { // pour que le plugin prenne en compte correctement les paramètres alors il faut l'appeler après que le scope se soit mis en place
      ezfb.XFBML.parse(document.getElementById('fb-messenger_checkbox')); //XFBML.parse relance le plugin
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

  var setValue = function(variable) {
    if (typeof variable === 'undefined') {
      return undefined;
    }
    else {
      return variable.toString();
    }
  };

  if (check($scope.$parent.$root.user)) {
    var cellphoneStr = setValue($scope.$parent.$root.user.privateInfo.cellphone); //on initie le téléphone comme un string
  }

  function needToUpdateCellphone() { // if true --> need to patch, if false --> need to return error, if null subscribe to a meal
    if (check($scope.$parent.$root.user)) {
      if (check($scope.$parent.$root.user.privateInfo)) {
        if (check($scope.$parent.$root.user.privateInfo.cellphone) || $scope.$parent.$root.user.privateInfo.cellphone == '') {
          if ($scope.$parent.$root.user.privateInfo.cellphone != '') {
            if (cellphoneStr != '' && cellphoneStr != undefined) { // si quand on se connecte la première fois le téléphone n'est pas vide alors on n'a pas besoin de faire un patch
              return null;
            }
            else {
              return true; //si cellphoneStr (cellphone quand on se connecte) est vide ou undefined alors $scope.$parent.$root.user.privateInfo.cellphone 
              //qui correspond à la modif du cellphone par le user doit être patché
            }
          }
          else {
            return false;
          }
        }
        else {
          return false;
        }
      }
      else {
        return false;
      }
    }
    else {
      return false;
    }
  }

  $scope.cellphoneValidation = needToUpdateCellphone();

  function checkAvailablePlaces() {
    /*to check wether there is available space for each rôle*/
    if (!$scope.meal.detailedInfo.requiredGuests.cooks || $scope.meal.detailedInfo.requiredGuests.cooks.nbRemainingPlaces <= 0) {
      $scope.requiredGuests.availablePlaces['cooks'] = false;
    }
    else {
      $scope.requiredGuests.availablePlaces['cooks'] = true;
    }
    if (!$scope.meal.detailedInfo.requiredGuests.cleaners || $scope.meal.detailedInfo.requiredGuests.cleaners.nbRemainingPlaces <= 0) {
      $scope.requiredGuests.availablePlaces['cleaners'] = false;
    }
    else {
      $scope.requiredGuests.availablePlaces['cleaners'] = true;
    }
    if (!$scope.meal.detailedInfo.requiredGuests.simpleGuests || $scope.meal.detailedInfo.requiredGuests.simpleGuests.nbRemainingPlaces <= 0) {
      $scope.requiredGuests.availablePlaces['simpleGuests'] = false;
    }
    else {
      $scope.requiredGuests.availablePlaces['simpleGuests'] = true;
    }
    if(checkStatusAccepted()){
      $scope.goToMeal = true;
    }
    else{
      $scope.goToMeal = false;
    }
  }
  
  
  function checkStatusAccepted() {
    if ($scope.datasUserForEachMeal($scope.meal)) {
      if ($scope.datasUserForEachMeal($scope.meal).status == "accepted") {
        return true;
      }
      else {
        return false;
      }
    }
    else {
      return false;
    }
  }

  function check(value) {
    if (value != undefined) {
      return true;
    }
    else {
      return false;
    }
  }

  function subscribeMeal(meal_id, role) {
    $http.post('/api/meals/' + meal_id + '/subscription', {
      "requestRole": role
    }).then(function(response) {
      confirmOptIn();
      $scope.meal.nbRemainingPlaces -= 1;
      $scope.meal.detailedInfo.requiredGuests[$scope.requestRole.name + "s"].nbRemainingPlaces -= 1;
      if ($scope.meal.automaticSubscription == true) {
        $scope.goToMeal = true;
        $uibModalInstance.close({
          manualSubscriptionPending: false
        });
        $state.go("view_my_dtld_meals", {
          "myMealId": meal_id,
          "successSubscribedMessage": true
        });
      }
      else if ($scope.meal.automaticSubscription == false) {
        $scope.goToMeal = false;
        $uibModalInstance.close({
          manualSubscriptionPending: true
        });
        $state.reload();
      }
    }, function(response) {
      $scope.errorSubscribe.requestRole.status = true;
      if (RegExp(response.data = "requestRole")) {
        if (response.status == 400) {
          $scope.errorSubscribe.requestRole.message = response.data.message;
        }
        else {
          $scope.errorSubscribe.requestRole.message = "you have to select a role to participate";
        }
      }
      else {
        $scope.errorSubscribe.requestRole.message = response.data;
      }
    });
  }

  $scope.subscribeMealAuth = function(meal_id, role, provider) {
    if ($scope.checkMealDate() == true) {
      if (isAuthenticated) { // si l'user est authentifié
        if (check($scope.requestRole.name)) {
          if (needToUpdateCellphone() == true) {
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
              subscribeMeal(meal_id, role);
            });
          }
          else if (needToUpdateCellphone() == false) {
            $scope.errorSubscribe.cellphone.status = true;
            $scope.errorSubscribe.cellphone.message = "Please fill your cellphone number to participate.";
            console.log("please fill your number");
          }
          else {
            subscribeMeal(meal_id, role);
          }
        }
        else {
          if (!check($scope.$parent.$root.user.privateInfo.cellphone)) {
            $scope.errorSubscribe.cellphone.status = true;
            $scope.errorSubscribe.cellphone.message = "Please fill your cellphone number to participate.";
            console.log("please fill your number");
          }
          if (!check($scope.requestRole.name)) {
            $scope.errorSubscribe.requestRole.status = true;
            $scope.errorSubscribe.requestRole.message = "You have to select a role to participate";
            console.log("please choose a role");
          }
        }
      }
      else { // si l'user n'est pas authentifié
        if (check($scope.requestRole.name)) { // on vérifie qu'il a bien demandé un rôle
          $auth.authenticate(provider) // connection via facebook
            .then(function(response) {
              console.debug("success", response);
              if ($auth.isAuthenticated()) {
                userServicesFactory().then(function(data) {
                  $rootScope.user = data;
                  $scope.isAuthenticated = true;
                  isAuthenticated = true;
                  $http.get('/api/meals/' + meal_id).then(function successCallBack(responseUser) { // on récupère les infos pour savoir si l'user est inscrit au repas
                    if (data._id == $scope.meal.admin._id || $scope.datasUserForEachMeal($scope.meal).status == 'accepted') { // s'il est l'hôte ou s'il inscrit on go sur le repas
                      $scope.goToMeal = true;
                      $uibModalInstance.close({
                        manualSubscriptionPending: false,
                      });
                      $state.go("view_my_dtld_meals", {
                        "myMealId": meal_id,
                        "successSubscribedMessage": true
                      });
                    }
                    if ($scope.datasUserForEachMeal($scope.meal).status == 'pending') { //s'il est en attente sur le repas
                      $scope.goToMeal = false;
                      $uibModalInstance.close({
                        manualSubscriptionPending: true
                      });
                    }
                    else { // s'il n'est ni l'hôte ni inscrit au repas
                      if (check($scope.$parent.$root.user.privateInfo.cellphone) == true) { // on check si son cellphone est déjà rentré dans notre BDD
                        subscribeMeal(meal_id, role); // si son tel est dans notre BDD, on l'inscrit au repas
                      }
                      else { // si son tel n'est pas dans notre BDD on lui demande de le remplir
                        $scope.errorSubscribe.cellphone.status = true;
                        $scope.errorSubscribe.cellphone.message = "Please fill your cellphone number to participate.";
                        console.log("please fill your number");

                      }
                    }
                  });
                });
              }
            })
            .catch(function(response) {
              console.debug("catch", response);
            });
        }
        else {
          if (!check($scope.requestRole.name)) {
            $scope.errorSubscribe.requestRole.status = true;
            $scope.errorSubscribe.requestRole.message = "You have to select a role to participate";
            console.log("please choose a role");
          }
        }
      }
    }
  };

  function defineMealPriceSentence() {
    $scope.meal.priceSentence = "";
    if ("cooks" in $scope.meal.detailedInfo.requiredGuests) {
      $scope.meal.priceSentence = 'from ' + $scope.meal.currency_symbol + ' ' + $scope.meal.detailedInfo.requiredGuests.cooks.price + ' to ' + $scope.meal.currency_symbol + ' ' + $scope.meal.priceUnit;
    }
    if ("cleaners" in $scope.meal.detailedInfo.requiredGuests) {
      $scope.meal.priceSentence = 'from ' + $scope.meal.currency_symbol + ' ' + $scope.meal.detailedInfo.requiredGuests.cleaners.price + ' to ' + $scope.meal.currency_symbol + ' ' + $scope.meal.priceUnit;
    }
  }

  defineMealPriceSentence();

  //Initialize variable
  $scope.isAuthenticated = isAuthenticated;
  $scope.requestRole = {};
  $scope.requiredGuests = {
    availablePlaces: {}
  };
  $scope.errorSubscribe = {
    requestRole: {
      "status": false
    },
    cellphone: {
      "status": false
    }
  };
  $scope.goToMeal = false;

  checkAvailablePlaces();
  $scope.accordionOneAtATime = true;

  $scope.closeAlert = function() {
    $scope.errorSubscribe.requestRole.status = false;
    $scope.errorSubscribe.cellphone.status = false;
  };

  $scope.cancel = function() {
    $uibModalInstance.dismiss('cancel');
  }; //funcion to dismiss the modal

  var now = new Date();

  $scope.checkMealDate = function() {
    return (Date.parse($scope.meal.time) >= now.getTime());
  };

}]);