
class Config(object):
    DEBUG = False
    TESTING = False
    CSRF_ENABLED = True
    SECRET_KEY = 'this-really-needs-to-be-changed'


class ProductionConfig(Config):
    DEBUG = False
    MONGOLAB_URI= "mongodb://heroku_dnnkp4sr:6s6svorb6cdq990q4i0kaoar1t@ds039185.mongolab.com:39185/heroku_dnnkp4sr"


class StagingConfig(Config):
    DEVELOPMENT = True
    DEBUG = True


class DevelopmentConfig(Config):
    DEVELOPMENT = True
    DEBUG = True
    MONGOLAB_URI= 'mongodb://localhost/Shrt'


class TestingConfig(Config):
    TESTING = True
