#Contains the project environments' configuration
class Config(object):
    DEBUG = False
    TESTING = False
    CSRF_ENABLED = True
    SECRET_KEY = 'this-really-needs-to-be-changed'


class ProductionConfig(Config):
    DEBUG = False
    #We use MLab as a database as a service
    MONGOLAB_URI= 'mongodb://shareat:kmaillet230191@ds055782.mlab.com:55782/shareat_prod'
    TOKEN_SECRET= 'kmaillet230191dkohn1003dflklqksdoklc'
    FACEBOOK_SECRET='5c9c6aae00e33c0daec661d2095d0d6a'


class StagingConfig(Config):
    DEVELOPMENT = True
    DEBUG = True
    MONGOLAB_URI= 'mongodb://shareat:kmaillet230191@ds019498.mlab.com:19498/shareat_stage'
    TOKEN_SECRET= 'kmaillet230191dkohn1003dflklqksdoklc'
    FACEBOOK_SECRET= '4a944b87ba3cec1475019cc8cdd16bed'

class DevelopmentConfig(Config):
    DEVELOPMENT = True
    DEBUG = True
    MONGOLAB_URI= 'mongodb://shareat:kmaillet230191@ds055782.mlab.com:55782/shareat-dev_dim'
    TOKEN_SECRET= 'kmaillet230191dkohn1003dflklqksdoklc'
    FACEBOOK_SECRET= '6f748f72ff723b0b9d11997a6b2c0a37'

class DevelopmentKev(Config):
    DEVELOPMENT = True
    DEBUG = True
    MONGOLAB_URI= 'mongodb://shareat:kmaillet230191@ds019498.mlab.com:19498/shareat_dev'
    MONGOLAB_URI_TEST = 'mongodb://shareat:kmaillet230191@ds055872.mlab.com:55872/shareat_dev_test'
    TOKEN_SECRET= 'kmaillet230191dkohn1003dflklqksdoklc'
    FACEBOOK_SECRET= 'f97f2cc3e469c9675b9d5b9f0b57ba21'

class TestingConfig(Config):
    TESTING = True
