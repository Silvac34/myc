# -*- coding: utf-8 -*-
import json
import DevData
import os
from flask import Flask, Response, render_template, request
from pymongo import MongoClient, cursor
from bson import ObjectId
from bson.json_util import dumps
import configure



class Application:
    app = Flask(__name__)
    #Load the environment's configuration (depends on the environment variable APP_SETTINGS)
    configEnv = getattr(configure, os.environ.get('APP_SETTINGS'))()
    app.config.from_object(configEnv)
    #To add the database. The database depends on the environment
    client = MongoClient(app.config['MONGOLAB_URI'],
                            connectTimeoutMS=30000,
                            socketTimeoutMS=None,
                            socketKeepAlive=True)
    db = client.get_default_database()

    def __init__(self):
        pass

    @classmethod
    def preprocess_id(cls, o):
        if o is None or o == "" or o == "null":
            return o
        if isinstance(o, cursor.Cursor):
            o = json.loads(dumps(o))
        if isinstance(o, list):
            for i in range(len(o)):
                o[i] = Application.preprocess_id(o[i])
            return o
        if o["_id"]:
            if isinstance(o["_id"], ObjectId):
                o["_id"] = str(o["_id"])
            else:
                if isinstance(o["_id"], dict):
                    o["_id"] = str(o["_id"]["$oid"])
        return o

@Application.app.route('/')
def home():
    return render_template("index.html")
@Application.app.route('/fb')
def fb():
    return render_template("fb.html")



"""
API
"""

# Get all meals
@Application.app.route('/api/meals', methods=['GET'])
def get_all_meals():
    return Response(dumps(Application.preprocess_id(Application.db.meals.find())), status=200)

# Insert one meal
@Application.app.route('/api/meal', methods=["POST"])
def insert_one_meal():
    if request.data == "" or request.data == "{}" or request.data is None:
        return ""
    id_inserted = Application.db.meals.insert(json.loads(request.data))
    return Response(dumps(Application.preprocess_id(Application.db.meals.find_one({"_id": ObjectId(id_inserted)}))), status=200)

# Delete one meal from ID
@Application.app.route("/api/meal/<meal_id>", methods=["DELETE"])
def delete_meal(meal_id):
    Application.db.meals.remove({"_id": ObjectId(meal_id)})
    return ""

# Update one meal from ID
@Application.app.route("/api/meal/<meal_id>", methods=['PUT'])
def update_one_meal(meal_id):
    if request.data == "" or request.data == "{}" or request.data is None:
        return ""
    Application.db.meals.update_one({"_id":ObjectId(meal_id)}, {"$set":json.loads(request.data)})
    return ""

####################################################################################


if __name__ == "__main__":
    #DevData.populate_database() #to populate the database in development environment
    #Application.app.debug = True
    Application.app.run(host='0.0.0.0')
