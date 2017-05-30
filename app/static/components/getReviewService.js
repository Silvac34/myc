'use strict';

var app = angular.module('getReviewService', []);

app.factory('getMealReviewServiceFactory', ['$http', function($http) {

    return function getReviews(mealId, userId) { //récupère les commentaires propres à un repas fait par un user specific
        return $http.get('/api/reviews?where={"mealAssociated": "' + mealId + '", "fromUser._id": "' + userId + '"}').then(function successCallback(result) {
            // this callback will be called asynchronously
            // when the response is available
            return result.data['_items'];
        }, function errorCallback(result) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            console.log("getUserInfo error", result);
        });
    };

}]);

app.factory('getUserReviewServiceFactory', ['$http', function($http) {

    return function getReviews(participantId) { //récupère les commentaires fait à un utiisateur en particulier
        return $http.get('/api/reviews?where={"forUser._id": "' + participantId + '"}').then(function successCallback(result) {
            // this callback will be called asynchronously
            // when the response is available
            console.log(result.data['_items']);
            return result.data['_items'];
        }, function errorCallback(result) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            console.log("getUserInfo error", result);
        });
    };

}]);