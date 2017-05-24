'use strict';

var app = angular.module('userServices', []);

app.factory('userServicesFactory', ['$http', function($http) {

    return function getUserInfo() {
        return $http.get('/api/users/private').then(function successCallback(result) {
            // this callback will be called asynchronously
            // when the response is available
            return result.data['_items'][0];
        }, function errorCallback(result) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            console.log("getUserInfo error", result);
        });
    };

}]);