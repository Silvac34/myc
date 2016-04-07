'use strict';

angular.module('userServices', [])

.factory('userServices', ['$http', function($http) {

    var userServices = {};
    userServices.getUserInfo = function() {
        return $http.get('/api/user').then(function(result) {
            return result.data
        })

        .catch(function(result) {
            console.log("getUserInfo error", result);
        })
    }
    return userServices
}]);