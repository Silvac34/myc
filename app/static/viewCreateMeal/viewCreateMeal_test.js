'use strict';

describe('myApp.viewCreateMeal module', function() {

  beforeEach(module('myApp.viewCreateMeal'));

  describe('ViewCreateMealCtrl', function(){
    var $httpBackend, $rootScope, createController;
    beforeEach(inject(function($injector){
      //set up the mock backend service
      $httpBackend=$injector.get('$httpBackend');
      // Get hold of a scope (i.e. the root scope)
      $rootScope = $injector.get('$rootScope');
      // The $controller service is used to create instances of controllers
      var $controller = $injector.get('$controller');
      createController = function() {
        return $controller('ViewCreateMealCtrl', {'$scope' : $rootScope });
      }

    }));

    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    describe('backend requests', function(){
      beforeEach(function(){
        var controller = createController();
        $rootScope.meals= [{_id:"01234",location:"ici"},{_id:"5642",location:"ailleurs"}]
      })

      it('should test that createMeal method works', function() {
      $httpBackend.expectPOST('/api/meals', {_id:"01789",location:"labas"}).respond(200, '');
      $rootScope.createMeal({_id:"01789",location:"labas"});
      $httpBackend.flush();
      });

    })




  });
});
