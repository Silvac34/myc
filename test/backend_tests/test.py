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
from bson.json_util import dumps
from app.api import Application, User
from app import configure
import subprocess



class TestData:
    def __init__(self):
        self.jsonNewMealData = "{\"town\": \"Santiago\",\"menu\": \"Soupions de légumes avec cassolette de veau\",\"price\": 60,\"detailedInfo\": {\"requiredHelpers\": []},\"privateInfo\" :{\"address\": \"3 impasse marie - blanche 75018\"},\"nbGuests\": 10,\"veggies\": false,\"time\": \"2017-12-20T17:00:00.000Z\",\"addressApprox\": \"Métro Blanche L2\"}"
        self.jsonNewMeal2Data = "{\"town\": \"Santiago\",\"menu\": \"Jolie piece de boeuf\",\"price\": 100,\"detailedInfo\": {\"requiredHelpers\": []},\"privateInfo\" :{\"address\": \"30 avenue de Trudaine 75009\"},\"nbGuests\": 10,\"veggies\": false,\"time\": \"2016-11-20T17:00:00.000Z\",\"addressApprox\": \"Métro Anvers L2\"}"
        self.adminUser = User(facebook_id ="0123456789")
        self.adminUser.updateUser({"privateInfo": {"facebook_id": "0123456789","link": "https://www.facebook.com/app_scoped_user_id/10153280539797267/","email": "maillet.kevin91@gmail.com"},"picture": {"data": {"url": "https://fbcdn-profile-a.akamaihd.net/hprofile-ak-xpf1/v/t1.0-1/p50x50/12932942_10153478145582267_4139960179322221986_n.jpg?oh=1663c10fca620aedc8299dcea27879ac&oe=57EB7292&__gda__=1480029556_7df38557083e1c3555bd90c18a76b529","is_silhouette": "false"}},"first_name": "Kevin","last_name": "Marteau","gender": "male"})
        #nouveau jeux de données, ancien à supprimer
        self.jsonMealDetailedData1 = "{\"_id\": \"111111111111111111111111\",\"town\": \"Santiago\",\"admin\":{\"_id\": \"111111111111111111111111\",\"picture\": {\"data\": {\"url\": \"https://fbcdn-profile-a.akamaihd.net/hprofile-ak-xpf1/v/t1.0-1/p50x50/12932942_10153478145582267_4139960179322221986_n.jpg?oh=1663c10fca620aedc8299dcea27879ac&oe=57EB7292&__gda__=1480029556_7df38557083e1c3555bd90c18a76b529\",\"is_silhouette\": \"false\"}},\"first_name\": \"Kevin\",\"last_name\": \"Marteau\",\"gender\": \"male\"},\"menu\": \"Jolie piece de boeuf\",\"price\": 100,\"detailedInfo\": {\"requiredHelpers\": []},\"nbGuests\": 10,\"veggies\": false,\"time\": \"2016-11-20T17:00:00.000Z\",\"addressApprox\": \"Métro Anvers L2\"}"
        

class BasicAPITest(unittest.TestCase):
    def setUp(self):
        Application.app.config['TESTING'] = True
        self.client = Application.app.test_client()
        mClient = MongoClient(Application.app.config['MONGOLAB_URI_TEST'])
        Application.db = mClient.get_default_database()

    def tearDown(self):
        Application.db.meals.delete_many({})
        Application.db.users.delete_many({})

    def test_unauthentificatedUser(self):
        resp = self.client.post("/api/meals", data="{\"super\":\"toto\"}")
        self.assertEqual("401 UNAUTHORIZED", resp.status)

    def test_insert_meal(self):
        resp = self.client.post("/api/meals", data=TestData().jsonNewMealData, headers = {'Authorization': 'Bearer {0}'.format(TestData().adminUser.token())})
        self.assertEqual("200 OK", resp.status)
        coucou = Application.db.meals.find_one()
        self.assertEqual(json.dumps(Application.preprocess_id(coucou),default=json_util.default), resp.data)
        mealID = str(coucou["_id"])
        cDate = coucou["creationDate"]
        testMeal = {u'town': u'Santiago',u'menu': u'Soupions de l\xe9gumes avec cassolette de veau',u'nbRemainingPlaces':9 ,u'price': 60, u'privateInfo': {u'address': u'3 impasse marie - blanche 75018'}, u'detailedInfo': {u'requiredHelpers': []}, u'nbGuests': 10, u'veggies': False, u'time': u'2017-12-20T17:00:00.000Z', u'addressApprox': u'M\xe9tro Blanche L2', u'_id': '577678e94403f954d69cbd04'}
        testMeal["_id"]= ObjectId(mealID)
        testMeal["admin"]= ObjectId(TestData().adminUser._id)
        testMeal["privateInfo"]["users"]=[{"_id":TestData().adminUser._id,"role":"admin"}]
        testMeal["creationDate"] = cDate
        self.assertItemsEqual(coucou, testMeal)

    def test_insert_empty_meal(self):
        resp = self.client.post("/api/meals",data="",headers = {'Authorization': 'Bearer {0}'.format(TestData().adminUser.token())})
        self.assertEqual("", resp.data)

class TestAuthManageMealAPI(unittest.TestCase):

    def setUp(self):
        self.maxDiff = None
        Application.app.config['TESTING'] = True
        self.client = Application.app.test_client()
        mClient = MongoClient(Application.app.config['MONGOLAB_URI_TEST'])
        Application.db = mClient.get_default_database()
        #put one meal in the database
        self.client.post("/api/meals", data=TestData().jsonNewMealData, headers = {'Authorization': 'Bearer {0}'.format(TestData().adminUser.token())})
        self.client.post("/api/meals", data=TestData().jsonNewMeal2Data, headers = {'Authorization': 'Bearer {0}'.format(TestData().adminUser.token())})

    def tearDown(self):
        Application.db.meals.delete_many({})
        Application.db.users.delete_many({})
        
    def test_get_all_meals(self):
        resp2 = self.client.get("/api/meals",headers = {'Authorization': 'Bearer {0}'.format(TestData().adminUser.token())})
        self.assertEqual("200 OK", resp2.status)
        resp2 = json.loads(resp2.data)
        #Define the outcome
        mealsT = Application.db.meals.find({},{"detailedInfo":0,"privateInfo":0})
        mealsAPITest = []
        for mealAPITest in mealsT:
            mealAPITest["admin"]= Application.preprocess_id(TestData().adminUser.getUserPublicInfo())
            mealsAPITest.append(mealAPITest)
        #Assert
        self.assertEqual(2, len(resp2))
        self.assertItemsEqual(resp2[0],Application.preprocess_id(mealsAPITest)[0])

class TestAuthMealAPI(unittest.TestCase):

    def setUp(self):
        self.maxDiff = None
        Application.app.config['TESTING'] = True
        self.client = Application.app.test_client()
        mClient = MongoClient(Application.app.config['MONGOLAB_URI_TEST'])
        Application.db = mClient.get_default_database()
        #populate the database with test data
        #subprocess.call(["mongoimport", "-h=ds055872.mlab.com:55872", "-d=shareat_dev_test","-c=meals", "-u=shareat", "-p=kmaillet230191","--file=../testData/meals_testData.json"])
        #subprocess.call(["mongoimport", "-h=ds055872.mlab.com:55872", "-d=shareat_dev_test","-c=users", "-u=shareat", "-p=kmaillet230191","--file=../testData/users_testData.json"])
        Application.db.meals.insert({"_id": ObjectId("111111111111111111111111"),"town": "Santiago","admin":"111111111111111111111111","menu": "Jolie piece de boeuf","price": 100,"detailedInfo": {"requiredHelpers": []},"privateInfo" :{"address": "30 avenue de Trudaine 75009"},"nbGuests": 10,"veggies": False ,"time": "2016-11-20T17:00:00.000Z","addressApprox": "Métro Anvers L2"})
        Application.db.meals.insert({"_id": ObjectId("111111111111111111111112"),"town": "Santiago","admin":"111111111111111111111111","menu": "Soupions de légumes avec cassolette de veau","price": 60,"detailedInfo": {"requiredHelpers": []},"privateInfo" :{"address": "3 impasse marie - blanche 75018"},"nbGuests": 10,"veggies": False,"time": "2017-12-20T17:00:00.000Z","addressApprox": "Métro Blanche L2"})
        Application.db.users.insert({"_id": ObjectId("111111111111111111111111"),"privateInfo": {"facebook_id": "0123456789","link": "https://www.facebook.com/app_scoped_user_id/10153280539797267/","email": "maillet.kevin91@gmail.com"},"picture": {"data": {"url": "https://fbcdn-profile-a.akamaihd.net/hprofile-ak-xpf1/v/t1.0-1/p50x50/12932942_10153478145582267_4139960179322221986_n.jpg?oh=1663c10fca620aedc8299dcea27879ac&oe=57EB7292&__gda__=1480029556_7df38557083e1c3555bd90c18a76b529","is_silhouette": "false"}},"first_name": "Kevin","last_name": "Marteau","gender": "male"})

    def tearDown(self):
        #Application.db.drop_collection('meals')
        #Application.db.drop_collection('users')
        Application.db.meals.delete_many({})
        Application.db.users.delete_many({})
        

    def test_get_detailed_info(self):
        resp = self.client.get("/api/meal/111111111111111111111111",headers = {'Authorization': 'Bearer {0}'.format(TestData().adminUser.token())})
        self.assertEqual("200 OK", resp.status)
        resp = json.loads(resp.data)
        expected = json.loads(TestData().jsonMealDetailedData1)
        self.assertItemsEqual(resp,expected)

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
