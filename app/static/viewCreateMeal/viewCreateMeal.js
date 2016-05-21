'use strict';

angular.module('myApp.viewCreateMeal', ['ui.router','ngAnimate','ngMessages','ngResource',])

.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.when('/create_meal', '/create_meal/diner');
  $stateProvider
    .state('create_meal.diner', {
      parent: 'create_meal',
      url: '/diner',
      templateUrl: 'static/viewCreateMeal/viewCreateMealDiner/viewCreateMealDiner.html',
      controller: 'ViewCreateMealCtrl'
    }),
  $stateProvider
    .state('create_meal.profile', {
      parent: 'create_meal',
      url: '/profile',
      templateUrl: 'static/viewCreateMeal/viewCreateMealProfile/viewCreateMealProfile.html',
      controller: 'ViewCreateMealCtrl'
    }),
  $stateProvider
    .state('create_meal.payment', {
      parent: 'create_meal',
      url: '/payment',
      templateUrl: 'static/viewCreateMeal/viewCreateMealPayment/viewCreateMealPayment.html',
      controller: 'ViewCreateMealCtrl'
    });
}])


.controller('ViewCreateMealCtrl', ['$scope', '$http', '$window', function($scope, $http, $window) {

  //initialize the editedMeal model
  $scope.editedMeal = $scope.editedMeal || {
    veggies: false,
    town: "Santiago",
    requiredHelpers:[],
    time: predefined_date,
  }, 
  
  
  
  $scope.helpBox = $scope.helpBox || {
    helpBuying: false, 
    helpCooking: false,
    helpCleaning: false,
    notHelping: true
  }
 
   $scope.animation = $scope.animation || {
    is_animated: false,
    is_not_animated: true,
    next_page: true,
    last_page: false
  },
  
  
  $scope.change_animation_to_the_right = function() {
      $scope.animation.next_page = true;
      $scope.animation.last_page = false;
      $scope.animation.is_animated = true;
      $scope.animation.is_not_animated = false;
  },
  
  $scope.change_animation_to_the_left = function() {
      $scope.animation.next_page = false;
      $scope.animation.last_page = true;
      $scope.animation.is_animated = true;
      $scope.animation.is_not_animated = false;
  },

  //initialize the buyers model
  $scope.buyers = $scope.buyers || {
      deliveryTime: "",
      ingredient: ""
    },

    $scope.cooks = $scope.cooks || {
      nbCooks: "",
      timeCooking: ""
    },

    $scope.cleaners = $scope.cleaners || {
      nbCleaners: ""
    },
  $scope.excludingHelp = function() {
    $scope.helpBox.helpBuying = false,
    $scope.helpBox.helpCooking = false,
    $scope.helpBox.helpCleaning = false;
  },

  $scope.includingHelp = function() {
    $scope.helpBox.notHelping = false;
  },


 $scope.createMeal = function() {
    if ($scope.helpBox.helpBuying == true) {
      $scope.editedMeal.detailedInfo.requiredHelpers.push({"buyers":$scope.buyers});
    }
    if ($scope.helpBox.helpCooking == true) {
      $scope.editedMeal.detailedInfo.requiredHelpers.push({"cooks":$scope.cooks});
    }
    if ($scope.helpBox.helpCleaning == true) {
      $scope.editedMeal.detailedInfo.requiredHelpers.push({"cleaners":$scope.cleaners});
    }
    $http.post('/api/meal', $scope.editedMeal);
    
    //TODO : rediriger vers page du repas
  };
  
  //required for the calendar toolbar (datamodel : editedMeal.date)
  
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
  
  $scope.date_formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
  $scope.date_format = $scope.date_formats[0];
  $scope.altInputDateFormats = ['M!/d!/yyyy'];

  //required for the calendar toolbar (datamodel : editedMeal.time)
  
  $scope.ismeridian = false;
  $scope.mstep = 15;
  
   var latlng = $window.navigator.geolocation.getCurrentPosition(function(position) {
    return position.coords.latitude + "," + position.coords.longitude;
  });
  /*
  var google_map_api_key = "AIzaSyAQsOeNUwks7blgswNuJQqWlJ-MzcdS_UA";
  var google_map_api_link = "json?latlng="+latlng+"&key="+google_map_api_key;
  var address = $resource("https://maps.googleapis.com/maps/api/geocode/:google_map_api_link", {google_map_api_link: '@google_map_api_link'});
  address.get({google_map_api_link:123}, function(user) {
  user.abc = true;
  user.$save();
});
  */
  var locationFactory = function($resource) {
    return $resource("https://maps.googleapis.com/maps/api/geocode/:verb", 
    {verb:'json', someParam: '@latlng', key:'key'}, 
    {'get': { method: 'GET',
      },
    });
  };
  
  var userFactory = function($resource){
	return $resource('/api/user/:slug', { slug : '@slug' }, 
		{
			'update' : { method:'PUT' },
		});
};

  
}]);



var predefined_date = new Date();
predefined_date.setDate(predefined_date.getDate() + 2);
predefined_date.setHours(20);
predefined_date.setMinutes(30);