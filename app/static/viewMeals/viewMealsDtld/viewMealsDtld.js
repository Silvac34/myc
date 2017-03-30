'use strict';

var modMealsDetailed = angular.module('myApp.viewMealsDtld', ['angular-svg-round-progressbar', 'ui.bootstrap'])

.controller('ViewMealsDtldCtrl', ['$scope', '$http', 'meal_id', '$uibModalInstance', '$state', 'isAuthenticated', '$auth', 'userServicesFactory', '$rootScope', function($scope, $http, meal_id, $uibModalInstance, $state, isAuthenticated, $auth, userServicesFactory, $rootScope) {

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

  function loadMealInfo(meal_id) {
    $http.get('/api/meals/' + meal_id).then(function(response) {
      $scope.meal = response.data;

      /*to check wether there is available space for each rôle*/
      if (!$scope.meal.detailedInfo.requiredGuests.cooks || $scope.meal.detailedInfo.requiredGuests.cooks.nbRemainingPlaces <= 0) {
        $scope.requiredGuests.availablePlaces['cooks'] = false;
      }
      else {
        $scope.requiredGuests.availablePlaces['cooks'] = true;
        $scope.requestRole.name = "cook";
      }
      if (!$scope.meal.detailedInfo.requiredGuests.cleaners || $scope.meal.detailedInfo.requiredGuests.cleaners.nbRemainingPlaces <= 0) {
        $scope.requiredGuests.availablePlaces['cleaners'] = false;
      }
      else {
        $scope.requiredGuests.availablePlaces['cleaners'] = true;
        if (!$scope.requestRole) {
          $scope.requestRole.name = "cleaner";
        }
      }
      if (!$scope.meal.detailedInfo.requiredGuests.simpleGuests || $scope.meal.detailedInfo.requiredGuests.simpleGuests.nbRemainingPlaces <= 0) {
        $scope.requiredGuests.availablePlaces['simpleGuests'] = false;
      }
      else {
        $scope.requiredGuests.availablePlaces['simpleGuests'] = true;
        if (!$scope.requestRole) {
          $scope.requestRole.name = "simpleGuest";
        }
      }
      $scope.goToMeal = $scope.meal.detailedInfo.subscribed;
    });
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
      $scope.meal.nbRemainingPlaces -= 1;
      $scope.meal.detailedInfo.requiredGuests[$scope.requestRole.name + "s"].nbRemainingPlaces -= 1;
      $scope.goToMeal = true;
      $uibModalInstance.close();
      $state.go("view_my_dtld_meals", {
        "myMealId": meal_id
      });
    }, function(response) {
      loadMealInfo(meal_id);
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
                  $scope.meal.subscribed = responseUser.data.detailedInfo.subscribed;
                  if (data._id == $scope.meal.admin._id || $scope.meal.subscribed == true) { // s'il est l'hôte ou s'il inscrit on go sur le repas
                    $scope.goToMeal = true;
                    $uibModalInstance.close();
                    $state.go("view_my_dtld_meals", {
                      "myMealId": meal_id
                    });
                  }
                  else { // s'il n'est ni l'hôte ni inscrit au repas
                    /*if(document.getElementById("inputCellphone").value != ''){ 
                      $scope.$parent.$root.user.privateInfo.cellphone = document.getElementById("inputCellphone").value;
                    }*/
                    if (check($scope.$parent.$root.user.privateInfo.cellphone) == true) { // on check si son cellphone est déjà rentré dans notre BDD
                      subscribeMeal(meal_id, role); // si son tel est dans notre BDD, on l'inscrit au repas
                    }
                    /*if (needToUpdateCellphone() == true) { 
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
                    }*/
                    else { // si son tel n'est pas dans notre BDD on lui demande de le remplir
                      $scope.errorSubscribe.cellphone.status = true;
                      $scope.errorSubscribe.cellphone.message = "Please fill your cellphone number to participate.";
                      console.log("please fill your number");

                    }
                    /*else if (needToUpdateCellphone() == false) {
                      $scope.errorSubscribe.cellphone.status = true;
                      $scope.errorSubscribe.cellphone.message = "Please fill your cellphone number to participate.";
                      console.log("please fill your number");
                    }
                    else {
                      subscribeMeal(meal_id, role);
                    }*/
                  }
                  /*                    else {
                                        
                                        if (!check($scope.$parent.$root.user.privateInfo.cellphone))
                                          $scope.errorSubscribe.cellphone.status = true;
                                          $scope.errorSubscribe.cellphone.message += "Please fill your cellphone number to participate.";
                                        console.log("please fill your number");
                                      }*/
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
  };


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

  loadMealInfo(meal_id);
  $scope.accordionOneAtATime = true;

  $scope.closeAlert = function() {
    $scope.errorSubscribe.requestRole.status = false;
    $scope.errorSubscribe.cellphone.status = false;
  };

  $scope.cancel = function() {
    $uibModalInstance.dismiss('cancel');
  }; //funcion to dismiss the modal


}]);