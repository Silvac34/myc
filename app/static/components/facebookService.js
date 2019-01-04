'use strict';

export default angular.module('facebookService', [])

.factory('getEventFacebook', ['$q', function($q) {
    return {
        getEvent: function(user_id) {
            var deferred = $q.defer();
            FB.api('/' + user_id + '/events', {
                fields: 'data'
            }, function(response) {
                if (!response || response.error) {
                    deferred.reject('Error occured');
                }
                else {
                    deferred.resolve(response);
                }
            });
            return deferred.promise;
        }
    };
}]);