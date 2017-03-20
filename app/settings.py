
RESOURCE_METHODS = ['GET', 'POST']
ITEM_METHODS = ['GET', 'PATCH', 'PUT', 'DELETE']
HATEOAS=False
#to enable concurrency control
IF_MATCH = False
URL_PREFIX="api"
DEBUG = True


"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
Schema
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

schemaMeals = {
    # Schema definition, based on Cerberus grammar. Check the Cerberus project
    # (https://github.com/nicolaiarocci/cerberus) for details.
    'menu': {
        'type': 'string',
        'required': True,
        'empty': False
    },
    'veggies': {
        'type': 'boolean'
    },
    'town': {
        'type': 'string',
    },
    'admin': { #mettre data relation
        'type': 'objectid'
    },
    'addressApprox': {
        'type': 'string',
        'required': True,
        'empty': False
    },
    'time': {
        'type': 'string',
        'required': True,
        'empty': False
    },
    'price': {
        'type': 'number',
        'min': 0,
        'required': True,
        'empty': False
    },
    'nbGuests': {
        'type': 'number',
        'min': 1,
        'readonly':True
    },
    'nbRemainingPlaces': {
        'type': 'number',
        'min': 0,
        'readonly': True
    },
    'privateInfo':{
        'type': 'dict',
        'required':True,
        'schema':{
            'address': {
                'type':'string',
                'required':True,
                'empty': False
            },
            'adminPhone':{'type':'string'},
            'users':{
                'type':'list',
                'schema': {
                    'type':'dict',
                    'schema':{
                        '_id':{ #mettre data relation
                        'type':'objectid',
                        'required':True
                        },
                        'role': {
                            'type': 'list',
                        'allowed': ["admin", "cook", "cleaner","simpleGuest"]
                       }
                    }
                }
            }
        }
    },
    'detailedInfo':{
        'type': 'dict',
        'required':True,
        'schema':{
            'requiredGuests': {
                'type':'dict',
                'schema':{
                    'hosts':{
                        'type':'dict',
                        'schema':{
                            'price':{
                                'type':'number',
                                'min':0,
                                'readonly':True,
                            }                        
                        }
                    },
                    'cleaners':{
                        'type':'dict',
                        'schema':{
                            'nbRemainingPlaces':{
                                'type':'number',
                                'min':0,
                                'readonly':True
                            },
                            'nbRquCleaners':{
                                'type':'number',
                                'min':0
                            },
                            'price':{
                                'type':'number',
                                'min':0,
                                'readonly':True
                            }                        
                        }
                    },
                    'cooks':{
                        'type':'dict',
                        'schema':{
                            'nbRemainingPlaces':{
                                'type':'number',
                                'min':0,
                                'readonly':True
                            },
                            'nbRquCooks':{
                                'type':'number',
                                'min':0,
                                'required': True
                            },
                            'timeCooking':{
                                'type':'string',
                                'required':True
                            },                            
                            'price':{
                                'type':'number',
                                'min':0,
                                'readonly':True
                            }                        
                        }
                    },
                    'simpleGuests':{
                        'type':'dict',
                        'schema':{
                            'nbRemainingPlaces':{
                                'type':'number',
                                'min':0,
                                'readonly':True
                            },
                            'nbRquSimpleGuests':{
                                'type':'number',
                                'min':0
                            },
                            'price':{
                                'type':'number',
                                'min':0,
                                'readonly':True
                            }                        
                        }
                    }
                }
            }
        }
    }
}

schemaUsers = {
    '_id': {
        'type': 'objectid',
        'readonly': True
    },
    'first_name': {
        'type': 'string'
    },
    'last_name': {
        'type': 'string'
    },
    'gender': {
        'type': 'string',
        'allowed': ["male","female"]
    },
    'privateInfo': {
        'type': 'dict',
        'schema':{
            'facebook_id': {
                'type':'string'
            },
            'email':{'type': 'string', 'regex': '^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'},
            'link':{'type': 'string'}
        }
    },
    'picture': {
        'type': 'dict',
        'schema':{
            'data': {
                'type':'dict',
                'schema':{
                    "url":{'type':'string'},
                    'is_silhouette':{'type':'boolean'}
                }
            }
        }
    }
}



meals = {
    # most global settings can be overridden at resource level
    'resource_methods': ['GET', 'POST'],
    'item_methods' : ['GET'],
    'schema': schemaMeals,
    'datasource':{
        'source': 'meals',
        'projection': {
            'privateInfo':0
        }
    }
}

privateMeals = {
    'url':'meals/private',
    'resource_methods': ['GET'],
    'schema': schemaMeals,
    'item_methods' : ['GET','PATCH','DELETE'],
    'datasource':{
        'source': 'meals'
    }
}

privateUsers = {
    'url':'users/private',
    'resource_methods': ['GET'],
    'schema': schemaUsers,
    'item_methods' : [],
    'datasource':{
        'source': 'users'
    }
}

DOMAIN={
    'meals':meals,
    'privateMeals':privateMeals,
    'privateUsers':privateUsers
}