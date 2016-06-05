'use strict';

describe('myApp.welcome module', function() {

  beforeEach(module('myApp.welcome'));

  describe('welcome controller', function(){
    var $httpBackend, $rootScope, WelcomeController;
    beforeEach(inject(function($injector){
      //set up the mock backend service
      $httpBackend=$injector.get('$httpBackend');
      // Get hold of a scope (i.e. the root scope)
      $rootScope = $injector.get('$rootScope');
      // The $controller service is used to create instances of controllers
      var $controller = $injector.get('$controller');
      WelcomeController = function() {
        return $controller('WelcomeCtrl', {'$scope' : $rootScope });
      }
    }));

    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    describe('backend requests', function(){
      beforeEach(function(){
        $httpBackend.expectGET('/api/meals').respond(200, {"meal":"test"});
        var controller = WelcomeController();
        $httpBackend.flush();
        $rootScope.meals= [{_id:"01234",location:"ici"},{_id:"5642",location:"ailleurs"}]
      })

      it('should test that loadMeals method works', function() {
        $httpBackend.expectGET('/api/meals').respond(200,[{_id:"01234",location:"ici"},{_id:"5642",location:"ailleurs"}]);
        $rootScope.loadMeals();
        $httpBackend.flush();
        expect($rootScope.meals).toEqual([{_id:"01234",location:"ici"},{_id:"5642",location:"ailleurs"}]);
      });

    })


  });
});
