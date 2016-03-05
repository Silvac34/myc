'use strict';

describe('myApp.viewMyMeals module', function() {

  beforeEach(module('myApp.viewMyMeals'));

  describe('viewMyMeals controller', function(){
    var $httpBackend, $rootScope, createController;
    beforeEach(inject(function($injector){
      //set up the mock backend service
      $httpBackend=$injector.get('$httpBackend');
      // Get hold of a scope (i.e. the root scope)
      $rootScope = $injector.get('$rootScope');
      // The $controller service is used to create instances of controllers
      var $controller = $injector.get('$controller');
      createController = function() {
        return $controller('ViewMyMealsCtrl', {'$scope' : $rootScope });
      }

    }));

    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    describe('backend requests', function(){
      beforeEach(function(){
        //$httpBackend.expectGET('/api/meals').respond(200, {"meal":"test"});
        var controller = createController();
        //$httpBackend.flush();
        $rootScope.meals= [{_id:"01234",location:"ici"},{_id:"5642",location:"ailleurs"}]
      })

      it('should test that deleteMeal method works', function() {
      $httpBackend.expectDELETE('/api/meal/01234').respond(200, "");
      $rootScope.deleteMeal("01234");
      $httpBackend.flush();
      expect($rootScope.meals).toEqual([{_id:"5642",location:"ailleurs"}]);
      });

      it('should test that updateMeal method works', function() {
      $httpBackend.expectPUT('/api/meal/01234',{_id:"01234",location:"chez josé"}).respond(200, "");
      $rootScope.updateMeal({_id:"01234",location:"chez josé"});
      $httpBackend.flush();
      });

    })


  });
});
