'use strict';

export default angular.module('myApp.welcome', ['facebookService'])

.controller('WelcomeCtrl', ['$scope', 'getEventFacebook', 'ENV', '$window', function($scope, getEventFacebook, ENV, $window) {
    $scope.status = {
        isopenWelcome: false
    };
    $scope.localStorage = function() {
        window.open("https://mycommuneaty.herokuapp.com", "_blank");
    };
    /*$window.fbAsyncInit = function() {
    FB.init({ 
      appId: ENV.appId,
      status: true, 
      cookie: true, 
      xfbml: true,
      version: 'v2.6'
    });
};

    getEventFacebook.getEvent(user_id).then(function successCallBack(response) {
        console.log(response);
    }, function errorCallBack() {
        console.log("something went wrong");
    });
*/  
}]);
