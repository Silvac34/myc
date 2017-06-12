'use strict';

angular.module('myApp.viewLeaveReviews', [])

.controller('ViewLeaveReviewsCtrl', ['$scope', '$http', 'getSpecificUserFactory', function($scope, $http, getSpecificUserFactory) {

    if ($scope.$parent.$root.user) {
        var uniqueList = [];
        var uniqueListForRequest = [];
        var now = new Date;
        $http.get('api/meals?where={"$and": [{"users._id": "' + $scope.$parent.$root.user._id + '"}, {"users": {"$not": {"$size": 1}}}]}').then(function(res) { // on récupère les meals de l'utilisateur dont on consulte le profile où il n'y a pas que lui d'inscrit
            res.data._items.forEach(function(element) {
                var mealDate = new Date(element.time);
                if (mealDate < now) { // on ne peut laisser une review qu'à un meal qui s'est passé
                    element.users.forEach(function(user) {
                        if (user._id != $scope.$parent.$root.user._id) { //on enlève les reviews pour moi même
                            var unique = user._id + $scope.$parent.$root.user._id + element._id;
                            var role = user.role[0];
                            uniqueList.push({
                                "unique": unique,
                                "role": role,
                                "mealTitle": element.menu.title
                            });
                            uniqueListForRequest.push('"' + (user._id + $scope.$parent.$root.user._id + element._id).toString() + '"');
                        }
                    });
                }
            });
            $http.get('api/reviews?where={"unique": {"$in":[' + uniqueListForRequest + ']}}').then(function successCallBack(response) {
                response.data._items.forEach(function(reviewsResponse) { // on effectue la soustraction de toutes les reviews que j'aurais pu laisser - celles que j'ai laissé
                    var index = uniqueList.map(function(o) {
                        return o.unique;
                    }).indexOf(reviewsResponse.unique);
                    if (index != -1) {
                        uniqueList.splice(index, 1);
                    }
                });
                initializeReviews(uniqueList);
            });
        });

        $scope.checkAlreadyReviewed = function(unique) {
            var index = checkIndexDataForReview(unique);
            if ($scope.dataForReview.length > 0) {
                if ($scope.dataForReview[index] != undefined) {
                    if ($scope.dataForReview[index].sent == true) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                else {
                    return false;
                }
            }
            else {
                return false;
            }
        };

        $scope.getDataForReview = function(unique, type) {
            var index = checkIndexDataForReview(unique);
            if ($scope.dataForReview.length > 0) {
                if ($scope.dataForReview[index] != undefined) {
                    if (type == "rating") {
                        if ($scope.dataForReview[index].forUser.rating != undefined) {
                            return $scope.dataForReview[index].forUser.rating;
                        }
                        else {
                            return null;
                        }
                    }
                    if (type == "comment") {
                        if ($scope.dataForReview[index].forUser.comment != undefined) {
                            return $scope.dataForReview[index].forUser.comment;
                        }
                        else {
                            return null;
                        }
                    }
                }
                else {
                    return null;
                }
            }
            else {
                return null;
            }
        };

        $scope.sendReview = function(unique, role, type, value) {
            var index = checkIndexDataForReview(unique);
            $scope.dataForReview[index].forUser[type] = value;
            if (type == "comment") {
                if ($scope.dataForReview[index].forUser.rating == undefined) {
                    console.log("you need to grade " + $scope.dataForReview[index].forUser.datas.first_name);
                }
                else {
                    delete $scope.dataForReview[index].sent;
                    delete $scope.dataForReview[index].mealTitle;
                    delete $scope.dataForReview[index].forUser.datas;
                    $http.post('/api/reviews', $scope.dataForReview[index]).then(function successCallBack(response) {
                        $scope.dataForReview[index]['sent'] = true; //on ajoute cet attribut pour modifier la vue HTML des références
                        console.log($scope.dataForReview[index]);
                    }, function errorCallback(response) {
                        $scope.dataForReview[index]['sent'] = false; //s'il y a une erreur dans le process alors les données ne se sont pas envoyées
                    });
                }
            }
        };
    }

    function initializeReviews(uniqueList) {
        $scope.dataForReview = [];
        var listUser = [];
        uniqueList.forEach(function(element) {
            listUser.push('"' + element.unique.substring(0, 24) + '"');
        });
        $http.get('/api/users?where={"_id": {"$in": [' + listUser + ']}}').then(function successCallback(result) {
            var users = result.data['_items'];
            uniqueList.forEach(function(element) {
                var index = users.map(function(o) {
                    return o._id;
                }).indexOf(element.unique.substring(0, 24));
                var review = {
                    "forUser": {
                        "_id": element.unique.substring(0, 24),
                        "role": element.role,
                        "datas": users[index]
                    },
                    "fromUser": {
                        "_id": element.unique.substring(24, 48),
                        "role": "admin"
                    },
                    "unique": element.unique,
                    "mealAssociated": element.unique.substring(48, 72),
                    "mealTitle": element.mealTitle,
                    "sent": false
                };
                $scope.dataForReview.push(review);
            });
        });
    }

    function checkIndexDataForReview(unique) { //retourne l'index où on doit faire les modifications dans dataForReview
        var i = 0;
        if ($scope.dataForReview.length > 0) {
            for (i; i < $scope.dataForReview.length; i++) {
                if ($scope.dataForReview[i].unique == unique) {
                    break;
                }
            }
        }
        return i;
    }

}]);