'use strict';

angular.module('userServices', [])

.factory('userServices', ['$http', function($http) {

    var userServices = {};
    userServices.getUserInfo = function() {
        return $http.get('/api/users/private').then(function(result) {
            return result.data['_items'][0]
        })

        .catch(function(result) {
            console.log("getUserInfo error", result);
        })
    }
    return userServices
}]);