
RESOURCE_METHODS = ['GET', 'POST']
ITEM_METHODS = ['GET', 'PATCH', 'PUT', 'DELETE']
HATEOAS=False
#to enable concurrency control
IF_MATCH = True
ENFORCE_IF_MATCH = True
URL_PREFIX="api"
DEBUG = True


"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
Schema
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

schemaMeals = {
    # Schema definition, based on Cerberus grammar. Check the Cerberus project
    # (https://github.com/nicolaiarocci/cerberus) for details.
    'menu': {
        'type': 'dict',
        'required':True,
        'schema':{
            'title': {
                'type':'string',
                'required':True,
                'empty': False
            },
            'description': {
                'type':'string'
            },
        }
    },
    'veggies': {
        'type': 'boolean'
    },
    'vegan': {
        'type': 'boolean'
    },
    'admin': { #mettre data relation
        'type': 'objectid'
    },
    'address': {
        'type': 'dict',
        'required':True,
        'empty': False,
        'schema':{
            'town': {
                'type':'string',
                'required':True,
                'empty': False
            },
            'lat':{
                'type':'number',
                'required': True,
                'empty': False
            },
            'lng':{
                'type':'number',
                'required': True,
                'empty': False
            },
            'country_code':{
                'type':'string',
                'required': True,
                'empty': False
            },
            'postalCode':{
                'type':'string'
            },
        }
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
    'time': {
        'type': 'string',
        'required': True,
        'empty': False
    },
    'automaticSubscription': {
        'type': 'boolean',
        'required': True
    },
    'privateInfo':{
        'type': 'dict',
        'required':True,
        'schema':{
            'address': {
                'type':'dict',
                'required':True,
                'empty': False,
                'schema':{
                    'name': {
                        'type': 'string',
                        'required':True,
                        'empty': False,
                    },
                    'lat':{
                        'type':'number',
                        'required': True,
                        'empty': False
                    },
                    'lng':{
                        'type':'number',
                        'required': True,
                        'empty': False
                    },
                    'complement':{
                        'type':'string'
                    }
                }
            },
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
                       },
                       'status': {
                           'type': 'string',
                           'allowed': ["accepted", "refused", "pending"]
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
    'country_of_origin':{
        'type':'dict',
        'schema':{
            'name':{
                'type': 'string'
            },
            'url':{
                'type': 'string'
            },
            'flag_url':{
                'type': 'string'
            },
            'code':{
                'type': 'string'
            }
        }
    },
    'birthdate':{
        'type': 'string'
    },
    'presentation':{
        'type': 'string'
    },
    'whymycommuneaty':{
        'type': 'string'
    },
    'facebook_id': {
        'type':'string'
            },
    'link':{
        'type': 'string'
            },
    'privateInfo': {
        'type': 'dict',
        'schema':{
            'email':{
                'type': 'string', 'regex': '^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
            },
            'cellphone':{
                'type': 'string', 'regex': '^((\+\d{1,3}(-| )?\(?\d\)?(-| )?\d{1,5})|(\(?\d{2,6}\)?))(-| )?(\d{3,4})(-| )?(\d{4})(( x| ext)\d{1,5}){0,1}$'
            },
            'user_ref':{
                'type': 'string'
            },
            'city_notification_preference':{
                'type': 'list'
            },
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
    'public_item_methods': ['GET'],
    'public_methods' : ['GET'],
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

users = {
    'public_item_methods': ['GET'],
    'public_methods' : ['GET'],
    'schema': schemaUsers,
    'datasource':{
        'source': 'users',
        'projection': {
            'privateInfo':0
        }
    }
}

privateUsers = {
    'url':'users/private',
    'resource_methods': ['GET'],
    'schema': schemaUsers,
    'item_methods' : ['GET','PATCH'],
    'datasource':{
        'source': 'users'
    }
}

DOMAIN={
    'meals':meals,
    'users':users,
    'privateMeals':privateMeals,
    'privateUsers':privateUsers
}