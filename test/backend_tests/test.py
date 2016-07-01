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


class BasicTest(unittest.TestCase):
    def setUp(self):
        Application.app.config['TESTING'] = True
        self.client = Application.app.test_client()
        client = MongoClient(Application.app.config['MONGOLAB_URI_TEST'])
        Application.db = client.get_default_database()

    def tearDown(self):
        Application.db.drop_collection('meals')
        Application.db.drop_collection('users')

    def test_unauthentificatedUser(self):
        resp = self.client.post("/api/meal", data="{\"super\":\"toto\"}")
        self.assertEqual("401 UNAUTHORIZED", resp.status)


class TestAuthentificatedAPI(unittest.TestCase):

    def setAuthToken(self):
        user = User(facebook_id ="0123456789")
        return user.token()

    def setUp(self):
        Application.app.config['TESTING'] = True
        self.client = Application.app.test_client()
        mClient = MongoClient(Application.app.config['MONGOLAB_URI_TEST'])
        Application.db = mClient.get_default_database()
        self.token = self.setAuthToken()
        self.dataTest()

    def tearDown(self):
        Application.db.drop_collection('meals')
        Application.db.drop_collection('users')

    def dataTest(self):
        self.newMealData = "{\"town\": \"Santiago\",\"menu\": \"Soupions de légumes avec cassolette de veau\",\"price\": 60,\"address\": \"3 impasse marie - blanche 75018\",\"detailedInfo\": {\"requiredHelpers\": []},\"privateInfo\" :{},\"nbGuests\": 10,\"veggies\": false,\"time\": \"2017-12-20T17:00:00.000Z\",\"addressApprox\": \"Métro Blanche L2\"}"

    def test_insert_meal(self):
        resp = self.client.post("/api/meal", data=self.newMealData, headers = {'Authorization': 'Bearer {0}'.format(self.token)})
        self.assertEqual("200 OK", resp.status)
        coucou = Application.db.meals.find_one()
        self.assertEqual(json.dumps(Application.preprocess_id(coucou),default=json_util.default), resp.data)
        adminID = str(coucou["_id"])
        cDate = coucou["creationDate"]
        testMeal = {u'town': u'Santiago',u'menu': u'Soupions de l\xe9gumes avec cassolette de veau',u'nbRemainingPlaces':9 ,u'price': 60, u'address': u'3 impasse marie - blanche 75018', u'privateInfo': {}, u'detailedInfo': {u'requiredHelpers': []}, u'nbGuests': 10, u'veggies': False, u'time': u'2017-12-20T17:00:00.000Z', u'addressApprox': u'M\xe9tro Blanche L2', u'_id': '577678e94403f954d69cbd04'}
        testMeal["_id"]= ObjectId(adminID)
        testMeal["admin"]= ObjectId(adminID)
        testMeal["privateInfo"]["users"]=[{"_id":adminID,"role":"admin"}]
        testMeal["creationDate"] = cDate
        self.assertItemsEqual(coucou, testMeal)

    def test_insert_empty_meal(self):
        resp = self.client.post("/api/meal",data="",headers = {'Authorization': 'Bearer {0}'.format(self.token)})
        self.assertEqual("", resp.data)

    def test_get_all_meals(self):
        resp1 = self.client.get("/api/meals",headers = {'Authorization': 'Bearer {0}'.format(self.token)})
        self.assertEqual("200 OK", resp1.status)
        self.assertEqual([], json.loads(resp1.data))
        self.client.post("/api/meal", data=self.newMealData,headers = {'Authorization': 'Bearer {0}'.format(self.token)})
        resp2 = self.client.get("/api/meals",headers = {'Authorization': 'Bearer {0}'.format(self.token)})
        self.assertEqual("200 OK", resp2.status)
        resp2 = json.loads(resp2.data)
        self.assertEqual(1, len(resp2))
        self.assertEqual("Santiago", resp2[0]["town"])

    def test_delete_one_meal(self):
        Application.db.meals.insert({"test_remove": "test"})
        me =Application.db.meals.find_one()
        resp1 = self.client.delete("/api/meal/"+ str(me['_id']))
        self.assertEqual("200 OK", resp1.status)
        self.assertEqual(resp1.data, '1 meal deleted')
        self.assertEqual(None, Application.db.meals.find_one())
        #When the meal don't exist
        Application.db.meals.insert(me)
        me2 =copy.copy(me)
        me2['_id']=ObjectId(str(me['_id'])[:-3]+'123')
        resp2 = self.client.delete("/api/meal/"+str(me2['_id']))
        self.assertEqual("202 ACCEPTED", resp2.status)
        self.assertEqual(resp2.data, '0 meal deleted')
        self.assertEqual(me, Application.db.meals.find_one())

    def test_update_one_partial_meal_withoutid(self):
        Application.db.meals.insert({"test_update": "test"})
        me =Application.db.meals.find_one()
        resp1 = self.client.put("/api/meal/"+str(me['_id']),data="{\"test_update\":\"toto\"}")
        me2 = Application.db.meals.find_one()
        me['test_update']="toto"
        self.assertEqual(me2,me)
        self.assertEqual("200 OK", resp1.status)
        self.assertEqual(resp1.data, '1 meals modified')

    def test_update_one_meal_withid(self):
        Application.db.meals.insert({"test_update": "test","test_toto": "toto"})
        me =Application.db.meals.find_one()
        me['test_toto']="koukou"
        me3= copy.copy(me)
        me3['_id']=str(me3['_id'])
        resp1 = self.client.put("/api/meal/"+str(me['_id']),data=json.dumps(me3))
        me2 = Application.db.meals.find_one()
        self.assertEqual(me2,me)
        self.assertEqual("200 OK", resp1.status)
        self.assertEqual(resp1.data, '1 meals modified')

    def test_update_one_meal_that_dont_exist(self):
        Application.db.meals.insert({"test_update": "test"})
        me =Application.db.meals.find_one()
        me2 =copy.copy(me)
        me2['_id']=ObjectId(str(me['_id'])[:-3]+'123')
        resp2 = self.client.put("/api/meal/"+str(me2['_id']),data="{\"test_update\":\"toto22\"}")
        self.assertEqual("202 ACCEPTED", resp2.status)
        self.assertEqual(resp2.data, '0 meals modified')
        self.assertEqual(me, Application.db.meals.find_one())
        self.assertEqual(None, Application.db.meals.find_one({"_id":me2['_id']}))

    def test_update_one_meal_with_nodata(self):
        Application.db.meals.insert({"test_update": "test"})
        me =Application.db.meals.find_one()
        resp3 = self.client.put("/api/meal/"+str(me['_id']),data="")
        self.assertEqual("202 ACCEPTED", resp3.status)
        self.assertEqual(resp3.data, '0 meals modified')
        self.assertEqual(me, Application.db.meals.find_one())






if __name__ == '__main__':
    unittest.main()
