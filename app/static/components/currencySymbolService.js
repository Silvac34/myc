'use strict';

export default angular.module('currencySymbolService', [])

.factory('currencySymbolFactory', ['$http', '$q', function($http, $q) {
    return function getCurrencySymbol(country_code) {
        var myPromise = $q.defer();
        return $http.get("/static/sources/createMeal/currency.json").then(function(result_currency) {
            return $http.get("/static/sources/createMeal/currency_symbol.json").then(function(result_currency_symbol) {
                var currency = result_currency.data[country_code];
                myPromise.resolve(result_currency_symbol.data[currency].symbol_native);
                return myPromise.promise;
            });
        });
    };
}]);