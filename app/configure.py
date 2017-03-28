import os

#Contains the project environments' configuration
class Config(object):
    DEBUG = False
    TESTING = False
    CSRF_ENABLED = True
    SECRET_KEY = os.urandom(24) # set the secret key for the cookie session:


class ProductionConfig(Config):
    DEBUG = False
    #We use MLab as a database as a service
    MONGO_URI= 'mongodb://dkohn:SharEat3santiago@ds131340.mlab.com:31340/mycommuneatydb_prod'
    TOKEN_SECRET= 'kmaillet230191dkohn1003dflklqksdoklc'
    FACEBOOK_SECRET='5c9c6aae00e33c0daec661d2095d0d6a'

class StagingConfig(Config):
    DEVELOPMENT = True
    DEBUG = True
    MONGO_URI= 'mongodb://dkohn:SharEat3santiago@ds129600.mlab.com:29600/mycommuneatydb_stage'
    TOKEN_SECRET= 'kmaillet230191dkohn1003dflklqksdoklc'
    FACEBOOK_SECRET= '4a944b87ba3cec1475019cc8cdd16bed'

class DevelopmentConfig(Config):
    DEVELOPMENT = True
    DEBUG = True
    MONGO_URI= 'mongodb://dkohn:SharEat3santiago@ds131320.mlab.com:31320/mycommuneatydb_dev'
    TOKEN_SECRET= 'kmaillet230191dkohn1003dflklqksdoklc'
    FACEBOOK_SECRET= '6f748f72ff723b0b9d11997a6b2c0a37'

class DevelopmentKev(Config):
    DEVELOPMENT = True
    DEBUG = True
    MONGO_URI= 'mongodb://shareat:kmaillet230191@ds019498.mlab.com:19498/shareat_dev'
    #MONGOLAB_URI_TEST = 'mongodb://shareat:kmaillet230191@ds055872.mlab.com:55872/shareat_dev_test'
    TOKEN_SECRET= 'kmaillet230191dkohn1003dflklqksdoklc'
    FACEBOOK_SECRET= 'f97f2cc3e469c9675b9d5b9f0b57ba21'

class TestingConfig(Config):
    TESTING = True
