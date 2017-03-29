'use strict';

var modMealsDetailed = angular.module('myApp.viewMealsDtld', ['angular-svg-round-progressbar', 'ui.bootstrap'])

.controller('ViewMealsDtldCtrl', ['$scope', '$http', 'meal_id', '$uibModalInstance', '$state', 'isAuthenticated', '$auth', 'userServicesFactory', '$rootScope', function($scope, $http, meal_id, $uibModalInstance, $state, isAuthenticated, $auth, userServicesFactory, $rootScope) {

  function needToUpdateCellphone() {
    if (check($scope.$parent.$root.user)) {
      if (check($scope.$parent.$root.user.privateInfo)) {
        if (check($scope.$parent.$root.user.privateInfo.cellphone)) {
          if ($scope.$parent.$root.user.privateInfo.cellphone != '') {
            return false;
          }
          else {
            return true;
          }
        }
        else {
          return true;
        }
      }
      else {
        return true;
      }
    }
    else {
      return true;
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
      $scope.errorSubscribe.status = true;
      if (RegExp(response.data = "requestRole")) {
        $scope.errorSubscribe.message = "you have to select a role to participate";
      }
      else {
        $scope.errorSubscribe.message = response.data;
      }
    });
  }

  $scope.subscribeMealAuth = function(meal_id, role, provider) {
    if (isAuthenticated) {
      if (check($scope.requestRole.name)) {
        if (needToUpdateCellphone()) {
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
          });
        }
        subscribeMeal(meal_id, role);
      }
      else {
        $scope.errorSubscribe.status = true;
        $scope.errorSubscribe.message = "";
        if (!check($scope.$parent.$root.user.privateInfo.cellphone)) {
          $scope.errorSubscribe.message += "Please fill your cellphone number to participate (to get in touch with the host).";
          console.log("please fill your number");
        }
        if (!check($scope.requestRole.name)) {
          $scope.errorSubscribe.message += "You have to select a role to participate";
          console.log("please choose a role");
        }
      }
    }
    else {
      if (check($scope.requestRole.name)) {
        $auth.authenticate(provider)
          .then(function(response) {
            console.debug("success", response);
            if ($auth.isAuthenticated()) {
              userServicesFactory().then(function(data) {
                $rootScope.user = data;
                $scope.isAuthenticated = true;
                isAuthenticated = true;
                $http.get('/api/meals/' + meal_id).then(function successCallBack(responseUser) {
                  $scope.meal.subscribed = responseUser.data.detailedInfo.subscribed;
                  if (data._id == $scope.meal.admin._id || $scope.meal.subscribed == true) {
                    $scope.goToMeal = true;
                    $uibModalInstance.close();
                    $state.go("view_my_dtld_meals", {
                      "myMealId": meal_id
                    });
                  }
                  else {
                    if (check($scope.$parent.$root.user.privateInfo.cellphone) == true) {
                      if (needToUpdateCellphone()) {
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
                        });
                      }
                      subscribeMeal(meal_id, role);
                    }
                    else {
                      $scope.errorSubscribe.status = true;
                      $scope.errorSubscribe.message = "";
                      if (!check($scope.$parent.$root.user.privateInfo.cellphone))
                        $scope.errorSubscribe.message += "Please fill your cellphone number to participate (to get in touch with the host).";
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
          $scope.errorSubscribe.status = true;
          $scope.errorSubscribe.message = "You have to select a role to participate";
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
    "status": false
  };
  $scope.goToMeal = false;

  loadMealInfo(meal_id);
  $scope.accordionOneAtATime = true;

  $scope.closeAlert = function() {
    $scope.errorSubscribe.status = false;
  };

  $scope.cancel = function() {
    $uibModalInstance.dismiss('cancel');
  }; //funcion to dismiss the modal


}]);