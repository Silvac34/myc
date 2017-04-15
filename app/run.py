# -*- coding: utf-8 -*-
import os
import jwt
import configure
from jwt import DecodeError, ExpiredSignature
from datetime import datetime, timedelta
from dateutil import parser
import pytz
from flask import (request, jsonify, render_template, g, Response, session, escape, redirect, url_for)
from bson import ObjectId, json_util
import requests
import json
import base64
import calculator
import traceback #webhooks facebook
import random #webhooks facebook
from eve import Eve
from eve.auth import TokenAuth,requires_auth
from eve.io.mongo import Validator
from os.path import abspath, dirname

class MyTokenAuth(TokenAuth):
    def check_auth(self, token, allowed_roles, resource, method):
        try:
            token = base64.b64decode(token)
            payload = jwt.decode(token, Application.app.config['TOKEN_SECRET'])
            user = Application.app.data.driver.db.users.find_one({"_id":ObjectId(payload['sub'])})
            session['user_id'] = payload['sub']
            g.user_id = ObjectId(payload['sub'])
            return user
        except DecodeError:
            response = jsonify(message='Token is invalid')
            response.status_code = 401
        except ExpiredSignature:
            response = jsonify(message='Token has expired')
            response.status_code = 401
        except TypeError:
            response = jsonify(message='base64 decode issue')
            response.status_code = 401

class Application:
    this_directory = os.path.dirname(os.path.realpath(__file__))
    settings_file = os.path.join(this_directory,'settings.py')
    app = Eve(auth=MyTokenAuth, settings=settings_file)
    app.root_path = abspath(dirname(__file__))
    configEnv = getattr(configure, os.environ.get('APP_SETTINGS'))()
    app.config.from_object(configEnv)

class User:
    def __init__(self,email=None,password=None,facebook_id=None,_id=None):
        self.facebook_id = facebook_id
        self._id = _id
        self.createUserIfNew()
        
    def createUserIfNew(self):
        if self._id:
            return self
        if self.facebook_id:
            if Application.app.data.driver.db.users.find_one({"privateInfo.facebook_id":self.facebook_id}) is None:
                self._id = Application.app.data.driver.db.users.insert({"privateInfo" : {"facebook_id":self.facebook_id}})
            else: 
                self._id = Application.app.data.driver.db.users.find_one({"privateInfo.facebook_id":self.facebook_id})["_id"]
        
    def updateUser(self,information):
        Application.app.data.driver.db.users.update_one({"_id":self._id}, {"$set":information})
        
    def getUserPublicInfo(self):
        return Application.app.data.driver.db.users.find_one({"_id": self._id},{"privateInfo":0})
        
    def getUserAllInfo(self):
        return Application.app.data.driver.db.users.find_one({"_id": self._id})
        
    def isSubscribed(self,meal_id=None, meal =None):
        if meal == None:
            meal = Application.app.data.driver.db.meals.find_one({"_id": meal_id})
        if any (x["_id"] == ObjectId(self._id) for x in meal["privateInfo"]["users"]):
            return True
        else: return False
        
    def isSubscriptionPending(self, meal_id=None, meal =None):
        if meal == None:
            meal = Application.app.data.driver.db.meals.find_one({"_id": meal_id})
        if any ((x["_id"] == ObjectId(self._id) and x["status"] == "pending")for x in meal["privateInfo"]["users"]):
            return True
        else: 
            return False

    def isAdmin(self,meal_id=None, meal =None):
        if meal == None:
            meal = Application.app.data.driver.db.meals.find_one({"_id": meal_id})
        if meal["admin"] == self._id :
            return True
        else: return False        

    def token(self):
        payload = {
            'sub': str(self._id),
            'iat': datetime.utcnow(),
            'exp': datetime.utcnow() + timedelta(days=14)
        }
        token = jwt.encode(payload, Application.app.config['TOKEN_SECRET'])
        return str(base64.b64encode(token))


class Meal:
    def __init__(self,_id):
        self._id = _id
        
    def exist(self):
        if Application.app.data.driver.db.meals.find_one({"_id": self._id})== None:
            return False
        else: return True
        
    def getInfo(self):
        meal = Application.app.data.driver.db.meals.find_one({"_id": self._id})
        if meal == None:
            return False
        else : return meal


@Application.app.route('/')
def homePage():
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
    #getInfo json from this user
    currentUser = user.getUserAllInfo()
    #Store data from facebook
    userInfo = {}
    if hasattr(currentUser,"picture"):
        if currentUser["picture"] != profile["picture"]:
            userInfo["picture"] = profile["picture"]
    else:
        userInfo["picture"] = profile["picture"]
    if hasattr(currentUser,"first_name"):
        if currentUser["first_name"] != profile["first_name"]:
            userInfo["first_name"]=profile["first_name"]
    else:
        userInfo["first_name"]=profile["first_name"]
    if hasattr(currentUser,"last_name"):
        if currentUser["last_name"] != profile["last_name"]:
            userInfo["last_name"]=profile["last_name"]
    else:
        userInfo["last_name"]=profile["last_name"]
    if hasattr(currentUser,"gender"):  
        if currentUser["gender"] != profile["gender"]:
            userInfo["gender"]=profile["gender"]
    else:
        userInfo["gender"]=profile["gender"]  
    user.updateUser(userInfo)
    if profile.get("email", None) == None: #if email doesn't exist (in case, the user didn't validate his mail with fb), we doesn't add it to the database
        if hasattr(currentUser,"privateInfo"):
            if hasattr(currentUser["privateInfo"],"gender"):
                if currentUser["privateInfo"]["link"] == profile["link"]:
                    userInfo = {"privateInfo.link" : profile["link"] }
        else:
            userInfo = {"privateInfo.link" : profile["link"] }
    else:
        if hasattr(currentUser,"privateInfo"):    
            if hasattr(currentUser["privateInfo"],"gender") and hasattr(currentUser["privateInfo"],"email"):
                if currentUser["privateInfo"]["link"] == profile["link"] and currentUser["privateInfo"]["email"] == profile["email"]:
                    userInfo = {"privateInfo.email" : profile["email"],"privateInfo.link" : profile["link"] }
        else:
            userInfo = {"privateInfo.email" : profile["email"],"privateInfo.link" : profile["link"] }
    user.updateUser(userInfo)
    return jsonify(token=user.token())
    
@Application.app.route('/auth/logout', methods=['GET'])
def logout():
    # remove the username from the session if it's there
    session.pop('user_id', None)
    return "You were logged out"

"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
End Points Actions 
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

#GET api/users/private
def pre_get_privateUsers(request,lookup): 
    lookup.update({"_id":g.user_id })
    
# GET api/meals
def before_returning_GET_meals(response):
    for meal in response["_items"]:
        meal["admin"] = User(_id=meal["admin"]).getUserPublicInfo()
        if 'user_id' in session:
            if User(_id=escape(session['user_id'])).isSubscribed(meal_id=meal["_id"]) == True:
                print (User(_id=escape(session['user_id'])).isSubscriptionPending(meal_id=meal["_id"]))
                if User(_id=escape(session['user_id'])).isSubscriptionPending(meal_id=meal["_id"]) == False:
                    meal["detailedInfo"].update({"subscribed" : True, "pending": False})
                else: 
                    meal["detailedInfo"].update({"subscribed" : False, "pending": True}) 
            else: 
                meal["detailedInfo"].update({"subscribed" : False, "pending": False})
        else: 
            meal["detailedInfo"].update({"subscribed" : None, "pending": None})
            
# GET api/meals/<_id>
def before_returning_GET_item_meal(response):
    meal = response
    meal["admin"] = User(_id=meal["admin"]).getUserPublicInfo()
    if 'user_id' in session:
        if User(_id=escape(session['user_id'])).isSubscribed(meal_id=meal["_id"]) == True:
            if User(_id=escape(session['user_id'])).isSubscriptionPending(meal_id=meal["_id"]) == False:
                meal["detailedInfo"].update({"subscribed" : True, "pending": False})
            else: 
                meal["detailedInfo"].update({"subscribed" : False, "pending": True})  
        else: 
            meal["detailedInfo"].update({"subscribed" : False, "pending": False})
    else: 
        meal["detailedInfo"].update({"subscribed" : None, "pending": None})
        
#POST api/meals
    
def before_storing_POST_meals (items):
    for meal in items:
        meal["admin"] = g.user_id
        meal["privateInfo"]["users"]= [{"_id":g.user_id,"role": ["admin"],"status":"accepted"}]
        ######### Add Guests #################
        nbCooks = 0
        nbCleaners = 0
        nbSimpleGuests = 0
        nbHosts = 1
        if "cooks" in meal["detailedInfo"]["requiredGuests"] : #add required cooks info
            meal["detailedInfo"]["requiredGuests"]["cooks"]["nbRemainingPlaces"] = meal["detailedInfo"]["requiredGuests"]["cooks"]["nbRquCooks"]
            nbCooks = meal["detailedInfo"]["requiredGuests"]["cooks"]["nbRquCooks"]
        if "cleaners" in meal["detailedInfo"]["requiredGuests"] : #add required cleaners info
            meal["detailedInfo"]["requiredGuests"]["cleaners"]["nbRemainingPlaces"]=meal["detailedInfo"]["requiredGuests"]["cleaners"]["nbRquCleaners"]
            nbCleaners = meal["detailedInfo"]["requiredGuests"]["cleaners"]["nbRquCleaners"]
        if "simpleGuests" in meal["detailedInfo"]["requiredGuests"] : #add required simpleGuests info
            meal["detailedInfo"]["requiredGuests"]["simpleGuests"]["nbRemainingPlaces"]=meal["detailedInfo"]["requiredGuests"]["simpleGuests"]["nbRquSimpleGuests"]
            nbSimpleGuests = meal["detailedInfo"]["requiredGuests"]["simpleGuests"]["nbRquSimpleGuests"]
        nbGuests = nbCooks + nbCleaners + nbSimpleGuests
        meal["nbGuests"] = nbGuests + nbHosts
        meal["nbRemainingPlaces"] = nbGuests
        ########## Pricer ###########
        #price = round(meal["price"] /nbGuests,2) old version
        price = calculator.resolve(nbSimpleGuests, nbCooks, nbCleaners, meal["price"]) #obtention du prix par type d'aide
        meal["detailedInfo"]["requiredGuests"]["hosts"] = {}
        #association des prix à chacun des types d'aide
        meal["detailedInfo"]["requiredGuests"]["hosts"]["price"] = price["hostPrice"] #on récupère le prix de l'hôte dans price obtenu avec calculator.resolve et on l'associe
        if "cooks" in meal["detailedInfo"]["requiredGuests"] :
            meal["detailedInfo"]["requiredGuests"]["cooks"]["price"]= price["cookPrice"] #on récupère le prix aide cuisine dans price obtenu avec calculator.resolve et on l'associe
        if "cleaners" in meal["detailedInfo"]["requiredGuests"] :
            meal["detailedInfo"]["requiredGuests"]["cleaners"]["price"]= price["cleanerPrice"] #on récupère le prix aide vaisselle dans price obtenu avec calculator.resolve et on l'associe
        if "simpleGuests" in meal["detailedInfo"]["requiredGuests"] :
            meal["detailedInfo"]["requiredGuests"]["simpleGuests"]["price"]= price["simpleGuestPrice"] #on récupère le prix simpleGuest dans price obtenu avec calculator.resolve et on l'associe
        #################

        
#GET api/meals/private &  GET api/meals/private/<_id>
def pre_get_privateMeals(request,lookup):
    lookup.update({"privateInfo.users._id":g.user_id })

# GET api/meals/private
def before_returning_GET_privateMeals(response):
    for meal in response["_items"]:
        meal["admin"] = User(_id=meal["admin"]).getUserPublicInfo()

# GET api/meals/private/<_id>
def before_returning_GET_item_privateMeals(response):
    meal = response
    meal["admin"] = User(_id=meal["admin"]).getUserPublicInfo()
    for user in meal["privateInfo"]["users"]:
        userToUpdate = User(_id=user["_id"]).getUserPublicInfo()
        userAllInfo = User(_id=user["_id"]).getUserAllInfo()
        if "privateInfo" in userAllInfo:
            if "cellphone" in userAllInfo["privateInfo"]:
                userToUpdate["privateInfo"] = {"cellphone": userAllInfo["privateInfo"]["cellphone"]}
        user.update(userToUpdate)


# DELETE api/meals/private/<_id>
def pre_delete_privateMeals(request,lookup):
    lookup.update({"admin":g.user_id })
    
def after_delete_privateMeals(item):
    meal = item
    admin = User(_id = meal["admin"]).getUserAllInfo()
    for user in meal["privateInfo"]["users"]:
        participant = User(_id=user["_id"]).getUserAllInfo()
        participant_user_ref = participant["privateInfo"]["user_ref"] #besoin de rajouter attribut user_ref à chaque fois que quelqu'un veut s'inscrire à un repas
        meal_time_parse = parser.parse(meal["time"]) #parse le format de l'heure venant du backend
        local_meal_time = meal_time_parse.astimezone(pytz.timezone('Australia/Melbourne')) #pour plus tard, remplacer Australia/Melbourne par timezone locale
        meal_time_formated = "{:%A, %B %d at %H:%M}".format(local_meal_time) #on met l'heure du repas sous bon format
        if participant["_id"] == admin["_id"]:
            text = "Hi " + participant["first_name"] +", all participants are now informed that your meal on " + meal_time_formated + " has been canceled."
        else:
            text = "Hi " + participant["first_name"] +", just to inform you that " + admin["first_name"] + " " + admin["last_name"] + " has canceled the meal on " + meal_time_formated + "." 
        payload = {'recipient': {'user_ref': participant_user_ref }, 'message': {'text': text}} # We're going to send this back to the 
        requests.post('https://graph.facebook.com/v2.6/me/messages/?access_token=' + Application.app.config['TOKEN_POST_FACEBOOK'], json=payload) # Lets send it
    

# PATCH api/meals/private/<_id>
def pre_patch_privateMeals(request,lookup):
    lookup.update({"admin":g.user_id })

### privateUsers ressource ###
Application.app.on_pre_GET_privateUsers += pre_get_privateUsers
### meals ressource ###
Application.app.on_fetched_resource_meals +=  before_returning_GET_meals
Application.app.on_fetched_item_meals +=  before_returning_GET_item_meal
Application.app.on_insert_meals +=  before_storing_POST_meals
### privateMeals ressource ###
Application.app.on_pre_GET_privateMeals += pre_get_privateMeals
Application.app.on_fetched_resource_privateMeals +=  before_returning_GET_privateMeals
Application.app.on_fetched_item_privateMeals +=  before_returning_GET_item_privateMeals
Application.app.on_pre_DELETE_privateMeals += pre_delete_privateMeals
Application.app.on_deleted_item_privateMeals += after_delete_privateMeals
Application.app.on_pre_PATCH_privateMeals += pre_patch_privateMeals


"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
Custom End Points
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

# Subscribe to a meal
@Application.app.route('/api/meals/<meal_id>/subscription', methods=['POST'])
@requires_auth('ressource')
def subscribe_to_meal(meal_id):
    meal_id = ObjectId(meal_id)
    rquData = json.loads(request.data)
    dataSchema = {
        "requestRole":{
            "type": "string",
            "allowed":["cook","cleaner","simpleGuest"]
        }
    }
    v= Validator(dataSchema)
    if not v.validate(rquData):
        return Response(status=400)
    else:
        meal = Meal(meal_id).getInfo()
        if not meal:
            return Response("Meal doesn't exist",status =404)
        if meal["nbRemainingPlaces"]<=0: 
            return Response("Meal is full",status=400)
        elif not meal["detailedInfo"]["requiredGuests"][rquData["requestRole"] + "s"]["nbRemainingPlaces"]>0 :
            return Response("Role is full",status=400)
        elif User(_id=ObjectId(session['user_id'])).isSubscribed(meal=meal): 
            return Response("User already registered",status=400)
        else :
            meal["nbRemainingPlaces"] = meal["nbRemainingPlaces"] - 1 #on enlève 1 aux nombres totales de places restantes si acceptation manuelle ou automatique
            meal["detailedInfo"]["requiredGuests"][rquData["requestRole"] + "s"]["nbRemainingPlaces"] =  meal["detailedInfo"]["requiredGuests"][rquData["requestRole"] + "s"]["nbRemainingPlaces"] - 1 #on enlève 1 place au nombre spécifique du rôle de places restantes si acceptation manuelle ou automatique
            participant = User(_id=g.user_id).getUserPublicInfo() #info du participant pour envoyer des text messengers
            admin = User(_id = meal["admin"]).getUserAllInfo() #info de l'admin pour envoyer des text messengers
            admin_user_ref = admin["privateInfo"]["user_ref"] #user_ref de l'admin relatif au plugin checkbox messenger pour pouvoir le reconnaître
            meal_time_parse = parser.parse(meal["time"]) #parse le format de l'heure venant du backend
            local_meal_time = meal_time_parse.astimezone(pytz.timezone('Australia/Melbourne')) #pour plus tard, remplacer Australia/Melbourne par timezone locale
            meal_time_formated = "{:%A, %B %d at %H:%M}".format(local_meal_time) #on met l'heure du repas sous bon format
            if meal["automaticSubscription"] == True: #si acceptation automatique
                meal["privateInfo"]["users"].append({"_id":g.user_id,"role":[rquData["requestRole"]],"status":"accepted"})
                #code pour envoyer un message à l'hôte que quelqu'un s'est inscrit à son repas
                if meal["nbRemainingPlaces"] == 0: #si dernière place alors on précise que le meal est full
                    text = "Hi " + admin["first_name"] +", just to inform you that " + participant["first_name"] + " " + participant["last_name"] + " subscribed to your meal on " + meal_time_formated + ". Now, you meal is full."
                else: 
                    text = "Hi " + admin["first_name"] +", just to inform you that " + participant["first_name"] + " " + participant["last_name"] + " subscribed to your meal on " + meal_time_formated + "."
            else: #si acceptation manuelle
                meal["privateInfo"]["users"].append({"_id":g.user_id,"role":[rquData["requestRole"]],"status":"pending"})
                request_url_split = request.url.split("/")
                url_to_send = "https://" + request_url_split[2] + "/#/my_meals/" + request_url_split[5]
                text = "Hi " + admin["first_name"] +", " + participant["first_name"] + " " + participant["last_name"] + " subscribed to your meal on " + meal_time_formated + ". You chose to validate manually the bookings of your meal. Please, go to " + url_to_send + " to validate this one."
            Application.app.data.driver.db.meals.update_one({"_id":meal_id}, {"$set":meal}) #applique les changements pour le repas
            payload = {'recipient': {'user_ref': admin_user_ref }, 'message': {'text': text}} # We're going to send this back to the 
            requests.post('https://graph.facebook.com/v2.6/me/messages/?access_token=' + Application.app.config['TOKEN_POST_FACEBOOK'], json=payload) # Lets send it
            return Response(status=200)
            


# Validate a subscription to a meal
@Application.app.route('/api/meals/<meal_id>/subscription/validate/<participant_id>', methods=['POST'])
@requires_auth('ressource')
def validate_a_subscription(meal_id, participant_id):            
    meal_id = ObjectId(meal_id)
    meal = Meal(meal_id).getInfo()
    data_result = json.loads(request.data)
    validation_result = data_result["validation_result"]
    if not meal:
        return Response("Meal doesn't exist",status =404)
    admin = User(_id=g.user_id)
    if not admin.isAdmin(meal=meal):
        return Response("Meal's admin is the only one who can validate a subscription",status=400)
    if admin.getUserPublicInfo()["_id"] == ObjectId(participant_id):
        return Response("Admin can not validate himself",status=400)
    if validation_result is None:
        return Response("No validation has been passed in argument",status=400)
    else:
        admin = admin.getUserAllInfo()
        request_url_split = request.url.split("/")
        url_to_send = "https://" + request_url_split[2] + "/#/my_meals/" + str(meal["_id"])
        meal_time_parse = parser.parse(meal["time"]) #parse le format de l'heure venant du backend
        local_meal_time = meal_time_parse.astimezone(pytz.timezone('Australia/Melbourne')) #pour plus tard, remplacer Australia/Melbourne par timezone locale
        meal_time_formated = "{:%A, %B %d at %H:%M}".format(local_meal_time) #on met l'heure du repas sous bon format
        for participant in meal["privateInfo"]["users"]:
            if participant["_id"] == ObjectId(participant_id):
                role = participant["role"]
                participantInfo = User(_id = ObjectId(participant_id)).getUserAllInfo()
                participant_user_ref = participantInfo["privateInfo"]["user_ref"]
                if validation_result == True:
                    participant["status"] = "accepted"
                    text = "Hi " + participantInfo["first_name"] + ", your request to participate to " + admin["first_name"] + " " + admin["last_name"] + "'s meal on " + meal_time_formated + " has been approved. To see more details about the meal, click here : " + url_to_send
                elif validation_result == False:
                    meal["privateInfo"]["users"].remove(participant)
                    text = "Hi " + participantInfo["first_name"] + ", your request to participate to " + admin["first_name"] + " " + admin["last_name"] + "'s meal on " + meal_time_formated + " has been denied. Let's try another one!"
                    meal["nbRemainingPlaces"] = meal["nbRemainingPlaces"] + 1 #on rajoute 1 place aux nombres totales de places restantes
                    meal["detailedInfo"]["requiredGuests"][role[0] + "s"]["nbRemainingPlaces"] =  meal["detailedInfo"]["requiredGuests"][role[0] + "s"]["nbRemainingPlaces"] + 1 #On remet la place utiliser par le participant qui était en attente et qui a été refusé
                payload = {'recipient': {'user_ref': participant_user_ref }, 'message': {'text': text}} # We're going to send this back to the 
                requests.post('https://graph.facebook.com/v2.6/me/messages/?access_token=' + Application.app.config['TOKEN_POST_FACEBOOK'], json=payload) # Lets send it
                Application.app.data.driver.db.meals.update_one({"_id":meal_id}, {"$set":meal}) #applique les changements pour le repas
        return Response(status=200)
            
# Unsubsribe to a meal
@Application.app.route('/api/meals/<meal_id>/unsubscription', methods=['POST'])
@requires_auth('ressource')
def unsubscribe_to_meal(meal_id):
    meal_id = ObjectId(meal_id)
    meal = Meal(meal_id).getInfo()
    
    if not meal:
        return Response("Meal doesn't exist",status =404)
    user = User(_id=g.user_id)
    if not user.isSubscribed(meal=meal): 
        return Response("User isn't subscribed",status=403)
    if user.isSubscriptionPending(meal=meal):
       return Response("User request is pending",status=403) 
    elif user.isAdmin(meal=meal):
        return Response("Meal's admin cannot unsubscribe",status=401)
    else:
        meal["nbRemainingPlaces"] +=  1
        for u in meal["privateInfo"]["users"]: 
            if u["_id"] == user._id:
                roles = u["role"]
                meal["privateInfo"]["users"].remove(u)
                participant = User(_id=ObjectId(user._id)).getUserPublicInfo()
                admin = User(_id = meal["admin"]).getUserAllInfo()
                admin_user_ref = admin["privateInfo"]["user_ref"]
                meal_time_parse = parser.parse(meal["time"]) #parse le format de l'heure venant du backend
                local_meal_time = meal_time_parse.astimezone(pytz.timezone('Australia/Melbourne')) #pour plus tard, remplacer Australia/Melbourne par timezone locale
                meal_time_formated = "{:%A, %B %d at %H:%M}".format(local_meal_time) #on met l'heure du repas sous bon format
                text = "Hi " + admin["first_name"] +", just to inform you that " + participant["first_name"] + " " + participant["last_name"] + " unsubscribed to your meal on " + meal_time_formated + "."
                payload = {'recipient': {'user_ref': admin_user_ref }, 'message': {'text': text}} # We're going to send this back to the 
                requests.post('https://graph.facebook.com/v2.6/me/messages/?access_token=' + Application.app.config['TOKEN_POST_FACEBOOK'], json=payload) # Lets send it
                break
        for r in roles :
            meal["detailedInfo"]["requiredGuests"][r + "s"]["nbRemainingPlaces"] +=1
        Application.app.data.driver.db.meals.update_one({"_id":meal_id}, {"$set":meal})
        return Response(status=200)
        
        
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
FACEBOOK WEBHOOKS
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

@Application.app.route('/webhook', methods=['GET', 'POST'])
def webhook():
  if request.method == 'POST':
    try:
      data = json.loads(request.data)
      if 'optin' in data['entry'][0]['messaging'][0]:
          user = User(_id=ObjectId(data['entry'][0]['messaging'][0]['optin']['ref'])) #ref = _id
          user.updateUser({'privateInfo.user_ref':data['entry'][0]['messaging'][0]['optin']['user_ref']}) #update de user_ref dans la BDD
      
      #text = data['entry'][0]['messaging'][0]['message']['text'] # Incoming Message Text for bots messenger
      #print(text)
      #sender = data['entry'][0]['messaging'][0]['sender']['id'] # Sender ID
      #print(sender)
      #payload = {'recipient': {'id': sender}, 'message': {'text': "Hello World"}} # We're going to send this back
      #print(payload)
      #r = requests.post('https://graph.facebook.com/v2.6/me/messages/?access_token=' + Application.app.config['TOKEN_POST_FACEBOOK'], json=payload) # Lets send it
    except Exception as e:
      print traceback.format_exc() # something went wrong
  elif request.method == 'GET': # For the initial verification
    if request.args.get('hub.verify_token') == '2093843HREKJFBD0Ujnfdfkjdbfkdfu9320948340983ckdnd3POI23J2K3Ndkdklfjeiou0989032U4H3HBdbdjodh0909UJ89JDJ':
      return request.args.get('hub.challenge')
    return "Wrong Verify Token"
  return "Hello World" #Not Really Necessary

if __name__ == '__main__':
    Application.app.run(host='0.0.0.0', port=8080)