# -*- coding: utf-8 -*-
import json
import os
import requests
import jwt
from jwt import DecodeError, ExpiredSignature
from datetime import datetime, timedelta
from flask import Flask,g , Response, render_template, request, jsonify
from pymongo import MongoClient, cursor
from bson import ObjectId
from bson.json_util import dumps
from functools import wraps
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

class User:
    def __init__(self,email=None,password=None,facebook_id=None,_id=None):
        self.facebook_id = facebook_id
        self._id = _id
        self.createUserIfNew()
        
    def createUserIfNew(self):
        if self._id:
            print('logged')
        elif self.facebook_id:
            if Application.db.users.find_one({"privateInfo.facebook_id":self.facebook_id}) is None:
                Application.db.users.insert({"privateInfo" : {"facebook_id":self.facebook_id}})
            self._id = str(Application.db.users.find_one({"privateInfo.facebook_id":self.facebook_id})["_id"])
        
    def getUserInfo(self):
        return Application.db.users.find_one({"_id": ObjectId(self._id)})
    
    def getUserPublicInfo(self):
        return Application.db.users.find_one({"_id": ObjectId(self._id)},{"privateInfo":0})
    
    def updateUser(self,information):
        Application.db.users.update_one({"_id":ObjectId(self._id)}, {"$set":information})
        
    def token(self):
        payload = {
            'sub': self._id,
            'iat': datetime.utcnow(),
            'exp': datetime.utcnow() + timedelta(days=14)
        }
        token = jwt.encode(payload, Application.app.config['TOKEN_SECRET'])
        return token.decode('unicode_escape')


def login_required(func):
    @wraps(func)
    def decorated_function(*args, **kwargs):
        if not request.headers.get('Authorization'):
            
            response = jsonify(message='Missing authorization header')
            response.status_code = 401
            return response

        try:
            token = request.headers.get('Authorization').split()[1]
            payload = jwt.decode(token, Application.app.config['TOKEN_SECRET'])
        except DecodeError:
            response = jsonify(message='Token is invalid')
            response.status_code = 401
            return response
        except ExpiredSignature:
            response = jsonify(message='Token has expired')
            response.status_code = 401
            return response

        g.user_id = payload['sub']

        return func(*args, **kwargs)

    return decorated_function
    
    

@Application.app.route('/')
def home():
    return render_template("index.html")
    

"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
LOGIN API
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

@Application.app.route('/auth/facebook', methods=['POST'])
def auth_facebook():
    access_token_url = 'https://graph.facebook.com/v2.3/oauth/access_token'
    graph_api_url = 'https://graph.facebook.com/v2.5/me?fields=id,email,last_name,first_name,link, gender,picture'
    params = {
        'client_id': request.json['clientId'],
        'redirect_uri': request.json['redirectUri'],
        'client_secret': Application.app.config['FACEBOOK_SECRET'],
        'code': request.json['code']
    }
    # Exchange authorization code for access token.
    r = requests.get(access_token_url, params=params)
    # use json.loads instead of urlparse.parse_qsl
    access_token = json.loads(r.text)
    # Step 2. Retrieve information about the current user.
    r = requests.get(graph_api_url, params=access_token)
    profile = json.loads(r.text)
    # Step 3. Create a new account or return an existing one.
    user = User(facebook_id=profile['id'])
    #Store data from facebook
    userInfo = {}
    userInfo["picture"]=profile["picture"]
    userInfo["first_name"]=profile["first_name"]
    userInfo["last_name"]=profile["last_name"]
    userInfo["gender"]=profile["gender"]
    user.updateUser(userInfo)
    userInfo = {"privateInfo.email" : profile["email"],"privateInfo.link" : profile["link"] }
    user.updateUser(userInfo)
    return jsonify(token=user.token())


"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
PUBLIC API
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

# Delete one meal from ID
#@Application.app.route("/api/meal/<meal_id>", methods=["DELETE"])
#def delete_meal(meal_id):
#    result = Application.db.meals.delete_one({"_id": ObjectId(meal_id)})
#    if result.deleted_count == 1 :
#        return Response(str(result.deleted_count) + ' meal deleted',status=200)
#    elif result.deleted_count == 0 :
#        return Response(str(result.deleted_count) + ' meal deleted',status=202)

# Update one meal from ID
#@Application.app.route("/api/meal/<meal_id>", methods=['PUT'])
#def update_one_meal(meal_id):
#    if request.data == "" or request.data == "{}" or request.data is None:
#        return Response('0 meals modified',status=202)
#    #To delete the existing _id if there is one
#    updateData = json.loads(request.data)
#    if '_id' in updateData:
#        del updateData['_id']
#    #Update the meal
#    result = Application.db.meals.update_one({"_id":ObjectId(meal_id)}, {"$set":updateData})
#    if result.matched_count == 1 :
#        return Response(str(result.matched_count) + ' meals modified',status=200)
#    if result.matched_count == 0 :
#        return Response(str(result.matched_count) +' meals modified',status=202)
        
    
    
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
PRIVATE API
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
#Get current user
@Application.app.route('/api/user', methods=["GET"])
@login_required
def user_info():
    user = User(_id=g.user_id).getUserInfo()
    if user is None:
        return jsonify(error='Should not happen ...'), 500
    return dumps(Application.preprocess_id(user)), 200
    

# Insert one meal
@Application.app.route('/api/meal', methods=["POST"])
@login_required
def insert_one_meal():
    if request.data == "" or request.data == "{}" or request.data is None:
        return ""
    else:
        new_meal = json.loads(request.data)
        new_meal["admin"] = g.user_id
        new_meal["privateInfo"]["users"]= [{"_id":g.user_id,"role":"admin"}]
        new_meal["nbRemainingPlaces"] = new_meal["nbGuests"] -1
        new_meal["creationDate"] = datetime.now()
        id_inserted = Application.db.meals.insert(new_meal)
        inserted = Application.db.meals.find_one({"_id": ObjectId(id_inserted)})
        return Response(dumps(Application.preprocess_id(inserted)), status=200)

# Get all meals- Show public and undetailed information
@Application.app.route('/api/meals', methods=['GET'])
@login_required
def get_all_meals():
    meals = Application.db.meals.find({},{"detailedInfo":0,"privateInfo":0})
    enrichedMeals = []
    for meal in meals:
        meal["admin"] = Application.preprocess_id(User(_id=meal["admin"]).getUserPublicInfo())
        enrichedMeals.append(meal)
    return Response(dumps(Application.preprocess_id(enrichedMeals)), status=200)


####################################################################################


if __name__ == "__main__":
    #Application.app.debug = True
    Application.app.run(host='0.0.0.0', port=8080)
