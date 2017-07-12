import os

#Contains the project environments' configuration
class Config(object):
    DEBUG = False
    TESTING = False
    CSRF_ENABLED = False
    SECRET_KEY = os.urandom(24) # set the secret key for the cookie session:

class ProductionConfig(Config):
    DEBUG = False
    #We use MLab as a database as a service
    MONGO_URI= 'mongodb://dkohn:SharEat3santiago@ds131340.mlab.com:31340/mycommuneatydb_prod'
    TOKEN_SECRET= 'kmaillet230191dkohn1003dflklqksdoklc'
    FACEBOOK_SECRET='5c9c6aae00e33c0daec661d2095d0d6a'
    TOKEN_POST_MESSENGER = 'EAAVynZAjdOe0BAHR0zDRsqWokHZCbRLjiReLKVJtHgzd4e4mBK4dkukc5Y9kIZBI03CpDZC7bls5csrofuLo2RGX30PlLQ8HDhXACexavuftmQjiwMSbq9872gIZBKe2FHM4nZCEUCfttAkfi2jlBSt1NZBXulabrjTEBBfatb3JAZDZD'
    

class StagingConfig(Config):
    DEVELOPMENT = True
    DEBUG = True
    MONGO_URI= 'mongodb://dkohn:SharEat3santiago@ds129600.mlab.com:29600/mycommuneatydb_stage'
    TOKEN_SECRET= 'kmaillet230191dkohn1003dflklqksdoklc'
    FACEBOOK_SECRET= '4a944b87ba3cec1475019cc8cdd16bed'
    TOKEN_POST_MESSENGER = 'EAAWHDetyr7YBAKduUMKBiuFk7FqKbDfigW1MMqmQvlWZAF26zZApJkIqnEKdZCqDmrywJaOzLjlPArwfA5eUZAnWZCZCZCjyposWov3TnVr5VHKqVwXj8MrdOhS1zBFNal1Q5f8aNESajoIuF7n6uHyjiT9QQWmeWmhYDMdkyTOLwZDZD'

class DevelopmentConfig(Config):
    DEVELOPMENT = True
    DEBUG = True
    MONGO_URI= 'mongodb://dkohn:SharEat3santiago@ds131340.mlab.com:31340/mycommuneatydb_prod'#'mongodb://dkohn:SharEat3santiago@ds131320.mlab.com:31320/mycommuneatydb_dev'
    TOKEN_SECRET= 'kmaillet230191dkohn1003dflklqksdoklc'
    FACEBOOK_SECRET= 'a05904a7ccd49a328f24d60e4d07628a'
    TOKEN_POST_MESSENGER='EAAWHDX9daxYBAP2NU6nCaGZBwBZAYYSr8pR9vzGWmumWsq7lmWySNVE1gvRZCXSWKizxOvmQCfYasklZCM8v5KAb4oFtdGUe9CF26xzbr0ywmHN42fUZBuwGn47jY4WkYMGbFPHcr2K68ZAbonVzFlsJLBiZA9VlusTLtJhhTaNcAZDZD'

class TestingConfig(Config):
    TESTING = True
