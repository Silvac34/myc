'use strict';

var modMyMealsDetailed = angular.module('myApp.viewMyMealsDtld', ['ui.router', 'angular-svg-round-progressbar', 'ui.bootstrap', 'ngAnimate', 'ngMap', 'getReviewService']);

modMyMealsDetailed.controller('ViewMyMealsDtldCtrl', ['$scope', '$http', '$stateParams', '$uibModal', 'ENV', '$timeout', 'meal', 'NgMap', 'getMealReviewServiceFactory', function($scope, $http, $stateParams, $uibModal, ENV, $timeout, meal, NgMap, getMealReviewServiceFactory) {

    $scope.meal = meal.data;

    function check_loading() {
        $scope.pendingRequest = false;
        if ("privateInfo" in $scope.meal) {
            if ("users" in $scope.meal.privateInfo) {
                for (var i = 0; i < $scope.meal.privateInfo.users.length; i++) {
                    if ($scope.meal.privateInfo.users[i]._id == $scope.user._id) {
                        $scope.userRole = $scope.meal.privateInfo.users[i].role[0];
                    }
                    if ($scope.meal.privateInfo.users[i].status == "pending") { //fait apparaître l'encadré de validation lorsqu'un utilisateur est en attente de confirmation pour participer à un repas
                        $scope.pendingRequest = true;
                    }
                }
            }
        }
    }
    check_loading();

    $scope.data_href_comment = ENV.fbRedirectURI + "#/my_meals/" + $scope.meal._id;
    $scope.data_href_publishOnFacebook = ENV.fbRedirectURI + "#/view_meals";

    //modalDelete to delete a meal
    $scope.openModalDelete = function() {

        $uibModal.open({
            animation: true,
            templateUrl: '/static/viewMyMeals/viewMyMealsDtld/modalviewMyMealsDtld/modalDeleteMyMealDtld.html',
            controller: 'modalDeleteInstanceCtrl',
            size: "sm",
            resolve: {
                _etag: function() {
                    return $scope.meal._etag;
                }, //resolve - {Object.<string, Function>=} - An optional map of dependencies which should be injected into the controller. If any of these dependencies are promises, the router will wait for them all to be resolved or one to be rejected before the controller is instantiated
                meal: function() {
                    return $scope.meal;
                }
            }
        });
    };


    //modalEdit to delete a meal
    /*$scope.openModalEdit = function() {

      $uibModal.open({
        animation: true,
        templateUrl: '/static/viewMyMeals/viewMyMealsDtld/modalviewMyMealsDtld/modalEditMyMealDtld.html',
        controller: 'modalEditInstanceCtrl',
        size: "lg",
        resolve: {
          meal: function() {
              return $scope.meal;
            } //resolve - {Object.<string, Function>=} - An optional map of dependencies which should be injected into the controller. If any of these dependencies are promises, the router will wait for them all to be resolved or one to be rejected before the controller is instantiated
        }
      });
    };*/

    //modalUnsubscribe to unsubscribe to a meal
    $scope.openModalUnsubscribe = function() {

        $uibModal.open({
            animation: true,
            templateUrl: '/static/viewMyMeals/viewMyMealsDtld/modalviewMyMealsDtld/modalUnsubscribeMyMealDtld.html',
            controller: 'modalUnsubscribeInstanceCtrl',
            size: "sm"
        });
    };

    //function pour faire apparaître un well de validation lorsqu'un utilisateur vient de s'inscrire
    function successfullySubscribed(variable) {
        $scope.successSubscribedMessage = variable || false;
        if ($scope.successSubscribedMessage == true) {
            $timeout(function() {
                $scope.successSubscribedMessage = false;
            }, 3000);
        }
    }
    successfullySubscribed($stateParams.successSubscribedMessage);

    $scope.validateSubscription = function(participant_id) {
        $http.post('/api/meals/' + $scope.meal._id + '/subscription/validate/' + participant_id, {
            'validation_result': true
        }).then(function() {
            $scope.pendingRequest = false;
            for (var i = 0; i < $scope.meal.privateInfo.users.length; i++) {
                if ($scope.meal.privateInfo.users[i]._id == participant_id) {
                    $scope.meal.privateInfo.users[i].status = "accepted";
                }
            }
        });
    };

    $scope.refuseSubscription = function(participant_id) {
        $http.post('/api/meals/' + $scope.meal._id + '/subscription/validate/' + participant_id, {
            'validation_result': false
        }).then(function() {
            $scope.pendingRequest = false;
            for (var i = 0; i < $scope.meal.privateInfo.users.length; i++) {
                if ($scope.meal.privateInfo.users[i]._id == participant_id) {
                    delete $scope.meal.privateInfo.users[i];
                }
            }
        });
    };

    $http.get("/static/sources/profile/countries.json").then(function(res) {
        $http.get("/static/sources/createMeal/currency.json").then(function(result_currency) {
            $http.get("/static/sources/createMeal/currency_symbol.json").then(function(result_currency_symbol) {
                $http.get("/api/meals/" + $scope.meal._id + "/calculateMealPrice").then(function(responsePrice) {
                    $scope.meal.address.country = getCountry($scope.meal.address.country_code, res.data);
                    $scope.meal.pricePaybackIfFull = $scope.meal.price - $scope.meal.detailedInfo.requiredGuests.hosts.price;
                    $scope.meal.price = getCurrencySymbol($scope.meal.price, $scope.meal.address.country_code, result_currency, result_currency_symbol);
                    $scope.meal.detailedInfo.requiredGuests.hosts.price = getCurrencySymbol(responsePrice.data.hostPrice, $scope.meal.address.country_code, result_currency, result_currency_symbol);
                    $scope.meal.currentPricePayback = 0;
                    if ("cooks" in $scope.meal.detailedInfo.requiredGuests) {
                        if (responsePrice.data.cookPrice == "") {
                            $scope.meal.detailedInfo.requiredGuests.cooks.price = undefined;
                        }
                        else {
                            $scope.meal.detailedInfo.requiredGuests.cooks.price = getCurrencySymbol(responsePrice.data.cookPrice, $scope.meal.address.country_code, result_currency, result_currency_symbol);
                            $scope.meal.currentPricePayback += responsePrice.data.cookPrice * ($scope.meal.detailedInfo.requiredGuests.cooks.nbRquCooks - $scope.meal.detailedInfo.requiredGuests.cooks.nbRemainingPlaces);
                        }
                    }
                    if ("cleaners" in $scope.meal.detailedInfo.requiredGuests) {
                        if (responsePrice.data.cleanerPrice == "") {
                            $scope.meal.detailedInfo.requiredGuests.cleaners.price = undefined;
                        }
                        else {
                            $scope.meal.detailedInfo.requiredGuests.cleaners.price = getCurrencySymbol(responsePrice.data.cleanerPrice, $scope.meal.address.country_code, result_currency, result_currency_symbol);
                            $scope.meal.currentPricePayback += responsePrice.data.cleanerPrice * ($scope.meal.detailedInfo.requiredGuests.cleaners.nbRquCleaners - $scope.meal.detailedInfo.requiredGuests.cleaners.nbRemainingPlaces);
                        }
                    }
                    if ("simpleGuests" in $scope.meal.detailedInfo.requiredGuests) {
                        if (responsePrice.data.simpleGuestPrice == "") {
                            $scope.meal.detailedInfo.requiredGuests.simpleGuests.price = undefined;
                        }
                        else {
                            $scope.meal.detailedInfo.requiredGuests.simpleGuests.price = getCurrencySymbol(responsePrice.data.simpleGuestPrice, $scope.meal.address.country_code, result_currency, result_currency_symbol);
                            $scope.meal.currentPricePayback += responsePrice.data.simpleGuestPrice * ($scope.meal.detailedInfo.requiredGuests.simpleGuests.nbRquSimpleGuests - $scope.meal.detailedInfo.requiredGuests.simpleGuests.nbRemainingPlaces);
                        }
                    }
                    $scope.meal.currentPricePayback = getCurrencySymbol($scope.meal.currentPricePayback, $scope.meal.address.country_code, result_currency, result_currency_symbol);
                    $scope.meal.pricePaybackIfFull = getCurrencySymbol($scope.meal.pricePaybackIfFull, $scope.meal.address.country_code, result_currency, result_currency_symbol);

                });
            });
        });
    });

    function getCurrencySymbol(price, country_code, jsonDataCurrency, jsonDataCurrencySymbol) {
        var currency = jsonDataCurrency.data[country_code];
        var currency_symbol = jsonDataCurrencySymbol.data[currency].symbol_native;
        return currency_symbol + " " + price;
    }

    function getCountry(country_code, jsonData) {
        for (var i = 0; i < jsonData.length; i++) {
            if (jsonData[i].code == country_code) {
                return jsonData[i].name;
            }
        }
    }
    var vm = this;
    NgMap.getMap("map").then(function(map) {
        vm.map = map;
    });

    $scope.isOldMeal = function() {
        var now = new Date;
        var mealTime = new Date($scope.meal.time);
        return now >= mealTime;
    };
    
    function initializeDataForReview(){
        $scope.dataForReview = [];
        getMealReviewServiceFactory($scope.meal._id, $scope.user._id).then(function successCallBack(response){
            if(response.length > 0){
                $scope.dataForReview = response;//mettre correctement en place l'initialisation de dataForReview
                console.log($scope.dataForReview);
            }
        });
    }
    
    initializeDataForReview();
    
    function checkIndexDataForReview(participantId) { //retourne l'index où on doit faire les modifications dans dataForReview
        var i = 0;
        if ($scope.dataForReview.length > 0) {
            for (i; i < $scope.dataForReview.length; i++) {
                if ($scope.dataForReview[i].forUser._id == participantId) {
                    break;
                }
            }
        }
        return i;
    }

    $scope.checkAlreadyReviewed = function(participantId) {
        var index = checkIndexDataForReview(participantId);
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

    $scope.checkRating = function(participantId) {
        var index = checkIndexDataForReview(participantId);
        if ($scope.dataForReview.length > 0) {
            if ($scope.dataForReview[index] != undefined) {
                if ($scope.dataForReview[index].forUser.rating != undefined) {
                    return $scope.dataForReview[index].forUser.rating;
                }
                else {
                    return null;
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

    $scope.sendReview = function(participantId, role, type, value) {
        var index = checkIndexDataForReview(participantId);
        if (index == $scope.dataForReview.length) {
            $scope.dataForReview.push({
                "forUser": {
                    "_id": participantId,
                    "role": role[0]
                },
                "mealAssociated": $scope.meal._id,
                "fromUser": {
                    "_id": $scope.user._id,
                    "role": $scope.userRole
                },
                "sent": false
            });
        }
        $scope.dataForReview[index].forUser[type] = value;
        if (type == "comment") {
            if ($scope.dataForReview[index].forUser.rating == undefined) {
                for (var i = 0; i < $scope.meal.privateInfo.users.length; i++) {
                    if ($scope.meal.privateInfo.users[i]._id == participantId) {
                        console.log("you need to grade " + $scope.meal.privateInfo.users[i].first_name);
                    }
                }
            }
            else {
                delete $scope.dataForReview[index].sent;
                $http.post('/api/reviews', $scope.dataForReview[index]).then(function successCallBack(response) {
                    $scope.dataForReview[index]['sent'] = true; //on ajoute cet attribut pour modifier la vue HTML des références
                    console.log($scope.dataForReview[index]);
                }, function errorCallback(response) {
                    $scope.dataForReview[index]['sent'] = false; //s'il y a une erreur dans le process alors les données ne se sont pas envoyées
                });
            }
        }
    };
    
    

}]);

modMyMealsDetailed.controller('modalDeleteInstanceCtrl', function($scope, $http, $uibModalInstance, $state, _etag, meal) {

    $scope.deleteMyMeal = function(meal_id, _etag) {

        $http.delete('/api/meals/private/' + meal_id, {
            headers: {
                "If-Match": _etag
            }
        }).then(function(response) {
            //rajouter en fonction de la réponse un popup ?
        });
    };

    $scope.delete = function() {
        $scope.deleteMyMeal(meal._id, _etag);
        $uibModalInstance.close();
        $state.go('view_meals', {
            reload: true,
            inherit: false,
            notify: false
        });

    }; //function to validate the modal

    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    }; //funcion to dismiss the modal

});

modMyMealsDetailed.controller('modalEditInstanceCtrl', function($scope, $http, $uibModalInstance, $state, meal) {

    $scope.editMyMeal = function(meal_id) {
        $http.patch('/api/meals/private/' + meal_id).then(function(response) {
            //rajouter en fonction de la réponse un popup ?
        });
    };

    //required for the calendar toolbar (datamodel : editedMeal.time)

    $scope.dateOptions = {
            formatYear: 'yy',
            maxDate: new Date(2020, 5, 22),
            minDate: new Date(),
            startingDay: 1
        },

        $scope.clear = function() {
            $scope.editedMeal.time = null;
        };

    $scope.date_open = function() {
        $scope.date_popup.opened = true;
    };

    $scope.date_popup = {
        opened: false
    };

    //date formats for datepicker
    $scope.date_format = 'dd-MMM-yyyy';
    $scope.altInputDateFormats = ['M!/d!/yyyy'];

    //required for the calendar toolbar (datamodel : editedMeal.time)

    $scope.ismeridian = false;
    $scope.mstep = 15;

    $scope.formPopoverTimepickerMM = {
        title: 'Hora de la cena',
        templateUrl: 'PopoverTimepickerTemplateMM.html'
    };

    $scope.formPopoverTimepickerTimeCooking = {
        title: 'Llegada de los que ayudan a cocinar',
        templateUrl: 'PopoverTimepickerTemplateTimeCooking.html'
    };

    $scope.meal = meal;
    $scope.nbCooksInscribed = $scope.meal.detailedInfo.requiredGuests.cooks.nbRquCooks - $scope.meal.detailedInfo.requiredGuests.cooks.nbRemainingPlaces;
    if ($scope.meal.detailedInfo.requiredGuests.cleaners != undefined) {
        $scope.nbCleanersInscribed = $scope.meal.detailedInfo.requiredGuests.cleaners.nbRquCleaners - $scope.meal.detailedInfo.requiredGuests.cleaners.nbRemainingPlaces;
    }
    else {
        $scope.nbCleanersInscribed = 0;
    }
    if ($scope.meal.detailedInfo.requiredGuests.simpleGuests != undefined) {
        $scope.nbSimpleGuestsInscribed = $scope.meal.detailedInfo.requiredGuests.simpleGuests.nbRquSimpleGuests - $scope.meal.detailedInfo.requiredGuests.simpleGuests.nbRemainingPlaces;
    }
    else {
        $scope.nbSimpleGuestsInscribed = 0;
    }
    $scope.edit = function() {
        if (($scope.nbCooksInscribed <= ($scope.meal.detailedInfo.requiredGuests.cooks.nbRquCooks - 1) || $scope.nbCooksInscribed == undefined) && ($scope.nbCleanersInscribed <= $scope.meal.detailedInfo.requiredGuests.cleaners.nbRquCleaners || $scope.nbCleanersInscribed == undefined) && ($scope.nbSimpleGuestsInscribed <= $scope.meal.detailedInfo.requiredGuests.simpleGuests.nbRquSimpleGuests || $scope.nbSimpleGuestsInscribed == undefined)) {
            $scope.editMyMeal($scope.meal._id);
            $uibModalInstance.close();
            $state.reload();
        }
    }; //function to validate the modal

    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    }; //funcion to dismiss the modal

});

modMyMealsDetailed.controller('modalUnsubscribeInstanceCtrl', function($scope, $http, $uibModalInstance, $state) {

    $scope.unsubscribeMyMeal = function(meal_id) {
        $http.post('/api/meals/' + meal_id + '/unsubscription').then(function(response) {
            //rajouter en fonction de la réponse un popup ?
        });
    };

    $scope.unsubscribe = function() {
        $scope.unsubscribeMyMeal($scope.meal._id);
        $uibModalInstance.close();
        $state.go('view_meals', {
            reload: true,
            inherit: false,
            notify: false
        });

    }; //function to validate the modal

    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    }; //funcion to dismiss the modal

})

.filter('ageFilter', function() {
    function calculateAge(birthday) { // birthday is a date
        var nowAge = new Date;
        var birthday_value = new Date(birthday);
        var ageDifMs = nowAge - birthday_value;
        var ageDate = new Date(ageDifMs); // miliseconds from epoch
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    }

    return function(birthdate) {
        return calculateAge(birthdate);
    };
});