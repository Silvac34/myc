'use strict';

var modMyMealsDetailed = angular.module('myApp.viewMyMealsDtld', ['ui.router', 'angular-svg-round-progressbar', 'ui.bootstrap', 'ngAnimate', 'ngMap']);

modMyMealsDetailed.controller('ViewMyMealsDtldCtrl', ['$scope', '$http', '$stateParams', '$uibModal', 'ENV', '$timeout', 'meal', 'NgMap', 'getMealReviewServiceFactory', 'userResolve', '$state', function($scope, $http, $stateParams, $uibModal, ENV, $timeout, meal, NgMap, getMealReviewServiceFactory, userResolve, $state) {

    $scope.meal = meal.data;

    function check_loading() {
        $scope.pendingRequest = false;
        if ("users" in $scope.meal) {
            for (var i = 0; i < $scope.meal.users.length; i++) {
                if ($scope.meal.users[i]._id == userResolve._id) {
                    if ($scope.meal.users[i].status == "pending") {
                        $state.go("view_meals");
                    }
                    else {
                        $scope.userRole = $scope.meal.users[i].role[0];
                    }
                }
                if ($scope.meal.users[i].status == "pending") { //fait apparaître l'encadré de validation lorsqu'un utilisateur est en attente de confirmation pour participer à un repas
                    $scope.pendingRequest = true;
                }
            }
        }
    }

    check_loading();
    $scope.data_href_comment = ENV.fbRedirectURI + "#/my_meals/" + $scope.meal._id;
    $scope.data_href_publishOnFacebook = ENV.fbRedirectURI + "#/view_meals";

    //modalDelete to delete a meal
    $scope.openModalDelete = function() {
        if ($scope.isOldMeal() != true) {
            $uibModal.open({
                animation: true,
                templateUrl: '/static/viewMyMeals/viewMyMealsDtld/modalviewMyMealsDtld/modalDeleteMyMealDtld.html',
                controller: 'modalDeleteInstanceCtrl',
                size: "sm",
                resolve: {
                    meal: function() {
                        return $scope.meal;
                    }
                }
            });
        }
    };

    //modalEdit to edit a meal
    $scope.openModalEdit = function() {
        if ($scope.isOldMeal() != true) {
            $uibModal.open({
                animation: true,
                templateUrl: 'static/viewMyMeals/viewMyMealsDtld/modalviewMyMealsDtld/modalEditMyMealDtld.html',
                controller: 'modalEditInstanceCtrl',
                size: "lg",
                resolve: {
                    editedMeal: function() {
                        return $scope.meal;
                    }
                }
            });
        }
    };

    //modalUnsubscribe to unsubscribe to a meal
    $scope.openModalUnsubscribe = function() {
        if ($scope.isOldMeal() != true) {
            $uibModal.open({
                animation: true,
                templateUrl: '/static/viewMyMeals/viewMyMealsDtld/modalviewMyMealsDtld/modalUnsubscribeMyMealDtld.html',
                controller: 'modalUnsubscribeInstanceCtrl',
                size: "sm",
                resolve: {
                    meal: function() {
                        return $scope.meal;
                    }
                }
            });
        }
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
            var nbPendingRequest = 0;
            for (var i = 0; i < $scope.meal.users.length; i++) {
                if ($scope.meal.users[i]._id == participant_id) {
                    $scope.meal.users[i].status = "accepted";
                }
                else if ($scope.meal.users[i].status == "pending") {
                    nbPendingRequest += 1;
                }
            }
            if (nbPendingRequest == 0) {
                $scope.pendingRequest = false;
            }
        });
    };

    $scope.refuseSubscription = function(participant_id) {
        $http.post('/api/meals/' + $scope.meal._id + '/subscription/validate/' + participant_id, {
            'validation_result': false
        }).then(function() {
            var nbPendingRequest = 0;
            for (var i = 0; i < $scope.meal.users.length; i++) {
                if ($scope.meal.users[i]._id == participant_id) {
                    delete $scope.meal.users[i];
                }
                else if ($scope.meal.users[i].status == "pending") {
                    nbPendingRequest += 1;
                }
            }
            if (nbPendingRequest == 0) {
                $scope.pendingRequest = false;
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
        var hoursToAdd = 7;
        now.setHours(now.getHours() - hoursToAdd);
        var mealTime = new Date($scope.meal.time);
        return now >= mealTime;
    };

    $scope.dataForReview = [];
    getMealReviewServiceFactory($scope.meal._id, userResolve._id).then(function successCallBack(response) {
        if (response.length > 0) {
            $scope.dataForReview = response;
            for (var i = 0; i < $scope.dataForReview.length; i++) {
                $scope.dataForReview[i]['sent'] = true;
            }
        }
    });


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

    $scope.getDataForReview = function(participantId, type) {
        var index = checkIndexDataForReview(participantId);
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

    $scope.sendReview = function(participantId, role, type, value) {
        var index = checkIndexDataForReview(participantId);
        if (participantId != $scope.$parent.$root.user._id) {
            if (index == $scope.dataForReview.length) {
                $scope.dataForReview.push({
                    "forUser": {
                        "_id": participantId,
                        "role": role[0]
                    },
                    "mealAssociated": $scope.meal._id,
                    "fromUser": {
                        "_id": userResolve._id,
                        "role": $scope.userRole
                    },
                    "unique": participantId + userResolve._id + $scope.meal._id,
                    "sent": false
                });
            }
            $scope.dataForReview[index].forUser[type] = value;
            if (type == "comment") {
                if ($scope.dataForReview[index].forUser.rating == undefined) {
                    for (var i = 0; i < $scope.meal.users.length; i++) {
                        if ($scope.meal.users[i]._id == participantId) {
                            console.log("you need to grade " + $scope.meal.users[i].first_name);
                        }
                    }
                }
                else {
                    delete $scope.dataForReview[index].sent;
                    $http.post('/api/reviews', $scope.dataForReview[index]).then(function successCallBack(response) {
                        $scope.dataForReview[index]['sent'] = true; //on ajoute cet attribut pour modifier la vue HTML des références
                    }, function errorCallback(response) {
                        $scope.dataForReview[index]['sent'] = false; //s'il y a une erreur dans le process alors les données ne se sont pas envoyées
                    });
                }
            }
        }
    };

}]);

modMyMealsDetailed.controller('modalDeleteInstanceCtrl', function($scope, $http, $uibModalInstance, $state, meal) {

    $scope.delete = function() {
        var config = {
            headers: {
                "If-Match": meal._etag
            }
        };
        $http.delete('/api/meals/private/' + meal._id, config).then(function successCallBack(response) {
            $uibModalInstance.close();
            $state.go('view_meals', {
                reload: true,
                inherit: false,
                notify: false
            });
            //rajouter en fonction de la réponse un popup ?
        }, function errorCallBack(response) {
            console.log("We could not delete the meal");
        });

    }; //function to validate the modal

    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    }; //funcion to dismiss the modal

});

modMyMealsDetailed.controller('modalEditInstanceCtrl', function($scope, $http, $uibModalInstance, $state, editedMeal, $timeout, $parse, $filter) {
    $scope.editedMeal = editedMeal;
    $scope.addressComplement = $scope.editedMeal.privateInfo.address.complement;
    $scope.currency_symbol = $scope.editedMeal.price.split(" ")[0];
    $scope.editedMeal.priceToEdit = parseFloat($scope.editedMeal.price.split(" ")[1]);
    $scope.editedMeal.time = new Date($scope.editedMeal.time);
    if (editedMeal.detailedInfo.requiredGuests.cooks.timeCooking) {
        $scope.editedMeal.detailedInfo.requiredGuests.cooks.timeCooking = new Date($scope.editedMeal.detailedInfo.requiredGuests.cooks.timeCooking);
    }
    if (editedMeal.detailedInfo.requiredGuests.cleaners.timeCleaning) {
        $scope.editedMeal.detailedInfo.requiredGuests.cleaners.timeCleaning = new Date($scope.editedMeal.detailedInfo.requiredGuests.cleaners.timeCleaning);
    }
    $scope.autocompleteAddress = $scope.editedMeal.privateInfo.address.name + ", " + $scope.editedMeal.address.town + ", " + $scope.editedMeal.address.country;
    $scope.editedMeal.timeForControl = new Date($scope.editedMeal.time);

    //required for the calendar toolbar (datamodel : editedMeal.time)

    $scope.dateOptions = {
        formatYear: 'yy',
        maxDate: new Date(2020, 5, 22),
        minDate: new Date(),
        startingDay: 1
    };

    function addAddressFromAutocomplete(dataToPerform) {
        var precision_needed_for_rounding_lat_lng = 100;
        if ($scope.details != undefined) {
            if (!dataToPerform.address) {
                dataToPerform["address"] = {};
            }
            if ("vicinity" in $scope.details) {
                dataToPerform.address.town = $scope.details.vicinity;
            }
            else {
                dataToPerform.address.town = $scope.autocompleteAddress.split(",")[0];
            }
            if (!dataToPerform.privateInfo) {
                dataToPerform["privateInfo"] = {};
            }
            if (!dataToPerform.privateInfo.address) {
                dataToPerform.privateInfo["address"] = {};
            }
            dataToPerform.privateInfo.address.name = $scope.details.name;
            dataToPerform.privateInfo.address.lat = $scope.details.geometry.location.lat();
            dataToPerform.privateInfo.address.lng = $scope.details.geometry.location.lng();
            dataToPerform.address.lat = Math.round($scope.details.geometry.location.lat() * precision_needed_for_rounding_lat_lng) / precision_needed_for_rounding_lat_lng;
            dataToPerform.address.lng = Math.round($scope.details.geometry.location.lng() * precision_needed_for_rounding_lat_lng) / precision_needed_for_rounding_lat_lng;
            for (var i = 0; i < $scope.details.address_components.length; i++) {
                if ($scope.details.address_components[i].types[0] == "postal_code") {
                    dataToPerform.address.postalCode = $scope.details.address_components[i].long_name;
                }
                if ($scope.details.address_components[i].types[0] == "country") {
                    dataToPerform.address.country_code = $scope.details.address_components[i].short_name;
                }
            }
        }
    }

    function getDataToPerform(dataToPerform) {
        $scope.editedMeal;
        $scope.editMealForm.$$controls.forEach(function(element) { //on effectue une boucle sur chacun des élements contenu dans le formulaire
            if (element.$viewValue != element.$$lastCommittedViewValue) { // on vérifie si l'élément à été modifié, dans ce cas, on le rajoute dans dataToPerform
                var parseFunction = $parse(element.$$attr.ngModel);
                if (element.$$attr.ngModel == "autocompleteAddress") {
                    addAddressFromAutocomplete(dataToPerform);
                }
                else if (element.$$attr.ngModel == "editedMeal.time") {
                    var newDate = new Date(element.$modelValue);
                    if (element.$name == "formDate") {
                        var oldDate = new Date(element.$viewValue);
                        newDate.setDate(oldDate.getDay());
                        newDate.setMonth(oldDate.getMonth());
                        newDate.setFullYear(oldDate.getFullYear());
                    }
                    else {
                        newDate.setHours(element.$viewValue.split(":")[0]);
                        newDate.setMinutes(element.$viewValue.split(":")[1]);
                    }
                    parseFunction.assign(dataToPerform, newDate);
                }
                else if (element.$$attr.ngModel == "editedMeal.detailedInfo.requiredGuests.cooks.timeCooking" || element.$$attr.ngModel == "editedMeal.detailedInfo.requiredGuests.cleaners.timeCleaning") {
                    var newDate = new Date($scope.editedMeal.time);
                    newDate.setHours(element.$viewValue.split(":")[0]);
                    newDate.setMinutes(element.$viewValue.split(":")[1]);
                    parseFunction.assign(dataToPerform, newDate);
                }
                else {
                    parseFunction.assign(dataToPerform, element.$viewValue);
                }
            }
        });
        return dataToPerform;
    }


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
    $scope.date_formats = ['EEEE dd MMMM yyyy', 'dd-MMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.date_format = $scope.date_formats[0];
    $scope.altInputDateFormats = ['M!/d!/yyyy'];

    //required for the calendar toolbar (datamodel : meal.time)

    $scope.ismeridian = false;
    $scope.mstep = 10;

    $scope.formPopoverTimepicker = {
        title: 'Time of the meal',
        templateUrl: 'static/viewCreateMeal/viewCreateMealModal/PopoverTimepickerTemplate.html',
    };

    //enable animations in the modal
    $scope.animationsEnabled = true;

    if ($scope.editedMeal.detailedInfo.requiredGuests.cooks) {
        $scope.nbCooksSubscribed = $scope.editedMeal.detailedInfo.requiredGuests.cooks.nbRquCooks - $scope.editedMeal.detailedInfo.requiredGuests.cooks.nbRemainingPlaces;
    }
    else {
        $scope.nbCooksSubscribed = 0;
    }
    if ($scope.editedMeal.detailedInfo.requiredGuests.cleaners) {
        $scope.nbCleanersSubscribed = $scope.editedMeal.detailedInfo.requiredGuests.cleaners.nbRquCleaners - $scope.editedMeal.detailedInfo.requiredGuests.cleaners.nbRemainingPlaces;
    }
    else {
        $scope.nbCleanersSubscribed = 0;
    }
    if ($scope.editedMeal.detailedInfo.requiredGuests.simpleGuests) {
        $scope.nbSimpleGuestsSubscribed = $scope.editedMeal.detailedInfo.requiredGuests.simpleGuests.nbRquSimpleGuests - $scope.editedMeal.detailedInfo.requiredGuests.simpleGuests.nbRemainingPlaces;
    }
    else {
        $scope.nbSimpleGuestsSubscribed = 0;
    }

    function checkTimeCooking(dataToPerform) {
        if (dataToPerform.editedMeal.detailedInfo && dataToPerform.editedMeal.detailedInfo.requiredGuests && dataToPerform.editedMeal.detailedInfo.requiredGuests.cooks) {
            if (dataToPerform.editedMeal.detailedInfo.requiredGuests.cooks.timeCooking && dataToPerform.editedMeal.time && dataToPerform.editedMeal.detailedInfo.requiredGuests.cooks.timeCooking <= dataToPerform.editedMeal.time || //on vérifie que l'heure d'arrivée d'aide cuisine est bien avant l'heure du repas
                dataToPerform.editedMeal.detailedInfo.requiredGuests.cooks.timeCooking && dataToPerform.editedMeal.detailedInfo.requiredGuests.cooks.timeCooking <= $scope.editedMeal.time ||
                !dataToPerform.editedMeal.detailedInfo.requiredGuests.cooks.timeCooking) {
                return true;
            }
            else {
                return false;
            }
        }
        else {
            return true;
        }
    }

    $scope.edit = function() {
        var dataToPerform = {};
        getDataToPerform(dataToPerform);
        var nbRquCooks = Number(document.getElementById("inputCooks").value) || 0;
        var nbRquCleaners = Number(document.getElementById("inputCleaners").value) || 0;
        var nbRquSimpleGuests = Number(document.getElementById("inputSimpleGuests").value) || 0;
        if ($scope.nbCooksSubscribed <= nbRquCooks && $scope.nbCleanersSubscribed <= nbRquCleaners && $scope.nbSimpleGuestsSubscribed <= nbRquSimpleGuests) { //on vérifie que on ne diminue pas mal le nombre de places restantes là où des personnes se sont déjà inscrites
            if ((nbRquCooks > 0 && document.getElementById("inputTimeCooking").value != "") || nbRquCooks == 0) { //on vérifie qu'il y a bien une heure si on rajoute une aide cuisine
                if (checkTimeCooking(dataToPerform) == true) {
                    var config = {
                        headers: {
                            "If-Match": $scope.editedMeal._etag
                        }
                    };
                    $http.patch('/api/meals/private/' + $scope.editedMeal._id, dataToPerform.editedMeal, config).then(function successCallBack(response) {
                        $uibModalInstance.close();
                        $state.reload();
                        //rajouter en fonction de la réponse un popup ?
                    }, function errorCallBack(response) {
                        console.log(response);
                    });
                }
                else {
                    $scope.editMealForm.$commitViewValue();
                }
            }
            else {
                $scope.editMealForm.$commitViewValue();
            }
        }
        else {
            $scope.editMealForm.$commitViewValue();
        }
    };


    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    }; //funcion to dismiss the modal*/
});

modMyMealsDetailed.controller('modalUnsubscribeInstanceCtrl', function($scope, $http, $uibModalInstance, $state, meal) {

    $scope.unsubscribe = function() {
        $http.post('/api/meals/' + meal._id + '/unsubscription').then(function(response) {
            //rajouter en fonction de la réponse un popup ?
        });
        $uibModalInstance.close();
        $state.go('view_meals', {
            reload: true,
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
})