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



MONGOLAB_URI_TEST = 'mongodb://dkohn:SharEat3santiago@ds135700.mlab.com:35700/mycommuneaty_dev_test'

class BasicAPITest(TestCase):
    
    def setUp(self):
	    self.maxDiff = None
	    self.app = Application.app
	    self.app.config['TESTING'] = True
	    self.app.config['DEBUG'] = True
	    self.app.config['MONGO_URI']=  MONGOLAB_URI_TEST
	    self.db = MongoClient(MONGOLAB_URI_TEST).get_default_database()
	    with self.app.test_client() as c:
	        self.test_client = c
            with c.session_transaction() as sess:
                sess['user_id'] = '111111111111111111111111'
    # once this is reached the session was stored
		
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
        
    def test_logout(self):
        rv = self.test_client.get("/auth/logout")
        assert b'You were logged out' in rv.data
	    
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
	    jsonRequestData = "{\"menu\":{\"title\": \"Jolie piece de boeuf\"},\"price\": 100,\"automaticSubscription\": true,\"detailedInfo\": {\"requiredGuests\": {\"cooks\":{\"nbRquCooks\":2,\"timeCooking\":\"2016-07-13T18:00:39.303Z\"},\"cleaners\":{\"nbRquCleaners\":1},\"simpleGuests\":{\"nbRquSimpleGuests\":6} }},\"privateInfo\" :{\"address\":{\"name\": \"30 avenue de Trudaine\",\"lat\": 48.88092409999999,\"lng\": 2.34052829999996}},\"address\": {\"country_code\": \"FR\",\"lat\": 48.881,\"lng\": 2.341,\"postalCode\": \"75009\",\"town\": \"Paris\"},\"veggies\": false,\"time\": \"2016-11-20T17:00:00.000Z\"}"
	    resp = self.test_client.post("/api/meals", data=jsonRequestData, headers = {'Authorization': 'Bearer {0}'.format(self.adminUser.token()),'Content-Type':'application/json'})
	    self.assertEqual("201 CREATED", resp.status)
	    dbMeal = self.db.meals.find_one()
	    self.rmAddFieldsItem(dbMeal)
	    testMeal = loads(open('../testData/meals_testData.json').read())[0]
	    testMeal["_id"]= dbMeal["_id"]
	    testMeal["_etag"]= dbMeal["_etag"]
	    self.assertEqual(dbMeal, testMeal)
	    

class APITest2(BasicAPITest):
    def setUp(self):
        super(APITest2, self).setUp()
        self.db.meals.insert(loads(open('../testData/meals_testData.json').read())[0])
        self.db.meals.insert(loads(open('../testData/meals_testData.json').read())[1])
        self.db.meals.insert(loads(open('../testData/meals_testData.json').read())[6])
        self.db.meals.insert(loads(open('../testData/meals_testData.json').read())[7])
        self.db.users.insert(loads(open('../testData/users_testData.json').read())[0])
        self.db.users.insert(loads(open('../testData/users_testData.json').read())[1])
        self.db.users.insert(loads(open('../testData/users_testData.json').read())[2])
        self.adminUser = User(_id="111111111111111111111111")
        self.otherUser = User(_id="111111111111111111111112")
    
    def tearDown(self):
	    super(APITest2, self).tearDown()
	    
	    
    def test_get_all_meals(self):
        jsonAPIExpMeal1 = "{\"_id\": \"111111111111111111111111\",\"automaticSubscription\": true,\"address\": {\"country_code\": \"FR\",\"lat\": 48.881,\"lng\": 2.341,\"postalCode\": \"75009\",\"town\": \"Paris\"},\"admin\":{\"_id\": \"111111111111111111111111\",\"picture\": {\"data\": {\"url\": \"https://scontent.xx.fbcdn.net/v/t1.0-1/c118.328.304.304/s50x50/13876126_103197600128021_307111277992761230_n.jpg?oh=334ce0ee3ef6001a6c984fb21531d364&oe=58568A30\",\"is_silhouette\": false}},\"first_name\": \"Jennifer\",\"last_name\": \"TestosUser\",\"gender\": \"female\",\"facebook_id\": \"103194673461647\",\"link\": \"https://www.facebook.com/app_scoped_user_id/103194673461647/\"},\"menu\":{\"title\": \"Jolie piece de boeuf\"},\"price\": 100,\"nbGuests\": 10,\"nbRemainingPlaces\": 9,\"veggies\": false,\"time\": \"2016-11-20T17:00:00.000Z\",\"detailedInfo\": {\"subscribed\": true,\"pending\": false,\"requiredGuests\": {\"hosts\": {\"price\":5},\"cooks\":{\"nbRquCooks\":2,\"nbRemainingPlaces\":2,\"timeCooking\":\"2016-07-13T18:00:39.303Z\",\"price\":6.7},\"cleaners\":{\"nbRquCleaners\":1,\"nbRemainingPlaces\":1,\"price\":6.7},\"simpleGuests\":{\"nbRquSimpleGuests\":6,\"nbRemainingPlaces\":6,\"price\":12.5}}}}"
        resp = self.test_client.get("/api/meals",headers = {'Authorization': 'Bearer {0}'.format(self.adminUser.token()),'Content-Type':'application/json'})
        self.assertEqual("200 OK", resp.status)
        resp = self.rmAddFieldsList(json.loads(resp.data))
        expOutcome1 = json.loads(jsonAPIExpMeal1)
        expOutcome1["_etag"]= resp[0]["_etag"]
        self.assertEqual(4, len(resp))
        self.assertEquals(resp[0],expOutcome1)
        
    def test_get_detailed_info_subscribed(self):
        jsonAPIExpMeal1 = "{\"_id\": \"111111111111111111111111\",\"automaticSubscription\": true,\"address\": {\"country_code\": \"FR\",\"lat\": 48.881,\"lng\": 2.341,\"postalCode\": \"75009\",\"town\": \"Paris\"},\"admin\":{\"_id\": \"111111111111111111111111\",\"picture\": {\"data\": {\"url\": \"https://scontent.xx.fbcdn.net/v/t1.0-1/c118.328.304.304/s50x50/13876126_103197600128021_307111277992761230_n.jpg?oh=334ce0ee3ef6001a6c984fb21531d364&oe=58568A30\",\"is_silhouette\": false}},\"first_name\": \"Jennifer\",\"last_name\": \"TestosUser\",\"gender\": \"female\",\"facebook_id\": \"103194673461647\",\"link\": \"https://www.facebook.com/app_scoped_user_id/103194673461647/\"},\"menu\":{\"title\": \"Jolie piece de boeuf\"},\"price\": 100,\"detailedInfo\": {\"subscribed\":true,\"pending\": false,\"requiredGuests\": {\"hosts\": {\"price\":5},\"cooks\":{\"nbRquCooks\":2,\"nbRemainingPlaces\":2,\"timeCooking\":\"2016-07-13T18:00:39.303Z\",\"price\":6.7},\"cleaners\":{\"nbRquCleaners\":1,\"nbRemainingPlaces\":1,\"price\":6.7},\"simpleGuests\":{\"nbRquSimpleGuests\":6,\"nbRemainingPlaces\":6,\"price\":12.5}}},\"nbGuests\": 10,\"nbRemainingPlaces\": 9,\"veggies\": false,\"time\": \"2016-11-20T17:00:00.000Z\"}"
        resp = self.test_client.get("/api/meals/111111111111111111111111",headers = {'Authorization': 'Bearer {0}'.format(self.adminUser.token()),'Content-Type':'application/json'})
        self.assertEqual("200 OK", resp.status)
        resp = self.rmAddFieldsItem(json.loads(resp.data))
        expected = json.loads(jsonAPIExpMeal1)
        expected["_etag"]= resp["_etag"]
        self.assertEquals(resp,expected)
    
    def test_get_detailed_info_unsubscribed(self):
        jsonAPIExpMeal1 = "{\"_id\": \"111111111111111111111114\",\"automaticSubscription\": true,\"address\": {\"country_code\": \"FR\",\"lat\": 48.881,\"lng\": 2.341,\"postalCode\": \"75009\",\"town\": \"Paris\"},\"admin\":{\"_id\": \"5776d0824403f974b97caf89\",\"picture\": {\"data\": {\"url\": \"https://scontent.xx.fbcdn.net/v/t1.0-1/p50x50/12932942_10153478145582267_4139960179322221986_n.jpg?oh=c9e7b5856401d3dc61641aaf02dfb422&oe=5812FF92\",\"is_silhouette\": false}},\"first_name\": \"Kevin\",\"last_name\": \"Marteau\",\"gender\": \"male\",\"facebook_id\": \"10153280539797267\",\"link\": \"https://www.facebook.com/app_scoped_user_id/10153280539797267/\"},\"menu\":{\"title\": \"Jolie piece de boeuf\"},\"price\": 100,\"detailedInfo\": {\"subscribed\":false,\"pending\": false,\"requiredGuests\": {\"hosts\": {\"price\":5},\"cooks\":{\"nbRquCooks\":2,\"nbRemainingPlaces\":2,\"timeCooking\":\"2016-07-13T18:00:39.303Z\",\"price\":6.7},\"cleaners\":{\"nbRquCleaners\":1,\"nbRemainingPlaces\":1,\"price\":6.7},\"simpleGuests\":{\"nbRquSimpleGuests\":6,\"nbRemainingPlaces\":6,\"price\":12.5}}},\"nbGuests\": 10,\"nbRemainingPlaces\": 9,\"veggies\": false,\"time\": \"2016-11-20T17:00:00.000Z\"}"
        resp = self.test_client.get("/api/meals/111111111111111111111114",headers = {'Authorization': 'Bearer {0}'.format(self.adminUser.token()),'Content-Type':'application/json'})
        self.assertEqual("200 OK", resp.status)
        resp = self.rmAddFieldsItem(json.loads(resp.data))
        expected = json.loads(jsonAPIExpMeal1)
        expected["_etag"]= resp["_etag"]
        self.assertEquals(resp,expected)

    def test_subscribe_meal_ok(self):
        jsonRequestData = "{\"requestRole\": \"cook\"}"
        resp = self.test_client.post("/api/meals/111111111111111111111111/subscription", data=jsonRequestData, headers = {'Authorization': 'Bearer {0}'.format(self.otherUser.token()),'Content-Type':'application/json'})
        self.assertEqual("200 OK", resp.status)
        testMeal = loads(open('../testData/meals_testData.json').read())[0]
        testMeal["detailedInfo"]["requiredGuests"]["cooks"]["nbRemainingPlaces"] = testMeal["detailedInfo"]["requiredGuests"]["cooks"]["nbRemainingPlaces"] -1
        testMeal["nbRemainingPlaces"] = testMeal["nbRemainingPlaces"] -1 
        testMeal["privateInfo"]["users"].append ({"_id": ObjectId("111111111111111111111112"),"role": ["cook"],"status":"accepted"}) 
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
        testMeal["privateInfo"]["users"].remove ({"_id": ObjectId("111111111111111111111112"),"role": ["simpleGuest"],"status":"accepted"}) 
        dbMeal = self.db.meals.find_one({"_id":ObjectId("111111111111111111111112")})
        self.assertEqual(dbMeal, testMeal)

    def test_unsubscribe_meal_unsubscribed_user(self):
        resp = self.test_client.post("/api/meals/111111111111111111111111/unsubscription", headers = {'Authorization': 'Bearer {0}'.format(self.otherUser.token()),'Content-Type':'application/json'})
        self.assertEqual("403 FORBIDDEN", resp.status)
        self.assertEqual("User isn't subscribed", resp.data)
        
    def test_unsubscribe_meal_admin(self):
        resp = self.test_client.post("/api/meals/111111111111111111111112/unsubscription", headers = {'Authorization': 'Bearer {0}'.format(self.adminUser.token()),'Content-Type':'application/json'})
        self.assertEqual("401 UNAUTHORIZED", resp.status)
        self.assertEqual("Meal's admin cannot unsubscribe", resp.data)
        
    def test_get_all_my_meals(self):
        jsonAPIExpMeal1 = "{\"_id\": \"111111111111111111111112\",\"automaticSubscription\": true,\"admin\":{\"_id\": \"111111111111111111111111\",\"picture\": {\"data\": {\"url\": \"https://scontent.xx.fbcdn.net/v/t1.0-1/c118.328.304.304/s50x50/13876126_103197600128021_307111277992761230_n.jpg?oh=334ce0ee3ef6001a6c984fb21531d364&oe=58568A30\",\"is_silhouette\": false}},\"first_name\": \"Jennifer\",\"last_name\": \"TestosUser\",\"gender\": \"female\",\"facebook_id\": \"103194673461647\",\"link\": \"https://www.facebook.com/app_scoped_user_id/103194673461647/\"},\"menu\": {\"title\": \"Soupions de légumes avec cassolette de veau\"},\"price\": 60,\"nbGuests\": 11,\"nbRemainingPlaces\": 8,\"veggies\": false,\"time\": \"2017-12-20T17:00:00.000Z\",\"detailedInfo\": {\"pending\":false, \"requiredGuests\": {\"hosts\": {\"price\":0},\"cooks\": {\"nbRemainingPlaces\": 0,\"nbRquCooks\": 1,\"price\":0},\"simpleGuests\": {\"nbRemainingPlaces\": 8,\"nbRquSimpleGuests\": 9,\"price\":6.7}}},\"address\":{\"country_code\":\"FR\",\"lat\":48.886,\"lng\":2.333,\"postalCode\":\"75009\",\"town\":\"Paris\"},\"privateInfo\":{\"address\":{\"lat\":48.8856138,\"lng\":2.3328533999999763,\"name\":\"3 Impasse Marie Blanche\"},\"users\": [{\"_id\": \"111111111111111111111111\",\"role\": [\"admin\"],\"status\":\"accepted\"},{\"_id\": \"111111111111111111111112\",\"role\": [\"simpleGuest\"],\"status\":\"accepted\"}]}}"
        resp = self.test_client.get("/api/meals/private",headers = {'Authorization': 'Bearer {0}'.format(self.otherUser.token()),'Content-Type':'application/json'})
        self.assertEqual("200 OK", resp.status)
        resp = self.rmAddFieldsList(json.loads(resp.data))
        expOutcome1 = json.loads(jsonAPIExpMeal1)
        expOutcome1["_etag"]= resp[0]["_etag"]
        self.assertEqual(2, len(resp))
        self.assertEquals(resp[0],expOutcome1)
        
    def test_get_meal_private_info_subscribed(self):
        jsonAPIExpMeal1 = "{\"_id\": \"111111111111111111111112\",\"automaticSubscription\": true,\"admin\":{\"_id\": \"111111111111111111111111\",\"picture\": {\"data\": {\"url\": \"https://scontent.xx.fbcdn.net/v/t1.0-1/c118.328.304.304/s50x50/13876126_103197600128021_307111277992761230_n.jpg?oh=334ce0ee3ef6001a6c984fb21531d364&oe=58568A30\",\"is_silhouette\": false}},\"first_name\": \"Jennifer\",\"last_name\": \"TestosUser\",\"gender\": \"female\",\"facebook_id\": \"103194673461647\",\"link\": \"https://www.facebook.com/app_scoped_user_id/103194673461647/\"},\"menu\":{\"title\": \"Soupions de légumes avec cassolette de veau\"},\"price\": 60,\"nbGuests\": 11,\"nbRemainingPlaces\": 8,\"veggies\": false,\"time\": \"2017-12-20T17:00:00.000Z\",\"address\":{\"country_code\":\"FR\",\"lat\":48.886,\"lng\":2.333,\"postalCode\":\"75009\",\"town\":\"Paris\"},\"detailedInfo\": {\"requiredGuests\": {\"hosts\": {\"price\":0},\"cooks\": {\"nbRemainingPlaces\": 0,\"nbRquCooks\": 1,\"price\":0},\"simpleGuests\": {\"nbRemainingPlaces\": 8,\"nbRquSimpleGuests\": 9,\"price\":6.7}}},\"privateInfo\":{\"address\":{\"lat\":48.8856138,\"lng\":2.3328533999999763,\"name\":\"3 Impasse Marie Blanche\"},\"users\": [{\"_id\": \"111111111111111111111111\",\"picture\": {\"data\": {\"url\": \"https://scontent.xx.fbcdn.net/v/t1.0-1/c118.328.304.304/s50x50/13876126_103197600128021_307111277992761230_n.jpg?oh=334ce0ee3ef6001a6c984fb21531d364&oe=58568A30\",\"is_silhouette\": false}},\"first_name\": \"Jennifer\",\"last_name\": \"TestosUser\",\"gender\": \"female\",\"facebook_id\": \"103194673461647\",\"link\": \"https://www.facebook.com/app_scoped_user_id/103194673461647/\",\"role\": [\"admin\"],\"status\":\"accepted\",\"privateInfo\":{\"cellphone\": \"0601020304\"}},{\"_id\": \"111111111111111111111112\",\"picture\": {\"data\": {\"url\": \"https://scontent.xx.fbcdn.net/v/t1.0-1/c8.0.50.50/p50x50/14203198_138331519950308_2376614838371002464_n.jpg?oh=466312d02a6f5cd78bbe664e7831e17d&oe=58487B54\",\"is_silhouette\": false}},\"first_name\": \"Dorothy\",\"last_name\": \"TestUser\",\"gender\": \"female\",\"facebook_id\": \"114780772305383\",\"link\":\"https://www.facebook.com/app_scoped_user_id/114780772305383/\",\"role\": [\"simpleGuest\"],\"status\":\"accepted\",\"privateInfo\":{\"cellphone\": \"042685687\"}}]}}"
        resp = self.test_client.get("/api/meals/private/111111111111111111111112",headers = {'Authorization': 'Bearer {0}'.format(self.adminUser.token()),'Content-Type':'application/json'})
        self.assertEqual("200 OK", resp.status)
        resp = self.rmAddFieldsItem(json.loads(resp.data))
        expected = json.loads(jsonAPIExpMeal1)
        expected['_etag']=resp['_etag']
        self.assertEquals(resp,expected)
        
    def test_get_meal_private_info_unsubscribed(self):
        respget = self.test_client.get("/api/meals/private/111111111111111111111111",headers = {'Authorization': 'Bearer {0}'.format(self.adminUser.token()),'Content-Type':'application/json'})
        respget = self.rmAddFieldsItem(json.loads(respget.data))
        _etag = respget["_etag"]        
        resp = self.test_client.get("/api/meals/private/111111111111111111111111",headers = {'Authorization': 'Bearer {0}'.format(self.otherUser.token()),'If-Match':_etag,'Content-Type':'application/json'})
        self.assertEqual("404 NOT FOUND", resp.status)
        
    def test_delete_meal_ok(self):
        respget = self.test_client.get("/api/meals/private/111111111111111111111112",headers = {'Authorization': 'Bearer {0}'.format(self.adminUser.token()),'Content-Type':'application/json'})
        respget = self.rmAddFieldsItem(json.loads(respget.data))
        _etag = respget["_etag"]
        respDelete = self.test_client.delete("/api/meals/private/111111111111111111111112",headers = {'Authorization': 'Bearer {0}'.format(self.adminUser.token()),'If-Match': _etag,'Content-Type':'application/json'})
        self.assertEqual("204 NO CONTENT", respDelete.status)
        meals = self.db.meals.find()
        self.assertEqual( 3,meals.count())
        self.assertEqual(ObjectId("111111111111111111111111"),meals[0]["_id"])
        
    def test_delete_meal_not_admin(self):
        respget = self.test_client.get("/api/meals/private/111111111111111111111112",headers = {'Authorization': 'Bearer {0}'.format(self.otherUser.token()),'Content-Type':'application/json'})
        respget = self.rmAddFieldsItem(json.loads(respget.data))
        _etag = respget["_etag"]
        resp = self.test_client.delete("/api/meals/private/111111111111111111111112",headers = {'Authorization': 'Bearer {0}'.format(self.otherUser.token()),'If-Match':_etag,'Content-Type':'application/json'})
        self.assertEqual("404 NOT FOUND", resp.status)
        self.assertEqual( 4,self.db.meals.find().count())
        
    def test_get_private_user(self):
        resp = self.test_client.get("/api/users/private/111111111111111111111111", headers = {'Authorization': 'Bearer {0}'.format(self.adminUser.token()),'Content-Type':'application/json'})
        self.assertEqual("200 OK", resp.status)
    
    def test_update_current_user(self):
        respget = self.test_client.get("/api/users/private/111111111111111111111111",headers = {'Authorization': 'Bearer {0}'.format(self.adminUser.token()),'Content-Type':'application/json'})
        respget = self.rmAddFieldsItem(json.loads(respget.data))
        _etag = respget["_etag"]            
        jsonRequestData = "{\"privateInfo\": {\"cellphone\": \"0611515364\"}}"
        resp = self.test_client.patch("/api/users/private/111111111111111111111111", data=jsonRequestData, headers = {'Authorization': 'Bearer {0}'.format(self.adminUser.token()),'If-Match':_etag,'Content-Type':'application/json'})
        self.assertEqual("200 OK", resp.status)

    def test_update_not_current_user(self):
        respget = self.test_client.get("/api/users/private/111111111111111111111112",headers = {'Authorization': 'Bearer {0}'.format(self.adminUser.token()),'Content-Type':'application/json'})
        respget = self.rmAddFieldsItem(json.loads(respget.data))
        _etag = respget["_etag"]    
        jsonRequestData = "{\"privateInfo\": {\"cellphone\": \"0611515364\"}}"
        resp = self.test_client.patch("/api/users/private/111111111111111111111112", data=jsonRequestData, headers = {'Authorization': 'Bearer {0}'.format(self.otherUser.token()),'If-Match':_etag,'Content-Type':'application/json'})
        self.assertEqual("412 PRECONDITION FAILED", resp.status)
        
    def test_validate_a_subscription_when_meal_doesnt_exist(self): #un test qui vérifie que la validation ne peut se faire sur un repas qui n'existe pas
        jsonRequestData = "{\"validation_result\": \"true\"}"
        participant_id = "111111111111111111111111"
        meal_id = "112311111111111111111114"
        resp = self.test_client.post("/api/meals/"+ meal_id +"/subscription/validate/"+participant_id, data=jsonRequestData, headers = {'Authorization': 'Bearer {0}'.format(self.adminUser.token()),'Content-Type':'application/json'})
        self.assertEqual("404 NOT FOUND", resp.status)
        
    def test_validate_a_subscription_not_by_admin(self): #un test qui vérifie que si t'es pas admin tu peux pas valider un repas
        jsonRequestData = "{\"validation_result\": \"true\"}"
        participant_id = "111111111111111111111112"
        meal_id = "111111111111111111111114"
        resp = self.test_client.post("/api/meals/"+ meal_id +"/subscription/validate/"+participant_id, data=jsonRequestData, headers = {'Authorization': 'Bearer {0}'.format(self.adminUser.token()),'Content-Type':'application/json'}) #adminUser n'est pas l'admin du repas 1111111..4
        self.assertEqual("401 UNAUTHORIZED", resp.status)
        
    def test_validate_a_subscription_of_admin_by_admin(self): #un test qui vérifie que l'admin ne peut se valider lui même
        jsonRequestData = "{\"validation_result\": \"true\"}"
        participant_id = "111111111111111111111111"
        meal_id = "58f4183e3187971673aa4cb4"
        resp = self.test_client.post("/api/meals/"+ meal_id +"/subscription/validate/"+participant_id, data=jsonRequestData, headers = {'Authorization': 'Bearer {0}'.format(self.adminUser.token()),'Content-Type':'application/json'}) #adminUser n'est pas l'admin du repas 1111111..4
        self.assertEqual("400 BAD REQUEST", resp.status)
        
    def test_validate_a_subscription_without_validation_data(self): #un test qui vérifie que la validation n'a pas lieu si l'info n'est pas donnée en entrée
        jsonRequestData = "{\"validation_result\": \"None\"}"
        participant_id = "111111111111111111111112"
        meal_id = "58f4183e3187971673aa4cb4"
        resp = self.test_client.post("/api/meals/"+ meal_id +"/subscription/validate/"+participant_id, data=jsonRequestData, headers = {'Authorization': 'Bearer {0}'.format(self.adminUser.token()),'Content-Type':'application/json'}) #adminUser n'est pas l'admin du repas 1111111..4
        self.assertEqual("400 BAD REQUEST", resp.status)
        
    def test_validate_a_subscription_accepted(self): #un test qui vérifie la validation lorsque l'admin accepte l'utilisateur
        jsonRequestData = "{\"validation_result\": true}"
        participant_id = "111111111111111111111112"
        meal_id = "58f4183e3187971673aa4cb4"
        resp = self.test_client.post("/api/meals/"+ meal_id +"/subscription/validate/"+participant_id, data=jsonRequestData, headers = {'Authorization': 'Bearer {0}'.format(self.adminUser.token()),'Content-Type':'application/json'}) #adminUser n'est pas l'admin du repas 1111111..4
        self.assertEqual("200 OK", resp.status)
        
    def test_validate_a_subscription_refused(self): #un test qui vérifie la validation lorsque l'admin refuse l'utilisateur
        jsonRequestData = "{\"validation_result\": false}"
        participant_id = "111111111111111111111112"
        meal_id = "58f4183e3187971673aa4cb4"
        resp = self.test_client.post("/api/meals/"+ meal_id +"/subscription/validate/"+participant_id, data=jsonRequestData, headers = {'Authorization': 'Bearer {0}'.format(self.adminUser.token()),'Content-Type':'application/json'}) #adminUser n'est pas l'admin du repas 1111111..4
        self.assertEqual("200 OK", resp.status)
        
        
        
    
if __name__ == '__main__':
    unittest.main()