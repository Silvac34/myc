'use strict';

angular.module('myApp.viewLeaveReviews', [])

.controller('ViewLeaveReviewsCtrl', ['$scope', '$http', function($scope, $http) {
    if ($scope.$parent.$root.user) {
        var uniqueList = [];
        var uniqueListForRequest = [];
        var now = new Date;
        $http.get('api/meals?where={"$and": [{"users._id": "' + $scope.$parent.$root.user._id + '"}, {"users": {"$not": {"$size": 1}}}]}').then(function(res) { // on récupère les meals de l'utilisateur dont on consulte le profile où il n'y a pas que lui d'inscrit
            res.data._items.forEach(function(element) {
                var mealDate = new Date(element.time);
                if (mealDate < now) {
                    element.users.forEach(function(user) {
                        var unique = user._id + $scope.$parent.$root.user._id + element._id;
                        var role = user.role[0];
                        uniqueList.push({
                            "unique": unique,
                            "role": role,
                            "mealTitle": element.menu.title
                        });
                        uniqueListForRequest.push('"' + (user._id + $scope.$parent.$root.user._id + element._id).toString() + '"');
                    });
                }
            });
            $http.get('api/reviews?where={"unique": {"$in":[' + uniqueListForRequest + ']}}').then(function successCallBack(response) {
                response.data._items.forEach(function(reviewsResponse) {
                    var index = uniqueList.map(function(o) {
                        return o.unique;
                    }).indexOf(reviewsResponse.unique);
                    if (index != -1) {
                        uniqueList = uniqueList.splice(index);
                    }
                });
                initializeReviews(uniqueList);
                console.log($scope.dataForReview);
            });
        });
    }

    function initializeReviews(uniqueList) {
        $scope.dataForReview = [];
        uniqueList.forEach(function(element) {
            var review = {
                "forUser": {
                    "_id": element.unique.substring(0, 24),
                    "role": element.role
                },
                "fromUser": {
                    "_id": element.unique.substring(25, 48),
                    "role": "admin"
                },
                "unique": element.unique,
                "mealAssociated": element.unique.substring(49, 72),
                "mealTitle" : element.mealTitle
            };
            $scope.dataForReview.push(review);
        });
    }
}]);