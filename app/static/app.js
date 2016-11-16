'use strict';

// Declare app level module which depends on views, and components
var app = angular.module('myApp', [
  'config',
  'ui.bootstrap',
  'ui.router',
  'satellizer',
  'myApp.viewCreateMeal',
  'myApp.viewMeals',
  'myApp.viewMyMeals',
  'myApp.viewLogin',
  'myApp.welcome',
  'userServices'
]);

app.config(['$stateProvider', '$urlRouterProvider', '$authProvider', 'ENV', function($stateProvider, $urlRouterProvider, $authProvider, ENV) {

  $stateProvider
    .state('welcome', {
      url: '/welcome',
      templateUrl: 'static/welcome/welcome.html',
      controller: 'WelcomeCtrl'
    });
  $stateProvider
    .state('login', {
      url: '/login',
      templateUrl: 'static/viewLogin/viewLogin.html',
      controller: 'ViewLoginCtrl'
    });
  $stateProvider
    .state('view_meals', {
      url: '/view_meals',
      templateUrl: 'static/viewMeals/viewMeals.html',
      controller: 'ViewMealsCtrl',
    });
    
  $stateProvider
    .state('create_meal', {
      url: '/create_meal',
      templateUrl: 'static/viewCreateMeal/viewCreateMeal.html',
      controller: 'ViewCreateMealCtrl',
      data: {
        requiredLogin: true
      }
    });
  $stateProvider
    .state('my_meals', {
      url: '/my_meals',
      templateUrl: 'static/viewMyMeals/viewMyMeals.html',
      controller: 'ViewMyMealsCtrl',
      data: {
        requiredLogin: true
      }
    });
  $stateProvider
    .state('footer_information_feedback', {
      url: '/information/send_feedback',
      templateUrl: 'static/footer/information/feedback/send_feedback.html',
    });
  $stateProvider
    .state('footer_information_contact', {
      url: '/information/contact_us',
      templateUrl: 'static/footer/information/contact/contact_us.html',
    });
  $stateProvider
    .state('footer_information_who_we_are', {
      url: '/information/who_we_are',
      templateUrl: 'static/footer/information/whoWeAre/who_we_are.html',
    });
  $stateProvider
    .state('footer_information_concept', {
      url: '/information/concept',
      templateUrl: 'static/footer/information/concept/concept.html',
    });
  $stateProvider
    .state('footer_information_FAQ', {
      url: '/information/FAQ',
      templateUrl: 'static/footer/information/FAQ/FAQ.html',
    });
  $stateProvider
    .state('footer_legal_terms_and_conditions', {
      url: '/legal/terms_and_conditions',
      templateUrl: 'static/footer/legal/termsAndConditions/terms_and_conditions.html',
    });
  $stateProvider
    .state('footer_more_careers', {
      url: '/more/careers',
      templateUrl: 'static/footer/more/careers/careers.html',
    });
  $stateProvider
    .state('footer_more_photo_gallery', {
      url: '/more/photo_gallery',
      templateUrl: 'static/footer/more/photoGallery/photo_gallery.html',
    });

  $urlRouterProvider.otherwise('welcome');

  $authProvider.facebook({
    clientId: ENV.fbClientID,
    redirectUri: ENV.fbRedirectURI,
    scope: ['email']
  });

}]);


app.run(function($rootScope, $state, $auth) {
  $rootScope.$on('$stateChangeStart',
    function(event, toState) {
      // when the state change, the user load the template at the top of the window
      document.body.scrollTop = document.documentElement.scrollTop = 0;
      var requiredLogin = false;
      // check if this state need login
      if (toState.data && toState.data.requiredLogin)
        requiredLogin = true;

      // if yes and if this user is not logged in, redirect him to login page
      if (requiredLogin && !$auth.isAuthenticated()) {
        event.preventDefault();
        $state.go('login');
      }
    });
  // enable to get the state in the view
  $rootScope.$state = $state;

});

app.controller('AppCtrl', ['$scope', '$auth', '$state', 'userServices', function($scope, $auth, $state, userServices) {

  $scope.auth = function(provider) {
    $auth.authenticate(provider)
      .then(function(response) {
        console.debug("success", response);
        $scope.getUserInfo();
      })
      .catch(function(response) {
        console.debug("catch", response);
      });
  };

  $scope.logout = function() {
      $auth.logout();
    },

    $scope.isAuthenticated = function() {
      return $auth.isAuthenticated();
    },

    $scope.getUserInfo = function() {
        userServices.getUserInfo().then(function(data) {
            $scope.$parent.user = data;
        });
    };

    $scope.getUserProfile = function() {
      if ($auth.isAuthenticated()) {
        userServices.getUserInfo().then(function(data) {
          $scope.user = data;
        });
      }
    };

    $scope.status = {
        isopen: false
    };

  $scope.getUserProfile();
  $scope.navbarCollapsed = true;

}]);
