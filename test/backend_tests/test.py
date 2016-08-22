# -*- coding: utf-8 -*-
import os
import sys
topdir = os.path.join(os.path.dirname(__file__), "../..")
sys.path.append(topdir)
import unittest
import json
import copy
from datetime import datetime
from pymongo import MongoClient
from bson import ObjectId, json_util
from bson.json_util import dumps,loads
from app.api import Application, User
from app import configure
import subprocess


class BasicAPITest(unittest.TestCase):
    def setUp(self):
        self.maxDiff = None
        Application.app.config['TESTING'] = True
        self.client = Application.app.test_client()
        mClient = MongoClient(Application.app.config['MONGOLAB_URI_TEST'])
        Application.db = mClient.get_default_database()
        Application.db.users.insert(loads(open('../testData/users_testData.json').read())[0])
        self.adminUser = User(_id="111111111111111111111111")

    def tearDown(self):
        Application.db.meals.delete_many({})
        Application.db.users.delete_many({})

    def test_unauthentificatedUser(self):
        resp = self.client.post("/api/meals", data="{\"super\":\"toto\"}")
        self.assertEqual("401 UNAUTHORIZED", resp.status)

    def test_insert_meal(self):
        jsonRequestData = "{\"town\": \"Santiago\",\"menu\": \"Jolie piece de boeuf\",\"price\": 100,\"detailedInfo\": {\"requiredGuests\": {\"cooks\":{\"nbRquCooks\":2,\"timeCooking\":\"2016-07-13T18:00:39.303Z\"},\"cleaners\":{\"nbRquCleaners\":1}}},\"privateInfo\" :{\"address\": \"30 avenue de Trudaine 75009\"},\"nbGuests\": 10,\"veggies\": false,\"time\": \"2016-11-20T17:00:00.000Z\",\"addressApprox\": \"Métro Anvers L2\"}"
        resp = self.client.post("/api/meals", data=jsonRequestData, headers = {'Authorization': 'Bearer {0}'.format(self.adminUser.token())})
        self.assertEqual("200 OK", resp.status)
        dbMeal = Application.db.meals.find_one()
        self.assertEqual(json.dumps(Application.preprocess_id(dbMeal),default=json_util.default), resp.data)
        testMeal = loads(open('../testData/meals_testData.json').read())[0]
        testMeal["_id"]= dbMeal["_id"]
        testMeal["creationDate"] = dbMeal["creationDate"]
        self.assertEqual(dbMeal, testMeal)
    
    def test_insert_meal_without_helpers (self):
        jsonRequestData = "{\"town\": \"Santiago\",\"menu\": \"Soupions de légumes avec cassolette de veau\",\"price\": 60,\"detailedInfo\": {\"requiredGuests\": {}},\"privateInfo\" :{\"address\": \"3 impasse marie - blanche 75018\"},\"nbGuests\": 10,\"veggies\": false,\"time\": \"2017-12-20T17:00:00.000Z\",\"addressApprox\": \"Métro Blanche L2\"}"
        resp = self.client.post("/api/meals", data=jsonRequestData, headers = {'Authorization': 'Bearer {0}'.format(self.adminUser.token())})
        dbMeal = Application.db.meals.find_one()
        testMeal = loads(open('../testData/meals_testData.json').read())[1]
        testMeal["_id"]= dbMeal["_id"]
        testMeal["creationDate"] = dbMeal["creationDate"]
        self.assertEqual(dbMeal, testMeal)

    def test_insert_empty_meal(self):
        resp = self.client.post("/api/meals",data="",headers = {'Authorization': 'Bearer {0}'.format(self.adminUser.token())})
        self.assertEqual("", resp.data)
        self.assertEqual(0,Application.db.meals.count())

class TestAuthMealAPI(unittest.TestCase):

    def setUp(self):
        self.maxDiff = None
        Application.app.config['TESTING'] = True
        self.client = Application.app.test_client()
        mClient = MongoClient(Application.app.config['MONGOLAB_URI_TEST'])
        Application.db = mClient.get_default_database()
        Application.db.meals.insert(loads(open('../testData/meals_testData.json').read())[0])
        Application.db.meals.insert(loads(open('../testData/meals_testData.json').read())[1])
        Application.db.users.insert(loads(open('../testData/users_testData.json').read())[0])
        self.adminUser = User(_id="111111111111111111111111")
        self.otherUser = User(_id="111111111111111111111112")

    def tearDown(self):
        Application.db.meals.delete_many({})
        Application.db.users.delete_many({})
        
    def test_get_all_meals(self):
        jsonAPIExpMeal1 = "{\"_id\": \"111111111111111111111111\",\"town\": \"Santiago\",\"admin\":{\"_id\": \"111111111111111111111111\",\"picture\": {\"data\": {\"url\": \"https://scontent.xx.fbcdn.net/v/t1.0-1/c118.328.304.304/s50x50/13876126_103197600128021_307111277992761230_n.jpg?oh=334ce0ee3ef6001a6c984fb21531d364&oe=58568A30\",\"is_silhouette\": false}},\"first_name\": \"Jennifer\",\"last_name\": \"TestosUser\",\"gender\": \"female\"},\"menu\": \"Jolie piece de boeuf\",\"price\": 100,\"nbGuests\": 10,\"nbRemainingPlaces\": 9,\"veggies\": false,\"time\": \"2016-11-20T17:00:00.000Z\",\"addressApprox\": \"Métro Anvers L2\"}"
        jsonAPIExpMeal2 = "{\"_id\": \"111111111111111111111112\",\"town\": \"Santiago\",\"admin\":{\"_id\": \"111111111111111111111111\",\"picture\": {\"data\": {\"url\": \"https://scontent.xx.fbcdn.net/v/t1.0-1/c118.328.304.304/s50x50/13876126_103197600128021_307111277992761230_n.jpg?oh=334ce0ee3ef6001a6c984fb21531d364&oe=58568A30\",\"is_silhouette\": false}},\"first_name\": \"Jennifer\",\"last_name\": \"TestosUser\",\"gender\": \"female\"},\"menu\": \"Soupions de légumes avec cassolette de veau\",\"price\": 60,\"nbGuests\": 10,\"nbRemainingPlaces\": 9,\"veggies\": false,\"time\": \"2017-12-20T17:00:00.000Z\",\"addressApprox\": \"Métro Blanche L2\"}"
        resp = self.client.get("/api/meals",headers = {'Authorization': 'Bearer {0}'.format(self.adminUser.token())})
        self.assertEqual("200 OK", resp.status)
        resp = json.loads(resp.data)
        expOutcome1 = json.loads(jsonAPIExpMeal1)
        expOutcome2 = json.loads(jsonAPIExpMeal2)
        self.assertEqual(2, len(resp))
        self.assertEquals(resp[0],expOutcome1)
        self.assertEquals(resp[1],expOutcome2)
        

    def test_get_detailed_info(self):
        jsonAPIExpMeal1 = "{\"_id\": \"111111111111111111111111\",\"town\": \"Santiago\",\"admin\":{\"_id\": \"111111111111111111111111\",\"picture\": {\"data\": {\"url\": \"https://scontent.xx.fbcdn.net/v/t1.0-1/c118.328.304.304/s50x50/13876126_103197600128021_307111277992761230_n.jpg?oh=334ce0ee3ef6001a6c984fb21531d364&oe=58568A30\",\"is_silhouette\": false}},\"first_name\": \"Jennifer\",\"last_name\": \"TestosUser\",\"gender\": \"female\"},\"menu\": \"Jolie piece de boeuf\",\"price\": 100,\"detailedInfo\": {\"requiredGuests\": {\"cooks\":{\"nbRquCooks\":3,\"nbRemainingPlaces\":2,\"timeCooking\":\"2016-07-13T18:00:39.303Z\",\"price\":10},\"cleaners\":{\"nbRquCleaners\":1,\"nbRemainingPlaces\":1,\"price\":10},\"simpleGuests\":{\"nbRquSimpleGuests\":6,\"nbRemainingPlaces\":6,\"price\":10}}},\"nbGuests\": 10,\"nbRemainingPlaces\": 9,\"veggies\": false,\"time\": \"2016-11-20T17:00:00.000Z\",\"addressApprox\": \"Métro Anvers L2\"}"
        resp = self.client.get("/api/meal/111111111111111111111111",headers = {'Authorization': 'Bearer {0}'.format(self.adminUser.token())})
        self.assertEqual("200 OK", resp.status)
        resp = json.loads(resp.data)
        expected = json.loads(jsonAPIExpMeal1)
        self.assertEquals(resp,expected)
        
        
    def test_subscribe_meal_ok(self):
        jsonRequestData = "{\"requestRole\": \"cook\"}"
        resp = self.client.post("/api/meal/111111111111111111111111/subscription", data=jsonRequestData, headers = {'Authorization': 'Bearer {0}'.format(self.otherUser.token())})
        self.assertEqual("200 OK", resp.status)
        testMeal = loads(open('../testData/meals_testData.json').read())[0]
        testMeal["detailedInfo"]["requiredGuests"]["cooks"]["nbRemainingPlaces"] = testMeal["detailedInfo"]["requiredGuests"]["cooks"]["nbRemainingPlaces"] -1
        testMeal["nbRemainingPlaces"] = testMeal["nbRemainingPlaces"] -1 
        testMeal["privateInfo"]["users"].append ({u'_id': u'111111111111111111111112',u'role': [u'cook']}) 
        dbMeal = Application.db.meals.find_one({"_id":ObjectId("111111111111111111111111")})
        self.assertEqual(dbMeal, testMeal)
        
    def test_subscribe_meal_UserSubscribed(self):
        jsonRequestData = "{\"requestRole\": \"cook\"}"
        resp = self.client.post("/api/meal/111111111111111111111111/subscription", data=jsonRequestData, headers = {'Authorization': 'Bearer {0}'.format(self.adminUser.token())})
        self.assertEqual("400 BAD REQUEST", resp.status)
        self.assertEqual("User already registered", resp.data)
    

    def test_subscribe_meal_fullRole(self):
        jsonRequestData = "{\"requestRole\": \"cook\"}"
        resp = self.client.post("/api/meal/111111111111111111111112/subscription", data=jsonRequestData, headers = {'Authorization': 'Bearer {0}'.format(self.otherUser.token())})
        self.assertEqual("400 BAD REQUEST", resp.status)
        self.assertEqual("Role is full", resp.data)
            
    def test_subscribe_meal_fullMeal(self):
        jsonRequestData = "{\"requestRole\": \"cook\"}"
        Application.db.meals.insert(loads(open('../testData/meals_testData.json').read())[2])
        resp = self.client.post("/api/meal/111111111111111111111113/subscription", data=jsonRequestData, headers = {'Authorization': 'Bearer {0}'.format(self.otherUser.token())})
        self.assertEqual("400 BAD REQUEST", resp.status)
        self.assertEqual("Meal is full", resp.data)
            
    def test_subscribe_meal_badRequest1(self):
        jsonRequestData = "{\"test\": \"cook\"}"
        resp = self.client.post("/api/meal/111111111111111111111112/subscription", data=jsonRequestData, headers = {'Authorization': 'Bearer {0}'.format(self.otherUser.token())})
        self.assertEqual("400 BAD REQUEST", resp.status)
        
        
    def test_subscribe_meal_badRequest2(self):
        jsonRequestData = "{\"requestRole\": \"cookies\"}"
        resp = self.client.post("/api/meal/111111111111111111111112/subscription", data=jsonRequestData, headers = {'Authorization': 'Bearer {0}'.format(self.otherUser.token())})
        self.assertEqual("400 BAD REQUEST", resp.status)
        
    #def test_delete_one_meal(self):
    #    Application.db.meals.insert({"test_remove": "test"})
    #    me =Application.db.meals.find_one()
    #    resp1 = self.client.delete("/api/meal/"+ str(me['_id']))
    #    self.assertEqual("200 OK", resp1.status)
    #    self.assertEqual(resp1.data, '1 meal deleted')
    #    self.assertEqual(None, Application.db.meals.find_one())
    #    #When the meal don't exist
    #    Application.db.meals.insert(me)
    #    me2 =copy.copy(me)
    #    me2['_id']=ObjectId(str(me['_id'])[:-3]+'123')
    #    resp2 = self.client.delete("/api/meal/"+str(me2['_id']))
    #    self.assertEqual("202 ACCEPTED", resp2.status)
    #    self.assertEqual(resp2.data, '0 meal deleted')
    #    self.assertEqual(me, Application.db.meals.find_one())

    #def test_update_one_partial_meal_withoutid(self):
    #    Application.db.meals.insert({"test_update": "test"})
    #    me =Application.db.meals.find_one()
    #    resp1 = self.client.put("/api/meal/"+str(me['_id']),data="{\"test_update\":\"toto\"}")
    #    me2 = Application.db.meals.find_one()
    ##    me['test_update']="toto"
    #    self.assertEqual(me2,me)
    #    self.assertEqual("200 OK", resp1.status)
    #    self.assertEqual(resp1.data, '1 meals modified')

    #def test_update_one_meal_withid(self):
    #    Application.db.meals.insert({"test_update": "test","test_toto": "toto"})
    #    me =Application.db.meals.find_one()
    #    me['test_toto']="koukou"
    #    me3= copy.copy(me)
    #    me3['_id']=str(me3['_id'])
    #    resp1 = self.client.put("/api/meal/"+str(me['_id']),data=json.dumps(me3))
    #    me2 = Application.db.meals.find_one()
    #    self.assertEqual(me2,me)
    #    self.assertEqual("200 OK", resp1.status)
    #    self.assertEqual(resp1.data, '1 meals modified')

    #def test_update_one_meal_that_dont_exist(self):
    #    Application.db.meals.insert({"test_update": "test"})
    #    me =Application.db.meals.find_one()
    #    me2 =copy.copy(me)
    #    me2['_id']=ObjectId(str(me['_id'])[:-3]+'123')
    #    resp2 = self.client.put("/api/meal/"+str(me2['_id']),data="{\"test_update\":\"toto22\"}")
    #    self.assertEqual("202 ACCEPTED", resp2.status)
    #    self.assertEqual(resp2.data, '0 meals modified')
    #    self.assertEqual(me, Application.db.meals.find_one())
    #    self.assertEqual(None, Application.db.meals.find_one({"_id":me2['_id']}))

    #def test_update_one_meal_with_nodata(self):
    #    Application.db.meals.insert({"test_update": "test"})
    #    me =Application.db.meals.find_one()
    #    resp3 = self.client.put("/api/meal/"+str(me['_id']),data="")
    #    self.assertEqual("202 ACCEPTED", resp3.status)
    #    self.assertEqual(resp3.data, '0 meals modified')
    #    self.assertEqual(me, Application.db.meals.find_one())

if __name__ == '__main__':
    unittest.main()
