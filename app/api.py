# -*- coding: utf-8 -*-
import json
import os
import requests
import jwt
from jwt import DecodeError, ExpiredSignature
from datetime import datetime, timedelta
from flask import Flask, Response, render_template, request, jsonify
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

    @classmethod
    def is_authentificated(self,request):
        # the token is put in the Authorization header
        if not request.headers.get('Authorization'):
            return jsonify(error='Authorization header missing'), 401
        # this header looks like this: “Authorization: Bearer {token}”
        token = request.headers.get('Authorization').split()[1]
        try:
            payload = jwt.decode(token, Application.app.config['TOKEN_SECRET'])
        except DecodeError:
            return jsonify(error='Invalid token'), 401
        except ExpiredSignature:
            return jsonify(error='Expired token'), 401
        else:
            payload = jwt.decode(token, Application.app.config['TOKEN_SECRET'])
            self.user_id = payload['sub']
            return True

class User:
    def __init__(self,email,password=None,facebook_id=None):
        self.em=email
        self.pa=password
        self.facebook_id = facebook_id
        #Checks if this user already exist in db. And retreives its _id
        if Application.db.users.find_one({"email": email}) is None and password is not None:
            Application.db.users.insert({"email":email,"password":password})
        elif Application.db.users.find_one({"email": email}) is None and facebook_id is not None:
            Application.db.users.insert({"email":email,"facebook_id":facebook_id})
        self._id = str(Application.db.users.find_one({"email": email})["_id"])
    def token(self):
        payload = {
            'sub': self._id,
            'iat': datetime.utcnow(),
            'exp': datetime.utcnow() + timedelta(days=14)
        }
        token = jwt.encode(payload, Application.app.config['TOKEN_SECRET'])
        return token.decode('unicode_escape')


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
    user = User(facebook_id=profile['id'], email=profile['email'])
    #Store data from facebook
    fbID = profile['id']
    if 'id' in profile:
        del profile['id']
    Application.db.users.update_one({"facebook_id":fbID}, {"$set":profile})
    return jsonify(token=user.token())

#@Application.app.route('/auth/signup', methods=['POST'])
#def signup():
#    data = json.loads(request.data)
#    email = data["email"]
#    password = data["password"]
#    user = User(email=email, password=password)
#    return jsonify(token=user.token())

#@Application.app.route('/auth/login', methods=['POST'])
#def login():
#    data = json.loads(request.data)
#    email = data["email"]
#    password = data["password"]
#    user = Application.db.users.find_one({"email":email})
#    if not user:
#        return jsonify(error="No such user"), 404
#    if user["password"] == password:
#        return jsonify(token=User(email).token()), 200
#    else:
#        return jsonify(error="Wrong email or password"), 400


"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
PUBLIC API
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

# Delete one meal from ID
@Application.app.route("/api/meal/<meal_id>", methods=["DELETE"])
def delete_meal(meal_id):
    result = Application.db.meals.delete_one({"_id": ObjectId(meal_id)})
    if result.deleted_count == 1 :
        return Response(str(result.deleted_count) + ' meal deleted',status=200)
    elif result.deleted_count == 0 :
        return Response(str(result.deleted_count) + ' meal deleted',status=202)

# Update one meal from ID
@Application.app.route("/api/meal/<meal_id>", methods=['PUT'])
def update_one_meal(meal_id):
    if request.data == "" or request.data == "{}" or request.data is None:
        return Response('0 meals modified',status=202)
    #To delete the existing _id if there is one
    updateData = json.loads(request.data)
    if '_id' in updateData:
        del updateData['_id']
    #Update the meal
    result = Application.db.meals.update_one({"_id":ObjectId(meal_id)}, {"$set":updateData})
    if result.matched_count == 1 :
        return Response(str(result.matched_count) + ' meals modified',status=200)
    if result.matched_count == 0 :
        return Response(str(result.matched_count) +' meals modified',status=202)
        
    
    
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
PRIVATE API
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
#Get current user
@Application.app.route('/api/user', methods=["GET"])
def user_info():
    authResponse = Application.is_authentificated(request)
    if authResponse is not True:
        return authResponse
    else:
        user = Application.db.users.find_one({"_id": ObjectId(Application.user_id)})
        if user is None:
            return jsonify(error='Should not happen ...'), 500
        #return jsonify(_id=str(user["_id"]),email=user["email"]), 200
        return dumps(Application.preprocess_id(user)), 200
    return jsonify(error="never reach here..."), 500

# Insert one meal
@Application.app.route('/api/meal', methods=["POST"])
def insert_one_meal():
    authResponse = Application.is_authentificated(request)
    if authResponse is not True:
        return authResponse
    else:
        if request.data == "" or request.data == "{}" or request.data is None:
            return ""
        else:
            new_meal = json.loads(request.data)
            new_meal["admin"] = Application.user_id
            id_inserted = Application.db.meals.insert(new_meal)
            inserted = Application.db.meals.find_one({"_id": ObjectId(id_inserted)})
            return Response(dumps(Application.preprocess_id(inserted)), status=200)

# Get all meals- Show public and undetailed information
@Application.app.route('/api/meals', methods=['GET'])
def get_all_meals():
    authResponse = Application.is_authentificated(request)
    if authResponse is not True:
        return authResponse
    else:
        return Response(dumps(Application.preprocess_id(Application.db.meals.find({},{"detailedInfo":0,"privateInfo":0}))), status=200)


####################################################################################


if __name__ == "__main__":
    #Application.app.debug = True
    Application.app.run(host='0.0.0.0', port=8080)
