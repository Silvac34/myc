
class Config(object):
    DEBUG = False
    TESTING = False
    CSRF_ENABLED = True
    SECRET_KEY = 'this-really-needs-to-be-changed'


class ProductionConfig(Config):
    DEBUG = False
    MONGOLAB_URI= 'mongodb://heroku_vknn5pq1:50c48g7502ntf36121kr3lsdjl@ds039115.mongolab.com:39115/heroku_vknn5pq1'


class StagingConfig(Config):
    DEVELOPMENT = True
    DEBUG = True
    MONGOLAB_URI= 'mongodb://heroku_vq02xq85:phef1orvvvjfa82fneb4ejq0hk@ds039195.mongolab.com:39195/heroku_vq02xq85'


class DevelopmentConfig(Config):
    DEVELOPMENT = True
    DEBUG = True
    MONGOLAB_URI= 'mongodb://localhost/Shrt'


class TestingConfig(Config):
    TESTING = True
