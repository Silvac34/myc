'use strict';

export default angular.module('myApp.viewManageRequests', [])

.controller('ViewManageRequestsCtrl', ['$scope', '$http', 'getSpecificUserFactory', function($scope, $http, getSpecificUserFactory) {
    if ($scope.$parent.$root.user) {
        $scope.nbDifferentPendingRequest = 0;
        $http.get('api/meals?where={"$and": [{"admin": "' + $scope.$parent.$root.user._id + '"}, {"users.status": "pending"} ]}').then(function(res) { // on récupère les meals de l'utilisateur dont on consulte le profil
            $scope.meals = res.data._items;
            $scope.meals.forEach(function(meal) {
                meal.users.forEach(function(user) {
                    if (user.status == "pending") {
                        $scope.nbDifferentPendingRequest += 1;
                        getSpecificUserFactory(user._id).then(function successCallBack(userInfo) {
                            var listUserInfo = Object.keys(userInfo);
                            listUserInfo.forEach(function(key) {
                                user[key] = userInfo[key];
                            });
                        });
                    }
                });
            });
        });
    }

    $scope.validateSubscription = function() {
        var users = this.$parent.$parent.meal.users;
        var mealIndex = this.$parent.$parent.$index;
        $http.post('/api/meals/' + this.$parent.$parent.meal._id + '/subscription/validate/' + this.$parent.participant._id, {
            'validation_result': true
        }).then(function() {
            if ($scope.$parent.$root.user.nbDifferentPendingRequest) {
                $scope.$parent.$root.user.nbDifferentPendingRequest -= 1;
            }
            var nbPendingRequest = 0;
            users.forEach(function(user) {
                if (user.status == "pending") {
                    nbPendingRequest += 1;
                }
            });
            nbPendingRequest -= 1; //on retire la pending request de l'utilisateur qu'on supprime 
            if (nbPendingRequest == 0) {
                $scope.meals.splice(mealIndex, 1);
            }
        });
    };

    $scope.refuseSubscription = function() {
        var users = this.$parent.$parent.meal.users;
        var mealIndex = this.$parent.$parent.$index;
        var participantIndex = this.$parent.$index;
        $http.post('/api/meals/' + this.$parent.$parent.meal._id + '/subscription/validate/' + this.$parent.participant._id, {
            'validation_result': false
        }).then(function() {
            var nbPendingRequest = 0;
            users.forEach(function(user) {
                if (user.status == "pending") {
                    nbPendingRequest += 1;
                }
            });
            nbPendingRequest -= 1; //on retire la pending request de l'utilisateur qu'on supprime 
            if (nbPendingRequest == 0) {
                $scope.meals.splice(mealIndex, 1);
            }
            else {
                $scope.meals[mealIndex].users.splice(participantIndex, 1);
            }
        });
    };

}]);