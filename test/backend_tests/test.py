# -*- coding: utf-8 -*-
import os
import sys
topdir = os.path.join(os.path.dirname(__file__), "../..")
sys.path.append(topdir)
from pymongo import MongoClient
from app.run import Application, User
from bson.json_util import dumps,loads
from bson import ObjectId
import json
import eve
import unittest
#from test_settings import MONGO_URI

from unittest import TestCase 



MONGOLAB_URI_TEST = 'mongodb://shareat:kmaillet230191@ds055872.mlab.com:55872/shareat_dev_test'

@Application.app.errorhandler(Exception)
def global_handler(e):
    print(e)

class BasicAPITest(TestCase):
    
    def setUp(self):
	    self.maxDiff = None
	    self.app = Application.app
	    self.app.config['TESTING'] = True
	    self.app.config['DEBUG'] = True
	    self.app.config['MONGO_URI']=  MONGOLAB_URI_TEST
	    self.test_client = self.app.test_client()
	    self.db = MongoClient(MONGOLAB_URI_TEST).get_default_database()
		
    def tearDown(self):
	    del self.app
	    self.db.meals.delete_many({})
	    self.db.users.delete_many({})
	    
    def rmAddFieldsItem(self,dictObject):
	    del dictObject["_created"]
	    del dictObject["_updated"]
	    return dictObject

    def rmAddFieldsList(self,listObj):
        listObj= listObj['_items']
        for i in listObj:
            i = self.rmAddFieldsItem(i)
        return listObj
	    
class APITest1(BasicAPITest):
    def setUp(self):
        super(APITest1, self).setUp()
        self.db.users.insert(loads(open('../testData/users_testData.json').read())[0])
        self.adminUser = User(_id="111111111111111111111111")
    
    def tearDown(self):
	    super(APITest1, self).tearDown()
	    
    def test_unauthentificatedUser(self):
	    resp = self.test_client.post("/api/meals", data="{\"super\":\"toto\"}")
	    self.assertEqual("401 UNAUTHORIZED", resp.status)
	    
    def test_insert_empty_meal(self):
	    resp = self.test_client.post("/api/meals",data="{\"super\":\"toto\"}",headers = {'Authorization': 'Bearer {0}'.format(self.adminUser.token()), 'Content-Type':'application/json'})
	    self.assertEqual("422 UNPROCESSABLE ENTITY", resp.status)
	    
    def test_insert_meal(self):
	    jsonRequestData = "{\"town\": \"Santiago\",\"menu\": \"Jolie piece de boeuf\",\"price\": 100,\"detailedInfo\": {\"requiredGuests\": {\"cooks\":{\"nbRquCooks\":2,\"timeCooking\":\"2016-07-13T18:00:39.303Z\"},\"cleaners\":{\"nbRquCleaners\":1},\"simpleGuests\":{\"nbRquSimpleGuests\":6} }},\"privateInfo\" :{\"address\": \"30 avenue de Trudaine 75009\", \"adminPhone\":\"0601020304\"},\"veggies\": false,\"time\": \"2016-11-20T17:00:00.000Z\",\"addressApprox\": \"Métro Anvers L2\"}"
	    resp = self.test_client.post("/api/meals", data=jsonRequestData, headers = {'Authorization': 'Bearer {0}'.format(self.adminUser.token()),'Content-Type':'application/json'})
	    self.assertEqual("201 CREATED", resp.status)
	    dbMeal = self.db.meals.find_one()
	    self.rmAddFieldsItem(dbMeal)
	    testMeal = loads(open('../testData/meals_testData.json').read())[0]
	    testMeal["_id"]= dbMeal["_id"]
	    self.assertEqual(dbMeal, testMeal)
	    

class APITest2(BasicAPITest):
    def setUp(self):
        super(APITest2, self).setUp()
        self.db.meals.insert(loads(open('../testData/meals_testData.json').read())[0])
        self.db.meals.insert(loads(open('../testData/meals_testData.json').read())[1])
        self.db.users.insert(loads(open('../testData/users_testData.json').read())[0])
        self.db.users.insert(loads(open('../testData/users_testData.json').read())[1])
        self.adminUser = User(_id="111111111111111111111111")
        self.otherUser = User(_id="111111111111111111111112")
    
    def tearDown(self):
	    super(APITest2, self).tearDown()
	    
	    
    def test_get_all_meals(self):
        jsonAPIExpMeal1 = "{\"_id\": \"111111111111111111111111\",\"town\": \"Santiago\",\"admin\":{\"_id\": \"111111111111111111111111\",\"picture\": {\"data\": {\"url\": \"https://scontent.xx.fbcdn.net/v/t1.0-1/c118.328.304.304/s50x50/13876126_103197600128021_307111277992761230_n.jpg?oh=334ce0ee3ef6001a6c984fb21531d364&oe=58568A30\",\"is_silhouette\": false}},\"first_name\": \"Jennifer\",\"last_name\": \"TestosUser\",\"gender\": \"female\"},\"menu\": \"Jolie piece de boeuf\",\"price\": 100,\"nbGuests\": 10,\"nbRemainingPlaces\": 9,\"veggies\": false,\"time\": \"2016-11-20T17:00:00.000Z\",\"addressApprox\": \"Métro Anvers L2\",\"detailedInfo\": {\"requiredGuests\": {\"hosts\": {\"price\":5.05},\"cooks\":{\"nbRquCooks\":2,\"nbRemainingPlaces\":2,\"timeCooking\":\"2016-07-13T18:00:39.303Z\",\"price\":6.7},\"cleaners\":{\"nbRquCleaners\":1,\"nbRemainingPlaces\":1,\"price\":6.7},\"simpleGuests\":{\"nbRquSimpleGuests\":6,\"nbRemainingPlaces\":6,\"price\":12.55}}}}"
        resp = self.test_client.get("/api/meals",headers = {'Authorization': 'Bearer {0}'.format(self.adminUser.token()),'Content-Type':'application/json'})
        self.assertEqual("200 OK", resp.status)
        resp = self.rmAddFieldsList(json.loads(resp.data))
        expOutcome1 = json.loads(jsonAPIExpMeal1)
        self.assertEqual(2, len(resp))
        self.assertEquals(resp[0],expOutcome1)
        
    def test_get_detailed_info_subscribed(self):
        jsonAPIExpMeal1 = "{\"_id\": \"111111111111111111111111\",\"town\": \"Santiago\",\"admin\":{\"_id\": \"111111111111111111111111\",\"picture\": {\"data\": {\"url\": \"https://scontent.xx.fbcdn.net/v/t1.0-1/c118.328.304.304/s50x50/13876126_103197600128021_307111277992761230_n.jpg?oh=334ce0ee3ef6001a6c984fb21531d364&oe=58568A30\",\"is_silhouette\": false}},\"first_name\": \"Jennifer\",\"last_name\": \"TestosUser\",\"gender\": \"female\"},\"menu\": \"Jolie piece de boeuf\",\"price\": 100,\"detailedInfo\": {\"subscribed\":true,\"requiredGuests\": {\"hosts\": {\"price\":5.05},\"cooks\":{\"nbRquCooks\":2,\"nbRemainingPlaces\":2,\"timeCooking\":\"2016-07-13T18:00:39.303Z\",\"price\":6.7},\"cleaners\":{\"nbRquCleaners\":1,\"nbRemainingPlaces\":1,\"price\":6.7},\"simpleGuests\":{\"nbRquSimpleGuests\":6,\"nbRemainingPlaces\":6,\"price\":12.55}}},\"nbGuests\": 10,\"nbRemainingPlaces\": 9,\"veggies\": false,\"time\": \"2016-11-20T17:00:00.000Z\",\"addressApprox\": \"Métro Anvers L2\"}"
        resp = self.test_client.get("/api/meals/111111111111111111111111",headers = {'Authorization': 'Bearer {0}'.format(self.adminUser.token()),'Content-Type':'application/json'})
        self.assertEqual("200 OK", resp.status)
        resp = self.rmAddFieldsItem(json.loads(resp.data))
        expected = json.loads(jsonAPIExpMeal1)
        self.assertEquals(resp,expected)
    
    def test_get_detailed_info_unsubscribed(self):
        jsonAPIExpMeal1 = "{\"_id\": \"111111111111111111111111\",\"town\": \"Santiago\",\"admin\":{\"_id\": \"111111111111111111111111\",\"picture\": {\"data\": {\"url\": \"https://scontent.xx.fbcdn.net/v/t1.0-1/c118.328.304.304/s50x50/13876126_103197600128021_307111277992761230_n.jpg?oh=334ce0ee3ef6001a6c984fb21531d364&oe=58568A30\",\"is_silhouette\": false}},\"first_name\": \"Jennifer\",\"last_name\": \"TestosUser\",\"gender\": \"female\"},\"menu\": \"Jolie piece de boeuf\",\"price\": 100,\"detailedInfo\": {\"subscribed\":false,\"requiredGuests\": {\"hosts\": {\"price\":5.05},\"cooks\":{\"nbRquCooks\":2,\"nbRemainingPlaces\":2,\"timeCooking\":\"2016-07-13T18:00:39.303Z\",\"price\":6.7},\"cleaners\":{\"nbRquCleaners\":1,\"nbRemainingPlaces\":1,\"price\":6.7},\"simpleGuests\":{\"nbRquSimpleGuests\":6,\"nbRemainingPlaces\":6,\"price\":12.55}}},\"nbGuests\": 10,\"nbRemainingPlaces\": 9,\"veggies\": false,\"time\": \"2016-11-20T17:00:00.000Z\",\"addressApprox\": \"Métro Anvers L2\"}"
        resp = self.test_client.get("/api/meals/111111111111111111111111",headers = {'Authorization': 'Bearer {0}'.format(self.otherUser.token()),'Content-Type':'application/json'})
        self.assertEqual("200 OK", resp.status)
        resp = self.rmAddFieldsItem(json.loads(resp.data))
        expected = json.loads(jsonAPIExpMeal1)
        self.assertEquals(resp,expected)

    def test_subscribe_meal_ok(self):
        jsonRequestData = "{\"requestRole\": \"cook\"}"
        resp = self.test_client.post("/api/meals/111111111111111111111111/subscription", data=jsonRequestData, headers = {'Authorization': 'Bearer {0}'.format(self.otherUser.token()),'Content-Type':'application/json'})
        self.assertEqual("200 OK", resp.status)
        testMeal = loads(open('../testData/meals_testData.json').read())[0]
        testMeal["detailedInfo"]["requiredGuests"]["cooks"]["nbRemainingPlaces"] = testMeal["detailedInfo"]["requiredGuests"]["cooks"]["nbRemainingPlaces"] -1
        testMeal["nbRemainingPlaces"] = testMeal["nbRemainingPlaces"] -1 
        testMeal["privateInfo"]["users"].append ({"_id": ObjectId("111111111111111111111112"),"role": ["cook"]}) 
        dbMeal = self.db.meals.find_one({"_id":ObjectId("111111111111111111111111")})
        self.assertEqual(dbMeal, testMeal)

    def test_subscribe_meal_UserSubscribed(self):
        jsonRequestData = "{\"requestRole\": \"cook\"}"
        resp = self.test_client.post("/api/meals/111111111111111111111111/subscription", data=jsonRequestData, headers = {'Authorization': 'Bearer {0}'.format(self.adminUser.token()),'Content-Type':'application/json'})
        self.assertEqual("400 BAD REQUEST", resp.status)
        self.assertEqual("User already registered", resp.data)

    def test_subscribe_meal_fullRole(self):
        jsonRequestData = "{\"requestRole\": \"cook\"}"
        resp = self.test_client.post("/api/meals/111111111111111111111112/subscription", data=jsonRequestData, headers = {'Authorization': 'Bearer {0}'.format(self.otherUser.token()),'Content-Type':'application/json'})
        self.assertEqual("400 BAD REQUEST", resp.status)
        self.assertEqual("Role is full", resp.data)
            
    def test_subscribe_meal_fullMeal(self):
        jsonRequestData = "{\"requestRole\": \"cook\"}"
        self.db.meals.insert(loads(open('../testData/meals_testData.json').read())[2])
        resp = self.test_client.post("/api/meals/111111111111111111111113/subscription", data=jsonRequestData, headers = {'Authorization': 'Bearer {0}'.format(self.otherUser.token()),'Content-Type':'application/json'})
        self.assertEqual("400 BAD REQUEST", resp.status)
        self.assertEqual("Meal is full", resp.data)
        
    def test_unsubscribe_meal_ok(self):
        resp = self.test_client.post("/api/meals/111111111111111111111112/unsubscription", headers = {'Authorization': 'Bearer {0}'.format(self.otherUser.token()),'Content-Type':'application/json'})
        self.assertEqual("200 OK", resp.status)
        testMeal = loads(open('../testData/meals_testData.json').read())[1]
        testMeal["detailedInfo"]["requiredGuests"]["simpleGuests"]["nbRemainingPlaces"] +=  1
        testMeal["nbRemainingPlaces"] += 1 
        testMeal["privateInfo"]["users"].remove ({"_id": ObjectId("111111111111111111111112"),"role": ["simpleGuest"]}) 
        dbMeal = self.db.meals.find_one({"_id":ObjectId("111111111111111111111112")})
        self.assertEqual(dbMeal, testMeal)

    def test_unsubscribe_meal_unsubscribed_user(self):
        resp = self.test_client.post("/api/meals/111111111111111111111111/unsubscription", headers = {'Authorization': 'Bearer {0}'.format(self.otherUser.token()),'Content-Type':'application/json'})
        self.assertEqual("403 FORBIDDEN", resp.status)
        self.assertEqual("User isn't subscribed", resp.data)
        
    def test_unsubscribe_meal_admin(self):
        resp = self.test_client.post("/api/meals/111111111111111111111112/unsubscription", headers = {'Authorization': 'Bearer {0}'.format(self.adminUser.token()),'Content-Type':'application/json'})
        self.assertEqual("400 BAD REQUEST", resp.status)
        self.assertEqual("Meal's admin cannot unsubscribe", resp.data)
        
    def test_get_all_my_meals(self):
        jsonAPIExpMeal1 = "{\"_id\": \"111111111111111111111112\",\"town\": \"Santiago\",\"admin\":{\"_id\": \"111111111111111111111111\",\"picture\": {\"data\": {\"url\": \"https://scontent.xx.fbcdn.net/v/t1.0-1/c118.328.304.304/s50x50/13876126_103197600128021_307111277992761230_n.jpg?oh=334ce0ee3ef6001a6c984fb21531d364&oe=58568A30\",\"is_silhouette\": false}},\"first_name\": \"Jennifer\",\"last_name\": \"TestosUser\",\"gender\": \"female\"},\"menu\": \"Soupions de légumes avec cassolette de veau\",\"price\": 60,\"nbGuests\": 11,\"nbRemainingPlaces\": 8,\"veggies\": false,\"time\": \"2017-12-20T17:00:00.000Z\",\"addressApprox\": \"Métro Blanche L2\",\"detailedInfo\": {\"requiredGuests\": {\"hosts\": {\"price\":0},\"cooks\": {\"nbRemainingPlaces\": 0,\"nbRquCooks\": 1,\"price\":0},\"simpleGuests\": {\"nbRemainingPlaces\": 8,\"nbRquSimpleGuests\": 9,\"price\":6.7}}},\"privateInfo\":{\"adminPhone\":\"0601020304\",\"address\":\"3 impasse marie - blanche 75018\",\"users\": [{\"_id\": \"111111111111111111111111\",\"role\": [\"admin\"]},{\"_id\": \"111111111111111111111112\",\"role\": [\"simpleGuest\"]}]}}"
        resp = self.test_client.get("/api/meals/private",headers = {'Authorization': 'Bearer {0}'.format(self.otherUser.token()),'Content-Type':'application/json'})
        self.assertEqual("200 OK", resp.status)
        resp = self.rmAddFieldsList(json.loads(resp.data))
        expOutcome1 = json.loads(jsonAPIExpMeal1)
        self.assertEqual(1, len(resp))
        self.assertEquals(resp[0],expOutcome1)
        
    def test_get_meal_private_info_subscribed(self):
        jsonAPIExpMeal1 = "{\"_id\": \"111111111111111111111112\",\"town\": \"Santiago\",\"admin\":{\"_id\": \"111111111111111111111111\",\"picture\": {\"data\": {\"url\": \"https://scontent.xx.fbcdn.net/v/t1.0-1/c118.328.304.304/s50x50/13876126_103197600128021_307111277992761230_n.jpg?oh=334ce0ee3ef6001a6c984fb21531d364&oe=58568A30\",\"is_silhouette\": false}},\"first_name\": \"Jennifer\",\"last_name\": \"TestosUser\",\"gender\": \"female\"},\"menu\": \"Soupions de légumes avec cassolette de veau\",\"price\": 60,\"nbGuests\": 11,\"nbRemainingPlaces\": 8,\"veggies\": false,\"time\": \"2017-12-20T17:00:00.000Z\",\"addressApprox\": \"Métro Blanche L2\",\"detailedInfo\": {\"requiredGuests\": {\"hosts\": {\"price\":0},\"cooks\": {\"nbRemainingPlaces\": 0,\"nbRquCooks\": 1,\"price\":0},\"simpleGuests\": {\"nbRemainingPlaces\": 8,\"nbRquSimpleGuests\": 9,\"price\":6.7}}},\"privateInfo\":{\"adminPhone\":\"0601020304\",\"address\":\"3 impasse marie - blanche 75018\",\"users\": [{\"_id\": \"111111111111111111111111\",\"picture\": {\"data\": {\"url\": \"https://scontent.xx.fbcdn.net/v/t1.0-1/c118.328.304.304/s50x50/13876126_103197600128021_307111277992761230_n.jpg?oh=334ce0ee3ef6001a6c984fb21531d364&oe=58568A30\",\"is_silhouette\": false}},\"first_name\": \"Jennifer\",\"last_name\": \"TestosUser\",\"gender\": \"female\",\"role\": [\"admin\"]},{\"_id\": \"111111111111111111111112\",\"picture\": {\"data\": {\"url\": \"https://scontent.xx.fbcdn.net/v/t1.0-1/c8.0.50.50/p50x50/14203198_138331519950308_2376614838371002464_n.jpg?oh=466312d02a6f5cd78bbe664e7831e17d&oe=58487B54\",\"is_silhouette\": false}},\"first_name\": \"Dorothy\",\"last_name\": \"TestUser\",\"gender\": \"female\",\"role\": [\"simpleGuest\"]}]}}"
        resp = self.test_client.get("/api/meals/private/111111111111111111111112",headers = {'Authorization': 'Bearer {0}'.format(self.adminUser.token()),'Content-Type':'application/json'})
        self.assertEqual("200 OK", resp.status)
        resp = self.rmAddFieldsItem(json.loads(resp.data))
        expected = json.loads(jsonAPIExpMeal1)
        self.assertEquals(resp,expected)
        
    def test_get_meal_private_info_unsubscribed(self):
        resp = self.test_client.get("/api/meals/private/111111111111111111111111",headers = {'Authorization': 'Bearer {0}'.format(self.otherUser.token()),'Content-Type':'application/json'})
        self.assertEqual("404 NOT FOUND", resp.status)
        
    def test_delete_meal_ok(self):
        resp = self.test_client.delete("/api/meals/private/111111111111111111111112",headers = {'Authorization': 'Bearer {0}'.format(self.adminUser.token()),'Content-Type':'application/json'})
        self.assertEqual("204 NO CONTENT", resp.status)
        meals = self.db.meals.find()
        self.assertEqual( 1,meals.count())
        self.assertEqual(ObjectId("111111111111111111111111"),meals[0]["_id"])
        
    def test_delete_meal_not_admin(self):
        resp = self.test_client.delete("/api/meals/private111111111111111111111112",headers = {'Authorization': 'Bearer {0}'.format(self.otherUser.token()),'Content-Type':'application/json'})
        self.assertEqual("404 NOT FOUND", resp.status)
        self.assertEqual( 2,self.db.meals.find().count())
        
    
if __name__ == '__main__':
    unittest.main()