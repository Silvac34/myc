'use strict';

var modViewMeals = angular.module('myApp.viewMeals', ['ui.router', 'angular-svg-round-progressbar', 'ui.bootstrap', 'myApp.viewMealsDtld', 'ngMap'])

modViewMeals.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('view_meals.mealsMap', {
      views: {
        'mealsMap': {
          templateUrl: 'static/viewMeals/viewMealsContainer/mealsMap.html',
        }
      }
    })
    .state('view_meals.mealsList', {
      views: {
        'mealsList': {
          templateUrl: 'static/viewMeals/viewMealsContainer/mealsList.html',
        }
      }
    });
}]);


modViewMeals.controller('ViewMealsCtrl', ['$scope', '$state', '$uibModal', '$auth', 'response', '$timeout', 'NgMap', '$filter', function($scope, $state, $uibModal, $auth, response, $timeout, NgMap, $filter) {

  $scope.meals = response.data['_items']; //récupère les données passées lorsqu'on charge la page (chargement lors de loading de la page)

  $scope.$watch("manualSubscriptionPending", function(newValue, oldValue) { //permet de savoir si dans les données chargées, il y a des meals en attente de validation
    if (newValue == true && oldValue == undefined) {
      $timeout(function() {
        $scope.manualSubscriptionPending = false;
      }, 4000);
    }
  });

  $scope.openModalDtld = function(meal_id) { //permet d'ouvrir les modals de chacun de repas associés
    if (this.meal.detailedInfo.subscribed == true) {
      $state.go("view_my_dtld_meals", {
        "myMealId": meal_id
      });
    }
    else {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'static/viewMeals/viewMealsDtld/viewMealsDtld.html',
        controller: 'ViewMealsDtldCtrl',
        size: "lg",
        windowClass: 'modal-meal-window',
        resolve: {
          meal_id: function() {
            return meal_id;
          },
          isAuthenticated: function() {
            return $auth.isAuthenticated();
          }
        }
      });
      modalInstance.result.then(function(result) {
        var result_value = result;
        if (result_value == undefined) {
          result_value = {
            "manualSubscriptionPending": false,
            "pending": false
          };
        }
        $scope.manualSubscriptionPending = result_value.manualSubscriptionPending;
        for (var i = 0; i < $scope.meals.length; i++) {
          if ($scope.meals[i]._id == meal_id) {
            $scope.meals[i].detailedInfo.pending = result_value.pending;
          }
        }
      });
    }
  };
  $scope.isCollapsed = {
    "weekDays": false,
    "period": false,
    "price": false,
  }; //permet de faire apparaître tous les filtres lors du chargement de la page
  $scope.reverse = false; //permet de filtrer du plus récent au plus ancien
  $scope.SortOrder = 'asc';

  $scope.openModalFilter = function(filter) { //permet d'ouvrir le modal de filtres lorsqu'on est sur mobile
    $uibModal.open({
      animation: true,
      templateUrl: 'static/viewMeals/viewFilter/filterMobile.html',
      controller: 'filterMealModalCtrl',
      scope: $scope
    });
  };

  $scope.filter = {
    weekDays: [{
      label: 'Monday',
      selected: false,
      ind: 1
    }, {
      label: 'Tuesday',
      selected: false,
      ind: 2
    }, {
      label: 'Wednesday',
      selected: false,
      ind: 3
    }, {
      label: 'Thursday',
      selected: false,
      ind: 4
    }, {
      label: 'Friday',
      selected: false,
      ind: 5
    }, {
      label: 'Saturday',
      selected: false,
      ind: 6
    }, {
      label: 'Sunday',
      selected: false,
      ind: 0
    }],
    dateFilterMin: {
      opened: false,
      value: null
    },
    dateFilterMax: {
      opened: false,
      value: null
    },
    priceFilterMin: {
      value: null
    },
    priceFilterMax: {
      value: null
    }
  };

  //code pour faire les filtres selon les weekDays
  $scope.weekDaysFilter = function(meal) { //permet de faire un filtre avec les jours de la semaine selectionnés
    if ($scope.filter.weekDays.some(checkIfWeekDaysSelected) == true) {
      for (var i = 0; i < $scope.filter.weekDays.length; i++) {
        if ($scope.filter.weekDays[i].selected == true) {
          var mealDate = new Date(meal.time);
          return (mealDate.getDay() == $scope.filter.weekDays[i].ind);
        }
      }
    }
    else {
      return meal;
    }
  };

  function checkIfWeekDaysSelected(element, index, array) { //vérifie si au moins un des jours de la semaine a été selectionné dans les filtres
    return element.selected == true;
  }

  //code pour faire les filtres selon une période fixe de temps
  $scope.dateFilterMin_open = function() {
    $scope.filter.dateFilterMin.opened = true;
  };

  $scope.dateFilterMax_open = function() {
    $scope.filter.dateFilterMax.opened = true;
  };

  $scope.dateRangeFilter = function(meal) {
    var mealDate = new Date(meal.time);
    if ($scope.filter.dateFilterMin.value != null && $scope.filter.dateFilterMax.value != null) {
      return (mealDate >= $scope.filter.dateFilterMin.value && mealDate <= $scope.filter.dateFilterMax.value);
    }
    else {
      if ($scope.filter.dateFilterMin.value != null) {
        return (mealDate >= $scope.filter.dateFilterMin.value);
      }
      else if ($scope.filter.dateFilterMax.value != null) {
        return (mealDate <= $scope.filter.dateFilterMax.value);
      }
      else {
        return meal;
      }
    }
  };

  $scope.priceRangeFilter = function(meal) {
    if ($scope.filter.priceFilterMin.value != null && $scope.filter.priceFilterMax.value != null) {
      return ((meal.price / meal.nbGuests) >= $scope.filter.priceFilterMin.value && (meal.price / meal.nbGuests) <= $scope.filter.priceFilterMax.value);
    }
    else {
      if ($scope.filter.priceFilterMin.value != null) {
        return ((meal.price / meal.nbGuests) >= $scope.filter.priceFilterMin.value);
      }
      else if ($scope.filter.priceFilterMax.value != null) {
        return ((meal.price / meal.nbGuests) <= $scope.filter.priceFilterMax.value);
      }
      else {
        return meal;
      }
    }
  };

  $state.go("view_meals.mealsList");
  $scope.googleMapsUrl = "https://maps.googleapis.com/maps/api/js?key=AIzaSyBwwM-TMFz42n8ZDaGHF-8rGt76cdoXN8M";

  NgMap.getMap("mealsMap").then(function(map) {
    var markers = [];
    for (var i = 0; i < $scope.meals.length; i++) {
      var position = { // definit la position du repas
        "lat": $scope.meals[i].address.lat,
        "lng": $scope.meals[i].address.lng
      };
      markers[i] = new google.maps.Marker({ //créer le marqueur sur la carte
        "position": position,
        "map": map,
        "title": "Menu: " + $scope.meals[i].menu.title,
        "_id": $scope.meals[i]._id
      });
      markers[i].index = i;
      var infoWindow = new google.maps.InfoWindow({
        maxWidth: 250
      }); //static infoWindow for all your markers
      google.maps.event.addListener(markers[i], 'click', function() {
        var meal_id = this._id;
        for (var j = 0; j < $scope.meals.length; j++) {
          if ($scope.meals[j]._id == meal_id) {
            var mealPrice = $scope.meals[j].price / $scope.meals[j].ngGuests;
            if("cooks" in $scope.meals[j].detailedInfo.requiredGuests){
               mealPrice = $scope.meals[j].detailedInfo.requiredGuests.cooks.price;
            }
            else if("cleaners" in $scope.meals[j].detailedInfo.requiredGuests){
             mealPrice = $scope.meals[j].detailedInfo.requiredGuests.cleaners.price;
            }
            else if("simpleGuests" in $scope.meals[j].detailedInfo.requiredGuests){
              mealPrice = $scope.meals[j].detailedInfo.requiredGuests.simpleGuests.price;
            }
            var content = '<div id="content">' + //définit ce qui va apparaître dans la fenêtre lorsqu'on clique sur un marqueur
            '<div class="cutlery-menu map-menu"><strong class="map-text-menu">' + $scope.meals[j].menu.title + '</strong></div>' +
              '<div>' +
                '<span class="date-calendar map-date">' + $filter('date')($scope.meals[j].time, 'EEEE dd MMMM') + '</span>' +
                '<span class="time-calendar map-time">' + $filter('date')($scope.meals[j].time, 'HH:mm') + '</span>' +
              '</div>' +
              '<div class="clear10"></div>' +
              '<span class="price-banknote map-price"><span style="color:initial;font-weight:100;">From</span> ' + $filter('currency')(mealPrice) +'</span>' +
              '<div class="clear10"></div>' +
              '<div>'+
                '<div>'+
                  '<strong>Hosted by:</strong>'+
                '</div>'+
                '<div style="float:right;"><a ui-sref="my_meals">'+
                  '<span class="meal-admin-name">'+ $scope.meals[j].admin.first_name +' '+ $scope.meals[j].admin.last_name+'</span>'+
                  '<img class="img-circle profilePic" style="margin-left: 10px;margin-bottom: 0px;" src="'+ $scope.meals[j].admin.picture.data.url+'" alt="User profile picture" /></a>' +
                '</div>'+
                '<div class="clear10"></div>' +
              '</div>'+
              /*'<div class="text-center" style="width:110%">'+
                '<a ng-click=openModalDtld('+$scope.meals[j]._id+') class="btn btn-primary btn-sm">Subscribe</a>'+
              '</div>'+*/
            '</div>';
          }
        }
        infoWindow.setContent(content);
        infoWindow.open(map, markers[this.index]);
        map.panTo(markers[this.index].getPosition());
      });
    }
  });

  /*console.log($scope.map);
  var markers = [];
  for (var i = 0; i < 8; i++) {
    markers[i] = new google.maps.Marker({
      title: "Hi marker " + i
    })
  }
  $scope.GenerateMapMarkers = function() {
    var numMarkers = Math.floor(Math.random() * 4) + 4; // betwween 4 & 8 of them
    for (i = 0; i < numMarkers; i++) {
      var lat = 1.280095 + (Math.random() / 100);
      var lng = 103.850949 + (Math.random() / 100);
      // You need to set markers according to google api instruction
      // you don't need to learn ngMap, but you need to learn google map api v3
      // https://developers.google.com/maps/documentation/javascript/marker
      var latlng = new google.maps.LatLng(lat, lng);
      markers[i].setPosition(latlng);
      markers[i].setMap($scope.map)
    }
  };

  $scope.GenerateMapMarkers(); */

}]);

modViewMeals.controller('filterMealModalCtrl', function($scope, $uibModalInstance) {
  $scope.cancel = function() {
    $uibModalInstance.close();
  };

  $scope.clearAndCloseFilterMobile = function() {
    for (var i = 0; i < $scope.filter.weekDays.length; i++) {
      $scope.filter.weekDays[i].selected = false;
    }
    $uibModalInstance.close();
  };

});