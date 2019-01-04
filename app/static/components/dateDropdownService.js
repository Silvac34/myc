'use strict';

export default angular.module('dateDropdownService', [])

.factory('rsmdateutils', function() {
    var that = this,
        dayRange = [1, 31],


        months = [{
            value: 0,
            name: 'January'
        }, {
            value: 1,
            name: 'February'
        }, {
            value: 2,
            name: 'March'
        }, {
            value: 3,
            name: 'April'
        }, {
            value: 4,
            name: 'May'
        }, {
            value: 5,
            name: 'June'
        }, {
            value: 6,
            name: 'July'
        }, {
            value: 7,
            name: 'August'
        }, {
            value: 8,
            name: 'September'
        }, {
            value: 9,
            name: 'October'
        }, {
            value: 10,
            name: 'November'
        }, {
            value: 11,
            name: 'December'
        }];

    function changeDate(date) {
        if (date.day > 28) {
            date.day--;
            return date;
        }
        else if (date.month > 11) {
            date.day = 31;
            date.month--;
            return date;
        }
    }

    return {
        checkDate: function(date) {
            var d;
            if (!date.day || !date.month || !date.year) return false;
            d = new Date(Date.UTC(date.year, date.month, date.day));

            if (d && (d.getMonth() === date.month && d.getDate() === Number(date.day))) {
                return d;
            }

            return this.checkDate(changeDate(date));
        },
        days: (function() {
            var days = [];
            while (dayRange[0] <= dayRange[1]) {
                days.push(dayRange[0]++);
            }
            return days;
        }()),
        months: (function() {

                return months;
            }())
            //months: (function () {
            //    var lst = [],
            //        mLen = months.length;

        //    while (mLen--) {
        //        lst.push({
        //            value: mLen,
        //            name: months[mLen]
        //        });
        //    }
        //    return lst;
        //}())
    };
})

.directive('datedropdowns', ['rsmdateutils', function(rsmdateutils) {
    return {
        restrict: 'A',
        replace: true,
        require: 'ngModel',
        scope: {
            model: '=ngModel'
        },
        controller: ['$scope', 'rsmdateutils', '$filter', function($scope, rsmDateUtils, $filter) {
            $scope.days = rsmDateUtils.days;
            $scope.months = rsmDateUtils.months;

            function checkIfExistBefore() {
                if ($scope.model == undefined) {
                    $scope.dateFields = {};
                }
                else {
                    var value = $scope.model.split("-");
                    if (value[1] == "0") {
                        var month = 0;
                    }
                    else {
                        var month = parseInt(value[1], 10) - 1;
                    }
                    $scope.dateFields = {
                        "year": parseInt(value[0], 10),
                        "month": month,
                        "day": parseInt(value[2].substring(0, 2), 10)
                    };
                }
            }

            checkIfExistBefore();


            $scope.$watch('model', function(newDate) {
                // if (newDate&&$scope.$parent.travel.program != null)
                if (newDate) {
                }
            });

            $scope.checkDate = function() {
                var date = rsmDateUtils.checkDate($scope.dateFields);
                if (date) {
                    $scope.model = date;
                }
            };
        }],
        template: '<div>' +
            '    <select name="dateFields.day" data-ng-model="dateFields.day"  class="form-control" ng-options="day for day in days" ng-change="checkDate()" ng-disabled="disableFields"></select>' +
            '    <select name="dateFields.month" data-ng-model="dateFields.month" class="form-control" ng-options="month.value as month.name for month in months" value="{{ dateField.month }}" ng-change="checkDate()" ng-disabled="disableFields" ></select>' +
            '    <select name="dateFields.year" data-ng-model="dateFields.year"  class="form-control" ng-options="year for year in years" ng-change="checkDate()" ng-disabled="disableFields"  ></select>' +
            '</div>',
        link: function(scope, element, attrs, ctrl) {
            var currentYear = parseInt(attrs.startingYear, 10) || new Date().getFullYear(),
                numYears = parseInt(attrs.numYears, 10) || 100,
                oldestYear = currentYear - numYears,
                overridable = [
                    'dayDivClass',
                    'dayClass',
                    'monthDivClass',
                    'monthClass',
                    'yearDivClass',
                    'yearClass'
                ],
                required;

            scope.years = [];
            scope.yearText = attrs.yearText ? true : false;

            if (attrs.ngDisabled) {
                scope.$parent.$watch(attrs.ngDisabled, function(newVal) {
                    scope.disableFields = newVal;
                });
            }

            //if (attrs.required) {
            //    required = attrs.required.split(' ');

            //    ctrl.$parsers.push(function (value) {
            //        angular.forEach(required, function (elem) {
            //            if (!angular.isNumber(elem)) {
            //                ctrl.$setValidity('required', false);
            //            }
            //        });
            //        ctrl.$setValidity('required', true);
            //    });
            //}

            for (var i = currentYear; i >= oldestYear; i--) {
                scope.years.push(i);
            }

            (function() {
                var oLen = overridable.length,
                    oCurrent,
                    childEle;
                while (oLen--) {
                    oCurrent = overridable[oLen];
                    childEle = element[0].children[Math.floor(oLen / 2)];

                    if (oLen % 2 && oLen != 2) {
                        childEle = childEle.children[0];
                    }

                    if (attrs[oCurrent]) {
                        angular.element(childEle).attr('class', attrs[oCurrent]);
                    }
                }
            }());
        }
    };
}]);