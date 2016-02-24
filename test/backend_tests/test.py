# -*- coding: utf-8 -*-
import os
import sys
topdir = os.path.join(os.path.dirname(__file__), "../..")
sys.path.append(topdir)
import unittest
import json
import copy
from pymongo import MongoClient
from bson import ObjectId
from bson.json_util import dumps
from app.api import Application
from app import configure

class TestAPI(unittest.TestCase):
    def setUp(self):
        Application.app.config['TESTING'] = True
        self.client = Application.app.test_client()
        client = MongoClient('localhost')
        Application.db = client.get_database('Shrt_test')

    def tearDown(self):
        client = MongoClient('localhost')
        client.drop_database('Shrt_test')

    def test_insert_meal(self):
        resp = self.client.post("/api/meal", data="{\"super\":\"toto\"}")
        self.assertEqual("200 OK", resp.status)
        coucou = Application.db.meals.find_one()
        self.assertEqual(json.dumps(Application.preprocess_id(coucou)), resp.data)

    def test_insert_empty_meal(self):
        resp = self.client.post("/api/meal",data="")
        self.assertEqual("", resp.data)

    def test_get_all_meals(self):
        resp1 = self.client.get("/api/meals")
        self.assertEqual("200 OK", resp1.status)
        self.assertEqual([], json.loads(resp1.data))
        self.client.post("/api/meal", data="{\"test\":\"test\"}")
        resp2 = self.client.get("/api/meals")
        self.assertEqual("200 OK", resp2.status)
        resp2 = json.loads(resp2.data)
        self.assertEqual(1, len(resp2))
        self.assertEqual("test", resp2[0]["test"])

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
