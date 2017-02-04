'use strict';

angular.module('myApp.viewProfile', [])

.controller('ViewProfileCtrl', ['$scope', 'userServices', function($scope, userServices) {

  $scope.getUserProfile = function() {
    userServices.getUserInfo().then(function(data) {
      $scope.user = data;
    });
  };

  $scope.getUserProfile();

  var optionsFlags = {
    url: "../static/bower_components/EasyAutocomplete/demo/resources/countries.json",

    getValue: "name",

    list: {
      match: {
        enabled: true
      },
      maxNumberOfElements: 8
    },

    template: {
      type: "custom",
      method: function(value, item) {
        return "<span class='flag flag-" + (item.code).toLowerCase() + "' ></span>" + value;
      }
    },

    theme: "round"
  };

  $("#country_of_origin").easyAutocomplete(optionsFlags);

}]);
