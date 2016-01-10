# -*- coding: utf-8 -*-
import os
import sys
topdir = os.path.join(os.path.dirname(__file__), "../..")
sys.path.append(topdir)
import unittest
from pymongo import MongoClient
from bson import ObjectId
from bson.json_util import dumps
from app.api import Application
from app import configure

class TestAPI(unittest.TestCase):
    def setUp(self):
        #Application.db = MongoClient('localhost')['Shrt_test']
        Application.app.config['TESTING'] = True
        self.client = Application.app.test_client()
        configEnv = getattr(configure, os.environ.get('APP_SETTINGS'))()
        Application.app.config.from_object(configEnv)
        client = MongoClient(Application.app.config['MONGOLAB_URI'],
                                connectTimeoutMS=30000,
                                socketTimeoutMS=None,
                                socketKeepAlive=True)
        Application.db = client.test

    def tearDown(self):
        Application.db.meals.drop()

    def test_preprocess_id(self):
        o1 = {"_id": ObjectId("54e62c53f99210d7ec385497")}
        o1 = Application.preprocess_id(o1)
        o2 = {"_id": "54e62c53f99210d7ec385497"}
        o2 = Application.preprocess_id(o2)
        id_inserted = Application.db.meals.insert({"test": "test"})
        id_inserted2 = Application.db.meals.insert({"test": "test2"})
        t = Application.db.meals.find()
        t = Application.preprocess_id(t)
        self.assertEqual("54e62c53f99210d7ec385497", o1["_id"])
        self.assertEqual("54e62c53f99210d7ec385497", o2["_id"])
        self.assertEqual("{\"_id\": \"54e62c53f99210d7ec385497\"}", dumps(o1))
        self.assertEqual(str(id_inserted), t[0]["_id"])
        self.assertEqual(str(id_inserted2), t[1]["_id"])
        self.assertEqual([], Application.preprocess_id([]))
        self.assertEqual("null", Application.preprocess_id("null"))

if __name__ == '__main__':
    unittest.main()
