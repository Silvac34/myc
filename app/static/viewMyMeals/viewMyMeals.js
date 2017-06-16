'use strict';

angular.module('myApp.viewMyMeals', ['ui.router', 'angular-svg-round-progressbar', 'ui.bootstrap', 'myApp.viewMyMealsDtld', 'ngSanitize'])

.controller('ViewMyMealsCtrl', ['$scope', 'response', '$uibModal', '$http', function($scope, response, $uibModal, $http) {

  $scope.meals = response.data['_items'];
  var userId = $scope.user._id;

  $http.get("/static/sources/profile/countries.json").then(function(res) {
    $http.get("/static/sources/createMeal/currency.json").then(function(result_currency) {
      $http.get("/static/sources/createMeal/currency_symbol.json").then(function(result_currency_symbol) {
        for (var j = 0; j < $scope.meals.length; j++) {
          for (var i = 0; i < $scope.meals[j].users.length; i++) {
            if ($scope.meals[j].users[i]._id == userId) {
              var userRole = $scope.meals[j].users[i].role[0];
              if (userRole == "simpleGuest") {
                $scope.meals[j].mealPrice = $scope.meals[j].detailedInfo.requiredGuests.simpleGuests.price; //enfin, s'il n'y a pas d'aide, c'est le prix invité
              }
              if (userRole == "cook") {
                $scope.meals[j].mealPrice = $scope.meals[j].detailedInfo.requiredGuests.cooks.price; //sinon c'est soit le prix d'aide cuisine
              }
              if (userRole == "cleaner") {
                $scope.meals[j].mealPrice = $scope.meals[j].detailedInfo.requiredGuests.cleaners.price; //ou le prix aide vaisselle
              }
              if (userRole == "admin") {
                $scope.meals[j].mealPrice = $scope.meals[j].detailedInfo.requiredGuests.hosts.price; //ou le prix hôte
              }
              var currency = result_currency.data[$scope.meals[j].address.country_code];
              $scope.meals[j].currency_symbol = result_currency_symbol.data[currency].symbol_native; ////récupère correctement la monnaie où s'effectue le repas
            }
          }
          $scope.meals[j].address.country = getCountry($scope.meals[j].address.country_code, res.data); //récupère correctement le pays
        }
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

  var hoursToAdd = 7;
  var now = new Date();
  now.setHours(now.getHours() - hoursToAdd); // on rajoute 7h pour que les meals passe de incoming a previous

  $scope.futurMealsFilter = function(meal) {
    return (Date.parse(meal.time) >= now.getTime());
  };

  $scope.pastMealsFilter = function(meal) {
    return (Date.parse(meal.time) < now.getTime());
  };

  $scope.countPendingRequestsPerMeal = function(mealId) {
    var numberOfPendingRequests = 0;
    $scope.meals.forEach(function(meal) {
      if (meal._id == mealId) {
        meal.users.forEach(function(user) {
          if (user.status == "pending") {
            numberOfPendingRequests += 1;
          }
        });
      }
    });
    return numberOfPendingRequests;
  };

  $scope.countMealWithPendingRequest = function() {
    var numberOfMealWithPendingRequest = 0;
    var now = new Date;
    $scope.meals.forEach(function(meal) {
      var mealTime = new Date(meal.time);
      if (meal.admin._id == $scope.$parent.$root.user._id && now < mealTime) { //il faut que l'utilisateur soit bien l'admin du repas
        meal.users.forEach(function(user) {
          if (user.status == "pending") {
            numberOfMealWithPendingRequest += 1;
          }
        });
      }
    });
    return numberOfMealWithPendingRequest;
  };

  $scope.datasUserForEachMeal = function(meal) {
    if ($scope.$parent.$root.user) {
      for (var i = 0; i < meal.users.length; i++) {
        if (meal.users[i]._id == $scope.$parent.$root.user._id) {
          break;
        }
      }
      return meal.users[i];
    }
  };

}]);