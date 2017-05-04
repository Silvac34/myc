'use strict';

angular.module('myApp.viewMyMeals', ['ui.router', 'angular-svg-round-progressbar', 'ui.bootstrap', 'myApp.viewMyMealsDtld', 'ngSanitize'])

.controller('ViewMyMealsCtrl', ['$scope', 'response', '$uibModal', '$http', function($scope, response, $uibModal, $http) {

  $scope.meals = response.data['_items'];
  var userId = $scope.user._id;

  $http.get("/static/sources/profile/countries.json").then(function(res) {
    $http.get("/static/sources/createMeal/currency.json").then(function(result_currency) {
      $http.get("/static/sources/createMeal/currency_symbol.json").then(function(result_currency_symbol) {
        for (var j = 0; j < $scope.meals.length; j++) {
          for (var i = 0; i < $scope.meals[j].privateInfo.users.length; i++) {
            var mealPrice = $scope.meals[j].price / $scope.meals[j].nbGuests; // de base c'est le nombre de participant diviser par le prix des courses (en dernier recours)
            var priceUnit = Math.ceil($scope.meals[j].price / $scope.meals[j].nbGuests);
            if ($scope.meals[j].privateInfo.users[i]._id == userId) {
              var userRole = $scope.meals[j].privateInfo.users[i].role[0];
              if (userRole == "simpleGuests") {
                mealPrice = $scope.meals[j].detailedInfo.requiredGuests.simpleGuests.price; //enfin, s'il n'y a pas d'aide, c'est le prix invité
              }
              else {
                if (userRole == "cooks") {
                  mealPrice = $scope.meals[j].detailedInfo.requiredGuests.cooks.price; //sinon c'est soit le prix d'aide cuisine
                }
                else if (userRole == "cleaners") {
                  mealPrice = $scope.meals[j].detailedInfo.requiredGuests.cleaners.price; //ou le prix aide vaisselle
                }
                else if (userRole == "admin") {
                  mealPrice = $scope.meals[j].detailedInfo.requiredGuests.hosts.price; //ou le prix hôte
                }
              }
              var currency = result_currency.data[$scope.meals[j].address.country_code];
              var currency_symbol = result_currency_symbol.data[currency].symbol_native;
              var mealPriceWithSymbol = currency_symbol + " " + mealPrice;
              var priceUnitWithSymbol = currency_symbol + " " + priceUnit;
              if (mealPrice < priceUnit) {
                $scope.meals[j].priceSentence = '<span class="small color-text-priceSentence hidden-xs">From</span> ' + mealPriceWithSymbol + '<span class="small color-text-priceSentence"> to</span> ' + priceUnitWithSymbol;
              }
              else if (mealPrice > priceUnit) {
                $scope.meals[j].priceSentence = '<span class="small color-text-priceSentence hidden-xs">From</span> ' + priceUnitWithSymbol + '<span class="small color-text-priceSentence"> to</span> ' + mealPriceWithSymbol;
              }
              else if (mealPrice == priceUnit) {
                $scope.meals[j].priceSentence = '<span class="small color-text-priceSentence">From</span> ' + priceUnitWithSymbol;
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