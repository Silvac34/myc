# -*- coding: utf-8 -*-

from datetime import datetime
from pymongo import MongoClient, cursor
from bson import ObjectId
from bson.json_util import dumps

# Populate the database with meals if empty collection
db = MongoClient('localhost')['Shrt']
def populate_database():
    a = dumps(db.meals.find())
    if a == "[]":
        db.meals.insert({"date":datetime.strptime("2014-10-01", "%Y-%m-%d"),"location": "Chez Fanfan","label":"Moussaka pour 4!!"})
        db.meals.insert({"date":"28/01/2016","location": "au coin de la rue","label":"Hachiparmentier de folie"})
        db.meals.insert({"date":"31/02/2016","location": "Chez les Dumas","label":"Salade à déguster"})
        db.meals.insert({"date":"01/02/2016","location": "A définir","label":"Pates au pesto"})
        db.meals.insert({"date":"03/02/2016","location": "A la maison","label":"Repas d'anniversaire"})

if __name__ == "__main__":
    populate_database()
    cursor = db.meals.find()
    for document in cursor:
        print(document)
