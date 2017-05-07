'use strict';

var app = angular.module('getAgeService', []);

app.factory('getAgeServiceFactory', function() {

    function calculateAge(birthday) { // birthday is a date
        var now = new Date;
        var birthday_value = new Date(birthday);
        var ageDifMs = now - birthday_value;
        var ageDate = new Date(ageDifMs); // miliseconds from epoch
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    }

    return function(birthdate) {
        return calculateAge(birthdate);
    };


});