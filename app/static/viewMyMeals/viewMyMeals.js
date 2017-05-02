'use strict';

angular.module('myApp.viewMyMeals', ['ui.router', 'angular-svg-round-progressbar', 'ui.bootstrap', 'myApp.viewMyMealsDtld'])

.controller('ViewMyMealsCtrl', ['$scope', 'response', '$uibModal', '$http', function($scope, response, $uibModal, $http) {

  $scope.meals = response.data['_items'];
  var userId = $scope.user._id;

  $http.get("/static/sources/profile/countries.json").then(function(res) {
    $http.get("/static/sources/createMeal/currency.json").then(function(result_currency) {
      $http.get("/static/sources/createMeal/currency_symbol.json").then(function(result_currency_symbol) {
        for (var j = 0; j < $scope.meals.length; j++) {
          for (var i = 0; i < $scope.meals[j].privateInfo.users.length; i++) {
            var currency = result_currency.data[$scope.meals[j].address.country_code];
            var currency_symbol = result_currency_symbol.data[currency].symbol_native;
            if ($scope.meals[j].privateInfo.users[i]._id == userId) {
              var userRole = $scope.meals[j].privateInfo.users[i].role[0];
              if (userRole == "simpleGuest") {
                $scope.meals[j].priceUser = currency_symbol + " " + $scope.meals[j].detailedInfo.requiredGuests.simpleGuests.price;
              }
              if (userRole == "admin") {
                $scope.meals[j].priceUser = currency_symbol + " " + $scope.meals[j].detailedInfo.requiredGuests.hosts.price;
              }
              if (userRole == "cook") {
                $scope.meals[j].priceUser = currency_symbol + " " + $scope.meals[j].detailedInfo.requiredGuests.cooks.price;
              }
              if (userRole == "cleaner") {
                $scope.meals[j].priceUser = currency_symbol + " " + $scope.meals[j].detailedInfo.requiredGuests.cleaners.price;
              }
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

  var now = new Date();

  $scope.futurMealsFilter = function(meal) {
    return (Date.parse(meal.time) >= now.getTime());
  };

  $scope.pastMealsFilter = function(meal) {
    return (Date.parse(meal.time) < now.getTime());
  };

}]);