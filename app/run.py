# -*- coding: utf-8 -*-
import os
import jwt
import configure
from jwt import DecodeError, ExpiredSignature
from datetime import datetime, timedelta
from dateutil import parser
import pytz
from flask import (request, jsonify, render_template, g, Response, session, escape, redirect, url_for, abort)
from bson import ObjectId, json_util
import requests
from threading import Timer
import json
import base64
import calculator
import traceback #webhooks facebook
import random #webhooks facebook
from eve import Eve
from eve.auth import TokenAuth,requires_auth
from eve.io.mongo import Validator
from os.path import abspath, dirname
import celeryFile

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
            if Application.app.data.driver.db.users.find_one({"facebook_id":self.facebook_id}) is None:
                self._id = Application.app.data.driver.db.users.insert({"facebook_id":self.facebook_id})
            else: 
                self._id = Application.app.data.driver.db.users.find_one({"facebook_id":self.facebook_id})["_id"]
        
    def updateUser(self,information):
        Application.app.data.driver.db.users.update_one({"_id":self._id}, {"$set":information})
        
    def getUserPublicInfo(self):
        return Application.app.data.driver.db.users.find_one({"_id": self._id},{"privateInfo":0})
        
    def getUserAllInfo(self):
        return Application.app.data.driver.db.users.find_one({"_id": self._id})
        
    def isSubscribed(self,meal_id=None, meal =None):
        if meal == None:
            meal = Application.app.data.driver.db.meals.find_one({"_id": meal_id})
        if any (x["_id"] == ObjectId(self._id) for x in meal["users"]):
            return True
        else: return False
        
    def isSubscriptionPending(self, meal_id=None, meal =None):
        if meal == None:
            meal = Application.app.data.driver.db.meals.find_one({"_id": meal_id})
        if any ((x["_id"] == ObjectId(self._id) and x["status"] == "pending")for x in meal["users"]):
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

### celery tasks (queues tasks) ###

celery = celeryFile.make_celery(Application.app) #on créer le décorateur qui va permettre de faire les taches en background avec celery
    
@celery.task()
def sendNotificationPreference(meal, mealPrice):
    if(meal['veggies'] == True):
        users = Application.app.data.driver.db.users.find({"privateInfo.preferences.city_notification": {'$in': [ meal["address"]["town"] ]}, "privateInfo.preferences.veggies_notification": True}) #recherche tous les utilisateurs qui ont dans leur ville de préférence la ville où est publiée le repas et qui sont veggies
    elif (meal['vegan'] == True):
        users = Application.app.data.driver.db.users.find({"privateInfo.preferences.city_notification": {'$in': [ meal["address"]["town"] ]}, "privateInfo.preferences.vegan_notification": True}) #recherche tous les utilisateurs qui ont dans leur ville de préférence la ville où est publiée le repas et qui sont vegan
    else:
        users = Application.app.data.driver.db.users.find({"privateInfo.preferences.city_notification": {'$in': [ meal["address"]["town"] ]}, "privateInfo.preferences.omnivorous_notification": True}) #recherche tous les utilisateurs qui ont dans leur ville de préférence la ville où est publiée le repas
    meal_time_parse = parser.parse(meal["time"]) #parse le format de l'heure venant du backend
    local_meal_time = meal_time_parse + timedelta(minutes=meal["privateInfo"]["address"]["utc_offset"]) #on ajoute le décallage horaire
    meal_time_formated = "{:%A, %B %d at %H:%M}".format(local_meal_time) #on met l'heure du repas sous bon format
    for user in users:
        if((user['_id'] != meal['admin']) and ("user_ref" in user["privateInfo"])):
            text = "Hello " + user["first_name"] + ",\nThere is a meal on " + meal_time_formated + " in " + meal["address"]["town"] + ". The menu is: \"" + meal["menu"]["title"] + "\" and for about $" + str(mealPrice)
            payload = {'recipient': {'user_ref': user["privateInfo"]["user_ref"] }, 'message': {'text': text}} # We're going to send this back to the 
            requests.post('https://graph.facebook.com/v2.6/me/messages/?access_token=' + Application.app.config['TOKEN_POST_MESSENGER'], json=payload) # Lets send it

@celery.task()
def sendNotificationTeam(meal, mealPrice):
    users = Application.app.data.driver.db.users.find({"_id": {'$in': [ ObjectId("58de100f1b2a09000c78096a"),ObjectId("58de2fb4564953000c5918a9")]}}) #envoie un message à dimitri et maylis quand un repas est publié
    meal_time_parse = parser.parse(meal["time"]) #parse le format de l'heure venant du backend
    local_meal_time = meal_time_parse + timedelta(minutes=meal["privateInfo"]["address"]["utc_offset"]) #on ajoute le décallage horaire
    meal_time_formated = "{:%A, %B %d at %H:%M}".format(local_meal_time) #on met l'heure du repas sous bon format
    for user in users:
        text = "Hello " + user["first_name"] + ",\nThere is a new meal on " + meal_time_formated + " in " + meal["address"]["town"] + ". The menu is: \"" + meal["menu"]["title"] + "\" and for about $" + str(mealPrice)
        payload = {'recipient': {'user_ref': user["privateInfo"]["user_ref"] }, 'message': {'text': text}} # We're going to send this back to the 
        requests.post('https://graph.facebook.com/v2.6/me/messages/?access_token=' + Application.app.config['TOKEN_POST_MESSENGER'], json=payload) # Lets send it
        
@celery.task()
def addReviewRatingToUser(userId, rating):
    user = User(_id=ObjectId(userId))
    userDatas = user.getUserPublicInfo()
    userInfo = {}
    if("reviews" in userDatas):
        if(rating in userDatas["reviews"]):
            numberOfRating = userDatas['reviews'][rating] + 1
            userInfo = {"reviews."+ rating: numberOfRating}
            user.updateUser(userInfo)
        else:
            userInfo = {"reviews."+ rating: 1}
            user.updateUser(userInfo)
    else:
        userInfo = {"reviews."+ rating: 1}
        user.updateUser(userInfo)
    
@celery.task()
def sendNoticeIncomingMeal(mealId):
    meal = Meal(_id = ObjectId(mealId)).getInfo()
    if(meal != False): #si le repas n'a pas été annulé
        #admin = User(_id = meal["admin"]).getUserAllInfo()
        for user in meal["users"]:
            participant = User(_id=user["_id"]).getUserAllInfo()
            if ("user_ref" in participant["privateInfo"]):
                #meal_time_parse = parser.parse(meal["time"]) #parse le format de l'heure venant du backend
                #local_meal_time = meal_time_parse + timedelta(minutes=meal["privateInfo"]["address"]["utc_offset"]) #on ajoute le décallage horaire
                #meal_time_formated = "{%H:%M}".format(local_meal_time) #on met l'heure du repas sous bon format
                if user["role"][0] == "admin":
                    text = "Hello " + participant["first_name"] +",\nYou host an incoming meal. Check out all the informations you need here : https://mycommuneaty.herokuapp.com/#!/my_meals/" + mealId
                else:#text à mettre en forme
                    text = "Hello " + participant["first_name"] +",\nYou got an incoming meal! Check out all the informations you need here : https://mycommuneaty.herokuapp.com/#!/my_meals/" + mealId + " (don't forget to bring cash to pay your host)."
                participant_user_ref = participant["privateInfo"]["user_ref"] #besoin de rajouter attribut user_ref à chaque fois que quelqu'un veut s'inscrire à un repas
                payload = {'recipient': {'user_ref': participant_user_ref }, 'message': {'text': text}} # We're going to send this back to the 
                requests.post('https://graph.facebook.com/v2.6/me/messages/?access_token=' + Application.app.config['TOKEN_POST_MESSENGER'], json=payload) # Lets send it
        
@celery.task()
def sendCheersPreviousMeal(mealId):
    meal = Meal(_id = ObjectId(mealId)).getInfo()
    if(meal != False): #si le repas n'a pas été annulé
        admin = User(_id = meal["admin"]).getUserAllInfo()
        for user in meal["users"]:
            participant = User(_id=user["_id"]).getUserAllInfo()
            if("user_ref" in participant["privateInfo"]):
                if user["role"][0] == "admin":
                    text = "Hello " + participant["first_name"] +",\nThank you very much for hosting yesterday. If you could let reviews to your guests, that would be amazing : https://mycommuneaty.herokuapp.com/#!/my_meals/" + str(mealId) +". Have a good day."
                else:#text à mettre en forme
                    text = "Hello " + participant["first_name"] +",\nThank you very much for your participation at " + admin["first_name"] + "'s meal. If you could let a review to him and the other guests, that would be amazing : https://mycommuneaty.herokuapp.com/#!/my_meals/" + str(mealId) +". Have a good day."
                participant_user_ref = participant["privateInfo"]["user_ref"] 
                payload = {'recipient': {'user_ref': participant_user_ref }, 'message': {'text': text}} # We're going to send this back to the 
                requests.post('https://graph.facebook.com/v2.6/me/messages/?access_token=' + Application.app.config['TOKEN_POST_MESSENGER'], json=payload) # Lets send it
    
@Application.app.route('/')
def homePage():
    return render_template("index.html")

"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
LOGIN API
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

@Application.app.route('/auth/facebook', methods=['POST'])
def auth_facebook():
    access_token_url = 'https://graph.facebook.com/v2.9/oauth/access_token'
    graph_api_url = 'https://graph.facebook.com/v2.9/me?fields=id,email,last_name,first_name,link,gender,picture.type(large)'
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
        
        if currentUser["picture"] != "https://graph.facebook.com/"+profile['id']+"/picture":
            userInfo["picture"] = "https://graph.facebook.com/"+profile['id']+"/picture"
    else:
        userInfo["picture"] = "https://graph.facebook.com/"+profile['id']+"/picture"
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
    if hasattr(profile, "gender"):
        if hasattr(currentUser,"gender"):  
            if currentUser["gender"] != profile["gender"]:
                userInfo["gender"]=profile["gender"]
        else:
            userInfo["gender"]=profile["gender"]  
    else:
       userInfo["gender"] = None
    if hasattr(profile, "link"):
        if hasattr(currentUser,"link"):  
            if currentUser["link"] != profile["link"]:
                userInfo["link"]=profile["link"]
        else:
            userInfo["link"]=profile["link"]
    else:
        userInfo["link"]=None
    user.updateUser(userInfo)
    
    if profile.get("email", None) != None: #if email doesn't exist (in case, the user didn't validate his mail with fb), we doesn't add it to the database
        if ("privateInfo" in currentUser):
            if ("email" in currentUser["privateInfo"]):
                if currentUser["privateInfo"]["email"] != profile["email"]:
                    userInfo = {"privateInfo.email" : profile["email"]}
                    user.updateUser(userInfo)
            else:
                userInfo = {"privateInfo.email" : profile["email"]}
                user.updateUser(userInfo)
        else:
            userInfo = {"privateInfo.email" : profile["email"]}
            user.updateUser(userInfo)
    else:
        userInfo = {"privateInfo.email" : ""}
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
### user ###
#GET api/users/private
def pre_get_privateUsers(request,lookup):
    lookup.update({"_id":g.user_id })
    
# PATCH api/users/private/<_id>
def pre_patch_privateUsers(request,lookup):
    lookup.update({"_id":g.user_id })
    
### meals ###
    
# GET api/meals
def before_returning_GET_meals(response): #
    for meal in response["_items"]:
        meal["admin"] = User(_id=meal["admin"]).getUserPublicInfo()
            
# GET api/meals/<_id>
def before_returning_GET_item_meal(response): #
    meal = response
    meal["admin"] = User(_id=meal["admin"]).getUserPublicInfo()
        
#POST api/meals
def before_storing_POST_meals (items):
    for meal in items:
        meal["admin"] = g.user_id
        meal["users"]= [{"_id":g.user_id,"role": ["admin"],"status":"accepted"}]
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
        price_notification = None
        if "cooks" in meal["detailedInfo"]["requiredGuests"] :
            meal["detailedInfo"]["requiredGuests"]["cooks"]["price"]= price["cookPrice"] #on récupère le prix aide cuisine dans price obtenu avec calculator.resolve et on l'associe
            price_notification = price["cookPrice"]
        if "cleaners" in meal["detailedInfo"]["requiredGuests"] :
            meal["detailedInfo"]["requiredGuests"]["cleaners"]["price"]= price["cleanerPrice"] #on récupère le prix aide vaisselle dans price obtenu avec calculator.resolve et on l'associe
            price_notification = price["cleanerPrice"]
        if "simpleGuests" in meal["detailedInfo"]["requiredGuests"] :
            meal["detailedInfo"]["requiredGuests"]["simpleGuests"]["price"]= price["simpleGuestPrice"] #on récupère le prix simpleGuest dans price obtenu avec calculator.resolve et on l'associe
            if price_notification == None:
                price_notification = price["simpleGuestPrice"]
        sendNotificationPreference(meal, price_notification)
        sendNotificationTeam(meal, price_notification)
        #################

#POST api/meals
def after_storing_POST_meals(items):
    for meal in items:
        mealId = meal["_id"]
        now = datetime.now() #moment où le repas est publié
        mealTime = parser.parse(meal["time"]).replace(tzinfo=None)
        #beforeMealTime = mealTime - timedelta(hours=4) #on enverra un message de rappel 8heures avant que le repas ait lieu
        #timeBeforeNotice = (beforeMealTime-now).total_seconds() #durée avant de déclencher le timer du rappel: 8h avant le repas - maintenant (en secondes)
        #if(timeBeforeNotice > 0): #si le repas est publié assez tôt, on envoie le message, sinon, il ne se passe rien
            #Timer(timeBeforeNotice, sendNoticeIncomingMeal, [mealId]).start()
        afterMealTime = mealTime + timedelta(minutes=1320) #on enverra un message pour remercier les participants 16h après le repas 
        timeForCheering = (afterMealTime - now).total_seconds() #durée avant de déclencher le timer pour les remerciements: 16h après le repas - maintenant (en secondes)
        Timer(timeForCheering, sendCheersPreviousMeal, [mealId]).start()
        
        
#GET api/meals/private &  GET api/meals/private/<_id>
def pre_get_privateMeals(request,lookup):
    lookup.update({"users._id":g.user_id })

# GET api/meals/private#
def before_returning_GET_privateMeals(response):
    for meal in response["_items"]:
        meal["admin"] = User(_id=meal["admin"]).getUserPublicInfo()

# GET api/meals/private/<_id>
def before_returning_GET_item_privateMeals(response):
    meal = response
    meal["admin"] = User(_id=meal["admin"]).getUserPublicInfo()
    for user in meal["users"]:
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
    if(len(meal["users"]) > 1):
        for user in meal["users"]:
            participant = User(_id=user["_id"]).getUserAllInfo()
            if("user_ref" in participant["privateInfo"]):
                participant_user_ref = participant["privateInfo"]["user_ref"] #besoin de rajouter attribut user_ref à chaque fois que quelqu'un veut s'inscrire à un repas
                meal_time_parse = parser.parse(meal["time"]) #parse le format de l'heure venant du backend
                local_meal_time = meal_time_parse + timedelta(minutes=meal["privateInfo"]["address"]["utc_offset"]) #on ajoute le décallage horaire
                meal_time_formated = "{:%A, %B %d at %H:%M}".format(local_meal_time) #on met l'heure du repas sous bon format
                if participant["_id"] == admin["_id"]:
                    text = "Hello " + participant["first_name"] +",\nAll participants are now informed that your meal on " + meal_time_formated + " has been canceled."
                else:
                    text = "Hello " + participant["first_name"] +",\n" + admin["first_name"] + " " + admin["last_name"] + " has canceled the meal on " + meal_time_formated + "." 
                payload = {'recipient': {'user_ref': participant_user_ref }, 'message': {'text': text}} # We're going to send this back to the 
                requests.post('https://graph.facebook.com/v2.6/me/messages/?access_token=' + Application.app.config['TOKEN_POST_MESSENGER'], json=payload) # Lets send it
    

# PATCH api/meals/private/<_id>
def pre_patch_privateMeals(request,lookup):
    meal = Meal(_id=ObjectId(lookup["_id"])).getInfo()
    if meal != False:
        for user in meal["users"]:
            if user["_id"] == g.user_id: #on récupère l'id de celui qui publie le repas et s'il n'est pas hôte / admin alors on abort le process
                if(user["role"][0] != "admin"):
                    abort(403)
    
def before_updating_privateMeals(updates, original):
    if ("detailedInfo" in updates): # si on change le nombre d'aide
        requiredGuestsUpdate = updates["detailedInfo"]["requiredGuests"]
        requiredGuestsMeal = original["detailedInfo"]["requiredGuests"]
        ##on définit le nombre total d'aide pour pouvoir calculer les prix
        if ("cooks" in requiredGuestsMeal):
            if("cooks" in requiredGuestsUpdate):
                nbCooks = requiredGuestsUpdate["cooks"]["nbRquCooks"]
            else:
                nbCooks = requiredGuestsMeal["cooks"]["nbRquCooks"]
        else:
            nbCooks = 0
        if ("cleaners" in requiredGuestsMeal):
            if ("cleaners" in requiredGuestsUpdate):
                nbCleaners = requiredGuestsUpdate["cleaners"]["nbRquCleaners"]
            else:
                nbCleaners = requiredGuestsMeal["cleaners"]["nbRquCleaners"]
        else:
            nbCleaners = 0
        if ("simpleGuests" in requiredGuestsMeal):
            if ("simpleGuests" in requiredGuestsUpdate):
                nbSimpleGuests = requiredGuestsUpdate["simpleGuests"]["nbRquSimpleGuests"]
            else:
                nbSimpleGuests = requiredGuestsMeal["simpleGuests"]["nbRquSimpleGuests"]
        else:
            nbSimpleGuests = 0
        price = calculator.resolve(nbSimpleGuests, nbCooks, nbCleaners, original["price"]) #obtention du nouveau prix par type d'aide
        #on actualise le prix de l'hôte
        requiredGuestsUpdate["hosts"] = {"price": price["hostPrice"]}
        if (nbCooks > 0):
            if("cooks" in requiredGuestsUpdate):
                requiredGuestsUpdate["cooks"]["price"] = price["cookPrice"]
            else:
               requiredGuestsUpdate["cooks"] = {"price": price["cookPrice"]}
        if (nbCleaners > 0):
            if("cleaners" in requiredGuestsUpdate):
                requiredGuestsUpdate["cleaners"]["price"] = price["cleanerPrice"]
            else:
                requiredGuestsUpdate["cleaners"] = {"price": price["cleanerPrice"]}
        if (nbSimpleGuests > 0):
            if("simpleGuests" in requiredGuestsUpdate):
                requiredGuestsUpdate["simpleGuests"]["price"] = price["simpleGuestPrice"]
            else:
                requiredGuestsUpdate["simpleGuests"] = {"price": price["simpleGuestPrice"]}
        if ("cooks" in requiredGuestsUpdate):
            if ("nbRquCooks" in requiredGuestsUpdate["cooks"]): #si on change le nombre d'aide cuisine
                ##on update le nbRemainingPlaces dans privateInfo
                if ("cooks" in requiredGuestsMeal and requiredGuestsMeal["cooks"]["nbRquCooks"] > 0): #si il y a déjà des aides cuisines dans le repas proposé (alors nbRquCooks existe déjà)
                    cookDelta = requiredGuestsUpdate["cooks"]["nbRquCooks"] - requiredGuestsMeal["cooks"]["nbRquCooks"] #cookDelta est la variation du nombre de cooks
                    if (requiredGuestsMeal["cooks"]["nbRemainingPlaces"] + cookDelta < 0): #si il y a plus d'inscrit que de places qu'on souhaite mettre pour le repas, on abort (protection supplémentaire, vu que le front-end le fait déjà)
                        abort(403)
                    else:
                        requiredGuestsUpdate["cooks"]["nbRemainingPlaces"] = requiredGuestsMeal["cooks"]["nbRemainingPlaces"] + cookDelta #sinon, on rajoute le nombre de Remaining places à actualiser
                else: #s'il n'y avait pas d'aides cuisines avant
                    if ("timeCooking" not in (requiredGuestsUpdate["cooks"] and requiredGuestsMeal["cooks"])):
                        abort(403)
                    else:
                        cookDelta = requiredGuestsUpdate["cooks"]["nbRquCooks"] # requiredGuestsMeal["cooks"]["nbRquCooks"] = 0
                        requiredGuestsUpdate["cooks"]["nbRemainingPlaces"] = cookDelta #on rajoute dans ce qu'il y a à update la key nbRemainingPlaces avec comme value le nbRquCooks (requiredGuestsMeal["cooks"]["nbRemainingPlaces"]=0)
                ##on update nbGuests
                if ("nbGuests" in updates): # on ajoute le nbGuests à updates
                    updates["nbGuests"] += cookDelta
                else:
                    updates["nbGuests"] = original["nbGuests"] + cookDelta
                ##on update nbRemainingPlaces dans meal
                if ("nbRemainingPlaces" in updates): # on ajoute le nbGuests à updates
                    updates["nbRemainingPlaces"] += cookDelta
                else:
                    updates["nbRemainingPlaces"] = original["nbRemainingPlaces"] + cookDelta
        if ("cleaners" in requiredGuestsUpdate):
            if ("nbRquCleaners" in requiredGuestsUpdate["cleaners"]): #si on change le nombre d'aide cuisine
                ##on update le nbRemainingPlaces dans privateInfo
                if ("cleaners" in requiredGuestsMeal): #si il y a déjà des aides cuisines dans le repas proposé (alors nbRquCleaners existe déjà)
                    cleanerDelta = requiredGuestsUpdate["cleaners"]["nbRquCleaners"] - requiredGuestsMeal["cleaners"]["nbRquCleaners"] #cleanerDelta est la variation du nombre de cleaners
                    if (requiredGuestsMeal["cleaners"]["nbRemainingPlaces"] + cleanerDelta < 0): #si il y a plus d'inscrit que de places qu'on souhaite mettre pour le repas, on abort (protection supplémentaire, vu que le front-end le fait déjà)
                        abort(403)
                    else:
                        requiredGuestsUpdate["cleaners"]["nbRemainingPlaces"] = requiredGuestsMeal["cleaners"]["nbRemainingPlaces"] + cleanerDelta #sinon, on rajoute le nombre de Remaining places à actualiser
                else: #s'il n'y avait pas d'aides cuisines avant
                    cleanerDelta = requiredGuestsUpdate["cleaners"]["nbRquCleaners"] # requiredGuestsMeal["cleaners"]["nbRquCleaners"] = 0
                    requiredGuestsUpdate["cleaners"]["nbRemainingPlaces"] = cleanerDelta #on rajoute dans ce qu'il y a à update la key nbRemainingPlaces avec comme value le nbRquCleaners (requiredGuestsMeal["cleaners"]["nbRemainingPlaces"]=0)
                ##on update nbGuests
                if ("nbGuests" in updates): # on ajoute le nbGuests à updates
                    updates["nbGuests"] += cleanerDelta
                else:
                    updates["nbGuests"] = original["nbGuests"] + cleanerDelta
                ##on update nbRemainingPlaces dans meal
                if ("nbRemainingPlaces" in updates): # on ajoute le nbGuests à updates
                    updates["nbRemainingPlaces"] += cleanerDelta
                else:
                    updates["nbRemainingPlaces"] = original["nbRemainingPlaces"] + cleanerDelta
        if ("simpleGuests" in requiredGuestsUpdate):
            if ("nbRquSimpleGuests" in requiredGuestsUpdate["simpleGuests"]): #si on change le nombre d'aide cuisine
                ##on update le nbRemainingPlaces dans privateInfo
                if ("simpleGuests" in requiredGuestsMeal): #si il y a déjà des aides cuisines dans le repas proposé (alors nbRquSimpleGuests existe déjà)
                    simpleGuestDelta = requiredGuestsUpdate["simpleGuests"]["nbRquSimpleGuests"] - requiredGuestsMeal["simpleGuests"]["nbRquSimpleGuests"] #simpleGuestDelta est la variation du nombre de simpleGuests
                    if (requiredGuestsMeal["simpleGuests"]["nbRemainingPlaces"] + simpleGuestDelta < 0): #si il y a plus d'inscrit que de places qu'on souhaite mettre pour le repas, on abort (protection supplémentaire, vu que le front-end le fait déjà)
                        abort(403)
                    else:
                        requiredGuestsUpdate["simpleGuests"]["nbRemainingPlaces"] = requiredGuestsMeal["simpleGuests"]["nbRemainingPlaces"] + simpleGuestDelta #sinon, on rajoute le nombre de Remaining places à actualiser
                else: #s'il n'y avait pas d'aides cuisines avant
                    simpleGuestDelta = requiredGuestsUpdate["simpleGuests"]["nbRquSimpleGuests"] # requiredGuestsMeal["simpleGuests"]["nbRquSimpleGuests"] = 0
                    requiredGuestsUpdate["simpleGuests"]["nbRemainingPlaces"] = simpleGuestDelta #on rajoute dans ce qu'il y a à update la key nbRemainingPlaces avec comme value le nbRquSimpleGuests (requiredGuestsMeal["simpleGuests"]["nbRemainingPlaces"]=0)
                ##on update nbGuests
                if ("nbGuests" in updates): # on ajoute le nbGuests à updates
                    updates["nbGuests"] += simpleGuestDelta
                else:
                    updates["nbGuests"] = original["nbGuests"] + simpleGuestDelta
                ##on update nbRemainingPlaces dans meal
                if ("nbRemainingPlaces" in updates): # on ajoute le nbGuests à updates
                    updates["nbRemainingPlaces"] += simpleGuestDelta
                else:
                    updates["nbRemainingPlaces"] = original["nbRemainingPlaces"] + simpleGuestDelta
        
    
def after_updating_privateMeals(updates, original):
    admin = User(_id=ObjectId(original["admin"])).getUserPublicInfo()
    meal_time_parse = parser.parse(original["time"]) #parse le format de l'heure venant du backend
    local_meal_time = meal_time_parse + timedelta(minutes=original["privateInfo"]["address"]["utc_offset"]) #on ajoute le delta avec le décallage horaire
    meal_time_formated = "{:%A, %B %d at %H:%M}".format(local_meal_time) #on met l'heure du repas sous bon format
    for participant in original["users"]:
        if (participant["status"] == "accepted"): #si le participant a été accepté et qu'il n'est pas l'hôte alors on lui envoie un message
            participantInfo = User(_id = ObjectId(participant["_id"])).getUserAllInfo()
            if("user_ref" in participantInfo["privateInfo"]):
                participant_user_ref = participantInfo["privateInfo"]["user_ref"]
                if (participant["role"][0] != "admin"):
                    text = "Hello " + participantInfo["first_name"] + ",\n" + admin["first_name"] + ", your host for the meal on " + meal_time_formated + ", has made a modification. Check it here : https://mycommuneaty.herokuapp.com/#!/my_meals/" + str(original["_id"])
                    payload = {'recipient': {'user_ref': participant_user_ref }, 'message': {'text': text}} # We're going to send this back to the 
                    requests.post('https://graph.facebook.com/v2.6/me/messages/?access_token=' + Application.app.config['TOKEN_POST_MESSENGER'], json=payload) # Lets send it
                elif(participant["role"][0] == "admin" and len(original["users"]) > 1):
                    text = "Hello " + participantInfo["first_name"] + ",\nWe notified your participants about the modification your made about the meal on " + meal_time_formated + "."
                    payload = {'recipient': {'user_ref': participant_user_ref }, 'message': {'text': text}} # We're going to send this back to the 
                    requests.post('https://graph.facebook.com/v2.6/me/messages/?access_token=' + Application.app.config['TOKEN_POST_MESSENGER'], json=payload) # Lets send it
    
### reviews ###
def after_storing_POST_reviews(items):
    addReviewRatingToUser(items[0]['forUser']['_id'], items[0]['forUser']['rating'])
    

### privateUsers resource ###
Application.app.on_pre_GET_privateUsers += pre_get_privateUsers
Application.app.on_pre_PATCH_privateUsers += pre_patch_privateUsers
### meals resource ###
Application.app.on_fetched_resource_meals +=  before_returning_GET_meals#
Application.app.on_fetched_item_meals +=  before_returning_GET_item_meal#
Application.app.on_insert_meals +=  before_storing_POST_meals
Application.app.on_inserted_meals +=  after_storing_POST_meals
### reviews resource ##
Application.app.on_inserted_reviews +=  after_storing_POST_reviews
### privateMeals ressource ###
Application.app.on_pre_GET_privateMeals += pre_get_privateMeals
Application.app.on_fetched_resource_privateMeals +=  before_returning_GET_privateMeals
Application.app.on_fetched_item_privateMeals +=  before_returning_GET_item_privateMeals
Application.app.on_pre_DELETE_privateMeals += pre_delete_privateMeals
Application.app.on_deleted_item_privateMeals += after_delete_privateMeals
Application.app.on_update_privateMeals += before_updating_privateMeals
Application.app.on_updated_privateMeals += after_updating_privateMeals
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
    meal = Meal(meal_id).getInfo()
    if (meal["automaticSubscription"] == False):
        dataSchema = {
            "requestRole":{
                "type": "string",
                "allowed":["cook","cleaner","simpleGuest"],
                "required": True
            },
            "request_message":{
                "type": "string",
                "required": True
            }
        }
    else:
        dataSchema = {
            "requestRole":{
                "type": "string",
                "allowed":["cook","cleaner","simpleGuest"],
                "required": True
            }
        }
    v= Validator(dataSchema)
    if not v.validate(rquData):
        return Response(status=400)
    else:
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
            meal_time_parse = parser.parse(meal["time"]) #parse le format de l'heure venant du backend
            local_meal_time = meal_time_parse + timedelta(minutes=meal["privateInfo"]["address"]["utc_offset"]) #on ajoute le décallage horaire
            meal_time_formated = "{:%A, %B %d at %H:%M}".format(local_meal_time) #on met l'heure du repas sous bon format
            if meal["automaticSubscription"] == True: #si acceptation automatique
                meal["users"].append({"_id":g.user_id,"role":[rquData["requestRole"]],"status":"accepted"})
                #code pour envoyer un message à l'hôte que quelqu'un s'est inscrit à son repas
                if meal["nbRemainingPlaces"] == 0: #si dernière place alors on précise que le meal est full
                    text = "Hello " + admin["first_name"] +",\n" + participant["first_name"] + " " + participant["last_name"] + " subscribed to your meal on " + meal_time_formated + ". Now, you meal is full."
                else: 
                    text = "Hello " + admin["first_name"] +",\n" + participant["first_name"] + " " + participant["last_name"] + " subscribed to your meal on " + meal_time_formated + "."
            else: #si acceptation manuelle
                meal["users"].append({"_id":g.user_id,"role":[rquData["requestRole"]],"status":"pending", "request_message": rquData["request_message"]})
                request_url_split = request.url.split("/")
                url_to_send = "https://" + request_url_split[2] + "/#!/my_meals/" + request_url_split[5]
                text = "Hello " + admin["first_name"] +",\n" + participant["first_name"] + " " + participant["last_name"] + " subscribed to your meal on " + meal_time_formated + ". Please, go to " + url_to_send + " to validate this one."
            Application.app.data.driver.db.meals.update_one({"_id":meal_id}, {"$set":meal}) #applique les changements pour le repas
            if("user_ref" in admin["privateInfo"]):
                admin_user_ref = admin["privateInfo"]["user_ref"] #user_ref de l'admin relatif au plugin checkbox messenger pour pouvoir le reconnaître            
                payload = {'recipient': {'user_ref': admin_user_ref }, 'message': {'text': text}} # We're going to send this back to the 
                requests.post('https://graph.facebook.com/v2.6/me/messages/?access_token=' + Application.app.config['TOKEN_POST_MESSENGER'], json=payload) # Lets send it
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
        return Response("Meal's admin is the only one who can validate a subscription",status=401)
    if admin.getUserPublicInfo()["_id"] == ObjectId(participant_id):
        return Response("Admin can not validate himself",status=400)
    if not(validation_result == True or validation_result == False):
        return Response("No validation has been passed in argument",status=400)
    else:
        admin = admin.getUserAllInfo()
        request_url_split = request.url.split("/")
        url_to_send = "https://" + request_url_split[2] + "/#!/my_meals/" + str(meal["_id"])
        meal_time_parse = parser.parse(meal["time"]) #parse le format de l'heure venant du backend
        local_meal_time = meal_time_parse + timedelta(minutes=meal["privateInfo"]["address"]["utc_offset"]) #on ajoute le décallage horaire
        meal_time_formated = "{:%A, %B %d at %H:%M}".format(local_meal_time) #on met l'heure du repas sous bon format
        for participant in meal["users"]:
            if participant["_id"] == ObjectId(participant_id):
                role = participant["role"]
                participantInfo = User(_id = ObjectId(participant_id)).getUserAllInfo()
                if validation_result == True:
                    participant["status"] = "accepted"
                    text = "Hello " + participantInfo["first_name"] + ",\nYour request to participate to " + admin["first_name"] + " " + admin["last_name"] + "'s meal on " + meal_time_formated + " has been approved. To see more details about the meal, click here : " + url_to_send
                elif validation_result == False:
                    meal["users"].remove(participant)
                    text = "Hello " + participantInfo["first_name"] + ",\nYour request to participate to " + admin["first_name"] + " " + admin["last_name"] + "'s meal on " + meal_time_formated + " has been denied. Let's try another one!"
                    meal["nbRemainingPlaces"] = meal["nbRemainingPlaces"] + 1 #on rajoute 1 place aux nombres totales de places restantes
                    meal["detailedInfo"]["requiredGuests"][role[0] + "s"]["nbRemainingPlaces"] =  meal["detailedInfo"]["requiredGuests"][role[0] + "s"]["nbRemainingPlaces"] + 1 #On remet la place utiliser par le participant qui était en attente et qui a été refusé
                if("user_ref" in participantInfo["privateInfo"]):
                    participant_user_ref = participantInfo["privateInfo"]["user_ref"]
                    payload = {'recipient': {'user_ref': participant_user_ref }, 'message': {'text': text}} # We're going to send this back to the 
                    requests.post('https://graph.facebook.com/v2.6/me/messages/?access_token=' + Application.app.config['TOKEN_POST_MESSENGER'], json=payload) # Lets send it
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
    elif user.isAdmin(meal=meal):
        return Response("Meal's admin cannot unsubscribe",status=401)
    else:
        meal["nbRemainingPlaces"] +=  1
        for u in meal["users"]: 
            if u["_id"] == user._id:
                roles = u["role"]
                meal["users"].remove(u)
                participant = User(_id=ObjectId(user._id)).getUserPublicInfo()
                admin = User(_id = meal["admin"]).getUserAllInfo()
                if("user_ref" in admin["privateInfo"]):
                    meal_time_parse = parser.parse(meal["time"]) #parse le format de l'heure venant du backend
                    local_meal_time = meal_time_parse + timedelta(minutes=meal["privateInfo"]["address"]["utc_offset"]) #on ajoute le décallage horaire
                    meal_time_formated = "{:%A, %B %d at %H:%M}".format(local_meal_time) #on met l'heure du repas sous bon format
                    admin_user_ref = admin["privateInfo"]["user_ref"]
                    text = "Hello " + admin["first_name"] +",\n" + participant["first_name"] + " " + participant["last_name"] + " unsubscribed to your meal on " + meal_time_formated + "."
                    payload = {'recipient': {'user_ref': admin_user_ref }, 'message': {'text': text}} # We're going to send this back to the 
                    requests.post('https://graph.facebook.com/v2.6/me/messages/?access_token=' + Application.app.config['TOKEN_POST_MESSENGER'], json=payload) # Lets send it
                break
        for r in roles :
            meal["detailedInfo"]["requiredGuests"][r + "s"]["nbRemainingPlaces"] +=1
        Application.app.data.driver.db.meals.update_one({"_id":meal_id}, {"$set":meal})
        return Response(status=200)
        
# Caculate dynamically the price of a meal
@Application.app.route('/api/meals/<meal_id>/calculateMealPrice', methods=['GET'])
@requires_auth('ressource')
def calculate_price_meal(meal_id):
    meal_id = ObjectId(meal_id)
    meal = Meal(meal_id).getInfo()
    priceUnit = float(meal["price"]) / meal["nbGuests"] #on rajoute float pour avoir un priceUnit à virgule
    priceTotalCurrent = priceUnit * (meal["nbGuests"] - meal["nbRemainingPlaces"])
    if ("simpleGuests" in meal["detailedInfo"]["requiredGuests"]):
        nbSimpleGuests = meal["detailedInfo"]["requiredGuests"]["simpleGuests"]["nbRquSimpleGuests"] - meal["detailedInfo"]["requiredGuests"]["simpleGuests"]["nbRemainingPlaces"]
    else:
        nbSimpleGuests = 0
    if ("cooks" in meal["detailedInfo"]["requiredGuests"]):
        nbCooks = meal["detailedInfo"]["requiredGuests"]["cooks"]["nbRquCooks"] - meal["detailedInfo"]["requiredGuests"]["cooks"]["nbRemainingPlaces"]
    else:
        nbCooks = 0
    if ("cleaners" in meal["detailedInfo"]["requiredGuests"]):
        nbCleaners = meal["detailedInfo"]["requiredGuests"]["cleaners"]["nbRquCleaners"] - meal["detailedInfo"]["requiredGuests"]["cleaners"]["nbRemainingPlaces"]
    else:
        nbCleaners = 0
    price = calculator.resolve(nbSimpleGuests, nbCooks, nbCleaners, priceTotalCurrent) #obtention du prix par type d'aide
    return Response(response=json.dumps(price), status=200)
    
        
        
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
      #r = requests.post('https://graph.facebook.com/v2.6/me/messages/?access_token=' + Application.app.config['TOKEN_POST_MESSENGER'], json=payload) # Lets send it
    except Exception as e:
      print traceback.format_exc() # something went wrong
  elif request.method == 'GET': # For the initial verification
    if request.args.get('hub.verify_token') == '2093843HREKJFBD0Ujnfdfkjdbfkdfu9320948340983ckdnd3POI23J2K3Ndkdklfjeiou0989032U4H3HBdbdjodh0909UJ89JDJ':
      return request.args.get('hub.challenge')
    return "Wrong Verify Token"
  return "Hello World" #Not Really Necessary

if __name__ == '__main__':
    Application.app.run(host='0.0.0.0', port=8080)