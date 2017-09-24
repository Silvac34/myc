'use strict';
const angular = require('angular');
//css//
//require('./dist/bootstrap.bundle.js');
//require('./css/app.css');
require('font-awesome-webpack!./css/font-awesome/font-awesome.config.js');
//require('./bower_components/font-awesome/css/font-awesome.min.css');
//controllers//
require('./welcome/welcome.js');
require('./viewCreateMeal/viewCreateMeal.js');
require('./viewMeals/viewMeals.js');
require('./viewMeals/viewMealsDtld/viewMealsDtld.js');
require('./viewMyMeals/viewMyMeals.js');
require('./viewMyMeals/viewMyMealsDtld/viewMyMealsDtld.js');
require('./viewLogin/viewLogin.js');
require('./profile/viewProfile.js');
require('./viewLeaveReviews/viewLeaveReviews.js');
require('./viewManageRequests/viewManageRequests.js');
//components//
require('./components/getAgeService.js');
require('./components/currencySymbolService.js');
require('./components/dateDropdownService.js');
require('./components/facebookService.js');
require('./components/getReviewService.js');
require('./components/userServices.js');
//bower-components//
/*require('./bower_components/angular/angular.min.js');
require('./bower_components/angular-sanitize/angular-sanitize.min.js');
require('./bower_components/angular-ui-router/release/angular-ui-router.min.js');
require('./bower_components/satellizer/satellizer.min.js');
require('./bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js');
require('./bower_components/angular-animate/angular-animate.min.js');
require('./bower_components/angular-svg-round-progressbar/build/roundProgress.min.js');
require('./bower_components/angular-filter/dist/angular-filter.min.js');
require('./bower_components/angular-loading-bar/build/loading-bar.js');
require('./bower_components/angular-easyfb/build/angular-easyfb.min.js');
require('./bower_components/ngAutocomplete/src/ngAutocomplete.js');
require('./bower_components/ngmap/build/scripts/ng-map.min.js');*/

var translationsEN = {
  "INDEX": {
    "ACTION_BUTTON": {
      "SIGN_IN_1": "@: VIEW_MEALS.ACTION_BUTTON.SIGN_IN_2",
      "SIGN_IN_2": 'with facebook',
    },
    "HELLO": 'Hi',
    "MY_MEALS": 'My meals',
    "PROFILE": 'My profile ',
    "MANAGE_REQUESTS": 'Manage requests',
    "LEAVE_REVIEWS": 'Leave reviews',
    "LOGOUT": 'Logout',
    "CREATE_A_MEAL": 'Create a meal',
    "BROWSE_A_MEAL": 'Browse a meal',
    "SLOGAN_1": 'And the last time you ate with someone new ?',
    "SLOGAN_2": 'When was the last time you met someone new ?',
    "FOOTER": {
      "INFORMATION": {
        "TITLE": 'Information',
        "CONCEPT": 'Concept',
        "TEAM_HISTORY": 'Team & History',
        "FAQ": 'FAQ'
      },
      "SUPPORT": {
        "TITLE": 'Support',
        "GUIDELINES": 'Guidelines',
        "GENERAL_POLICIES": 'General Policies',
        "PRIVACY_POLICY": 'Privacy Policy',
        "TERMS_OF_USE": 'Terms of use'
      },
      "MORE": {
        "TITLE": 'More',
        "PHOTO_GALLERY": 'Photo gallery',
        "CAREERS_FEEDBACKS": 'Careers & Feedbacks',
        "CONTACT_US": 'Contact us'
      },
      "LANGUAGE": {
        "TITLE": 'Language'
      },
      "SHARE": 'Share myCommuneaty on'
    }
  },
  "WELCOME": {
    "CREATE_A_MEAL": 'create a meal',
    "BROWSE_A_MEAL": 'browse a meal',
    "HOW_IT_WORKS": 'How it works',
    "PUBLICATION": {
      "TITLE": 'Publication',
      "PARAGRAPH": 'A member publishes a meal, choosing the number of participants and their roles.'
    },
    "SUBSCRIPTION": {
      "TITLE": 'Subscription',
      "PARAGRAPH": 'Others members subscribe, selecting the role they want to take.'
    },
    "PARTICIPATION": {
      "TITLE": 'Participation',
      "PARAGRAPH": 'Let’s enjoy, preparing together and eating together the meal.'
    },
    "DIFFERENT_ROLES": {
      "TITLE": '4 different roles',
      "HOST": {
        "NAME": 'Host',
        "DESCRIPTION": 'The Host is the one who organizes the meal and receives at home. He is in charge of the groceries.'
      },
      "HELP_COOKING": {
        "NAME": 'Help cooking',
        "DESCRIPTION": 'The Help cooking are helpers guests. They will arrive earlier in order to help the host to cook.'
      },
      "HELP_CLEANING": {
        "NAME": 'Help cleaning',
        "DESCRIPTION": 'The Help cleaning are helpers guests. They will help the host to clean the dishes and order.'
      },
      "SIMPLE_GUEST": {
        "NAME": 'Simple guest',
        "DESCRIPTION": 'The Simple guests are guests. They won’t help the host but they will pay a little bit more.'
      },
    },
    "WHAT_ABOUT_MONEY": {
      "TITLE": 'What about the money ?',
      "PARAGRAPH": 'The price of the groceries is shared between the participants.',
      "WITHOUT_SIMPLE_GUEST": {
        "TITLE": 'Without simple guests',
        "PARAGRAPH": 'Everybody pays the same.'
      },
      "WITH_SIMPLE_GUEST": {
        "TITLE": 'With simple guests',
        "PARAGRAPH": 'Simple guests pay a little bit more and this surplus is shared between the host and the helpers.'
      },
      "PARAGRAPH_2": 'You pay directly to the host who bought the groceries.',
      "PARAGRAPH_2_STRONG": 'THERE ARE NO WEBSITE FEES. Our service is completely free.'
    },
    "VALUES": {
      "TITLE": 'values',
      "MEETING": {
        "NAME": 'MEETING',
        "DESCRIPTION": 'Meet gorgeous people from all over the world'
      },
      "SHARING": {
        "NAME": 'SHARING',
        "DESCRIPTION": 'Share together the meal but also its preparation and the price of the groceries'
      },
      "AUTHENTICITY_SIMPLICITY": {
        "NAME_1": 'AUTHENTICITY',
        "NAME_2": '& SIMPLICITY',
        "DESCRIPTION": 'Enjoy homemade food. All level of cookers are welcomed to organize meals'
      },
      "FRIENDLINESS": {
        "NAME": 'FRIENDLINESS',
        "DESCRIPTION": 'Organize or participate to meals from three participants to many more'
      },
      "COMMUNITY": {
        "NAME": 'COMMUNITY',
        "DESCRIPTION": 'Join events where all the members of myCommuneaty are invited'
      },
      "NEW": {
        "NAME": 'NEW',
        "DESCRIPTION": 'Join us to start together this amazing adventure, launched in April 2017'
      }
    }
  },

  "CREATE_A_MEAL": {
    "TITLE": '- Create a new meal -',
    "FORM": {
      "PUBLIC_INFO": 'Public information',
      "MENU_TITLE": 'Title of your menu',
      "MENU_DESCRIPTION": 'Menu description (optional)',
      "SPECIAL_MEAL": {
        "TITLE": 'Special meal? ',
        "TOOLTIP": 'do not check if not'
      },
      "VEGETARIAN": 'Vegetarian',
      "VEGAN": 'Vegan',
      "KOSHER": 'Kosher',
      "HALAL": 'Halal',
      "DATE": 'Date',
      "TIMEPICKER_TITLE": 'Time of the meal',
      "PARTICIPANTS": 'Participants',
      "ARRIVAL_TIME": 'Arrival time',
      "HOST": {
        "NAME": 'Host (you)'
      },
      "HELP_COOKING": {
        "NAME": "@:WELCOME.DIFFERENT_ROLES.HELP_COOKING.NAME",
        "TOOLTIP": 'People will help you for cooking'
      },
      "HELP_CLEANING": {
        "NAME": "@:WELCOME.DIFFERENT_ROLES.HELP_CLEANING.NAME",
        "TOOLTIP": 'People will help you for cleaning'
      },
      "SIMPLE_GUEST": {
        "NAME": "@:WELCOME.DIFFERENT_ROLES.SIMPLE_GUEST.NAME",
        "TOOLTIP": 'People will help you for cleaning'
      },
      "TOTAL": 'Total',
      "GROCERIES_PRICE": 'Price of the groceries',
      "PRIVATE_INFO": 'Private information: displayed only to participants',
      "ADDRESS": 'Address',
      "ADDRESS_COMPLEMENT": 'Additional information (flat number, floor, ...)',
      "CELLPHONE": {
        "NAME": 'Cellphone',
        "TOOLTIP": 'Private information: displayed only for participants'
      },
      "ERROR": {
        "TITLE_1": 'Please fill the missing field',
        "TITLE_2": 's', //if there are more than 1 error field
        "TITLE_3": 'and try again: ',
        "MENU": 'Menu',
        "GROCERIES_PRICE": 'price of the groceries',
        "ADDRESS": 'Address',
        "ARRIVAL_TIME_HELP_COOKING": 'arrival time for help cooking',
        "CELLPHONE": 'phone number',
        "INCORRECT_CELLPHONE": 'Your phone number is incorrect.'
      },
      "NOTIFICATIONS": {
        "TITLE": 'Notifications',
        "AUTOMATIC_BOOKING": {
          "TITLE": 'Automatically approve bookings?',
          "NO": 'No, thanks. ',
          "NO_TOOLTIP": 'You approve each booking request yourself',
          "YES": 'Yes, sure !'
        },
        "MESSENGER_1": 'Do you want to receive updates about the meal on messenger?',
        "MESSENGER_2": '(highly recommended)',
        "MESSENGER_ALREADY": 'You already subscribed for receiving updates through messenger.',
      },
      "PUBLISH": 'Publish the meal',
      "PUBLISH_NOT_CONNECTED": 'Sign In with facebook and',
    }
  },
  "VIEW_MEALS": {
    "TITLE": 'Incoming meals',
    "ORDER_BY": {
      "NAME": 'Order by',
      "POPOVER": 'Starting time'
    },
    "FILTERS": {
      "NAME": 'Filters',
      "FILTER_BY": 'Filter by',
      "CITY": {
        "TITLE": 'City',
        "PLACEHOLDER": 'City, Suburb...',
        "TITLE_MOBILE": 'Chose a city'
      },
      "DAY": {
        "TITLE": 'Day',
        "TITLE_MOBILE": 'Chose the days of the week',
      },
      "PERIOD": {
        "TITLE": 'Period',
        "TITLE_MOBILE": 'Chose a period',
        "PLACEHOLDER_FROM": 'From',
        "PLACEHOLDER_TO": 'To'
      },
      "PRICE": {
        "TITLE": 'Price',
        "TITLE_MOBILE": 'Chose a price range',
        "PLACEHOLDER_FROM": "From",
        "PLACEHOLDER_TO": "To"
      },
      "PREFERENCES": {
        "TITLE": 'Preferences',
        "TITLE_MOBILE": 'Meal preferences',
        "VEGETARIAN": "@:CREATE_A_MEAL.FORM.VEGETARIAN",
        "VEGAN": "@:CREATE_A_MEAL.FORM.VEGAN",
        "KOSHER": "@:CREATE_A_MEAL.FORM.KOSHER",
        "HALAL": "@:CREATE_A_MEAL.FORM.HALAL",
      },
      "HELP_TYPE": {
        "TITLE": 'Type of help',
        "HELP_COOKING": "@:WELCOME.DIFFERENT_ROLES.HELP_COOKING.NAME",
        "HELP_COOKING_MOBILE": "Cooking",
        "HELP_CLEANING": "@:WELCOME.DIFFERENT_ROLES.HELP_CLEANING.NAME",
        "HELP_CLEANING_MOBILE": "Cleaning",
        "SIMPLE_GUEST": "@:WELCOME.DIFFERENT_ROLES.SIMPLE_GUEST.NAME",
      },
      "VALIDATE": 'Validate',
      "REINITIALIZE": 'Reinitialize'
    },
    "MAP": 'Map',
    "LIST": 'List',
    "CHANGE_VIEW_MAP": 'See meals on a map',
    "CHANGE_VIEW_LIST": 'See the list of meals',
    "REQUEST_SUCCESS": "Your request has been sent to the host.",
    "NO_INCOMING_MEALS_1": 'There are no incoming meals but you can',
    "CREATE_YOUR_MEAL": 'Create your own meal',
    "NO_INCOMING_MEALS_2": 'and enjoy meeting new people from all over the world',
    "ATTENDING": 'Attending',
    "PENDING": 'Pending',
    "ATTENDED": 'Attended',
    "HOSTING": 'Hosting',
    "HOSTED": 'Hosted',
    "VEGETARIAN_MEAL": 'Vegetarian meal',
    "VEGAN_MEAL": 'Vegan meal',
    "HALAL_MEAL": 'Halal meal',
    "KOSHER_MEAL": 'Kosher meal',
    "HOST": 'The host',
    "ACTION_BUTTON": {
      "SEE_MEAL": 'See meal',
      "MEAL_FULL": 'The meal is already full!',
      "SIGN_IN_1": 'Please',
      "SIGN_IN_2": 'Sign In',
      "SIGN_IN_3": 'if you already subscribed.',
    }
  },
  "VIEW_MEALS_DTLD": {
    "DESCRIPTION": 'Description',
    "VEGETARIAN_MEAL": "@:VIEW_MEALS.VEGETARIAN_MEAL",
    "VEGAN_MEAL": "@:VIEW_MEALS.VEGAN_MEAL",
    "HALAL_MEAL": "@:VIEW_MEALS.HALAL_MEAL",
    "KOSHER_MEAL": "@:VIEW_MEALS.KOSHER_MEAL",
    "INSCRIPTION": {
      "TITLE": 'Inscription as :',
      "TOOLTIP": {
        "PARTICIPANTS": "@:CREATE_A_MEAL.PARTICIPANTS",
        "PRICE": "@:VIEW_MEALS.FILTERS.PRICE.TITLE",
        "ARRIVAL_TIME": "@:CREATE_A_MEAL.ARRIVAL_TIME"
      },
      "HELP_COOKING": {
        "NAME": "@:WELCOME.DIFFERENT_ROLES.HELP_COOKING.NAME",
        "DESCRIPTION_TIME_1": 'You have to arrive at',
        "DESCRIPTION_TIME_2": 'in order to help the host to prepare the meal.',
        "DESCRIPTION_PRICE_1": 'The price can vary',
        "DESCRIPTION_PRICE_2": "@: VIEW_MEALS.FILTERS.PRICE.PLACEHOLDER_FROM",
        "DESCRIPTION_PRICE_3": "@: VIEW_MEALS.FILTERS.PRICE.PLACEHOLDER_TO",
        "DESCRIPTION_PRICE_4": 'according to the inscriptions',
        "DESCRIPTION_PRICE_5": 'more info about pricing',
        "DESCRIPTION_PRICE_6": 'You will be informed before the dinner of the final price.',
      },
      "HELP_CLEANING": {
        "NAME": "@:WELCOME.DIFFERENT_ROLES.HELP_CLEANING.NAME",
        "DESCRIPTION_TIME_1": "@: VIEW_MEALS_DTLD.INSCRIPTION.HELP_COOKING.DESCRIPTION_TIME_1",
        "DESCRIPTION_TIME_2": 'in order to help for',
        "DESCRIPTION_TIME_3": 'You will help',
        "DESCRIPTION_TIME_4": 'ordering and cleaning what was used for the meal.',
        "DESCRIPTION_PRICE_1": "@: VIEW_MEALS_DTLD.INSCRIPTION.HELP_COOKING.DESCRIPTION_PRICE_1",
        "DESCRIPTION_PRICE_2": "@: VIEW_MEALS.FILTERS.PRICE.PLACEHOLDER_FROM",
        "DESCRIPTION_PRICE_3": "@: VIEW_MEALS.FILTERS.PRICE.PLACEHOLDER_TO",
        "DESCRIPTION_PRICE_4": "@: VIEW_MEALS_DTLD.INSCRIPTION.HELP_COOKING.DESCRIPTION_PRICE_4",
        "DESCRIPTION_PRICE_5": "@: VIEW_MEALS_DTLD.INSCRIPTION.HELP_COOKING.DESCRIPTION_PRICE_5",
        "DESCRIPTION_PRICE_6": "@: VIEW_MEALS_DTLD.INSCRIPTION.HELP_COOKING.DESCRIPTION_PRICE_6",
      },
      "SIMPLE_GUEST": {
        "NAME": "@:WELCOME.DIFFERENT_ROLES.SIMPLE_GUEST.NAME",
        "DESCRIPTION": 'You help by paying a little bit more : this money will be redistribuated between those who helped to organize the event'
      },
      "CELLPHONE": {
        "DESCRIPTION": 'Info required',
        "TOOLTIP": 'Private information displayed only between participants and host',
        "PLACEHOLDER": "@: CREATE_A_MEAL.FORM.CELLPHONE.NAME"
      }
    },
    "NOTIFICATIONS": 'Do you want to receive updates about the meal on messenger? (recommended)',
    "ACTION_BUTTON": {
      "SUBSCRIBE_NOT_CONNECTED_1": 'Sign In with facebook',
      "SUBSCRIBE_NOT_CONNECTED_2": 'to participate',
      "SUBSCRIBE": 'Participate',
      "SEE_MEAL": "@: VIEW_MEALS.ACTION_BUTTON.SEE_MEAL",
      "CANCEL": 'Cancel my request',
      "MEAL_FULL": "@: VIEW_MEALS.ACTION_BUTTON.MEAL_FULL",
      "SIGN_IN_1": "@: VIEW_MEALS.ACTION_BUTTON.SIGN_IN_1",
      "SIGN_IN_2": "@: VIEW_MEALS.ACTION_BUTTON.SIGN_IN_2",
      "SIGN_IN_3": "@: VIEW_MEALS.ACTION_BUTTON.SIGN_IN_3"
    },
    "PARTICIPANTS": {
      "AGE": "@: PROFILE.YEARS_OLD",
      "COUNTRY_OF_ORIGIN": 'From {{country_of_origin_name}}',
      "HOST": 'Your host:',
      "HELP_COOKING": 'Help cooking:',
      "HELP_CLEANING": 'Help cleaning:',
      "SIMPLE_GUEST": 'Simple guest:',
    }
  },
  "PROFILE": {
    "RECOMMENDATION": 'We recomend you to complete your profile. Someone with a complete profile is more trustworthy than someone without.',
    "ABOUT_ME": {
      "TITLE": 'About me',
      "BIRTHDATE": 'Birthdate:',
      "GENDER": {
        "NAME": 'Gender',
        "MALE": 'Male',
        "FEMALE": 'Female'
      },
      "EMAIL": 'Email',
      "CELLPHONE": "@:CREATE_A_MEAL.FORM.CELLPHONE.NAME",
      "COUNTRY_OF_ORIGIN": 'Native country',
      "SPOKEN_LANGUAGES": {
        "NAME": 'Spoken languages',
        "ADD": 'Add',
      },
      "PRESENTATION": 'Introduce yourself'
    },
    "NOTIFICATIONS": {
      "TITLE": 'Notifications',
      "PARAGRAPHE": 'Do you want to receive notifications through messenger about new meals?',
      "PARAGRAPHE_1": "@:CREATE_A_MEAL.FORM.NOTIFICATIONS.MESSENGER_2",
      "CITY_OF_INTEREST": {
        "TITLE": 'Select the cities of your interest:',
        "WARNING": 'Be aware that for some big cities (Melbourne, Santiago, ...) the name of the city refers only to the city center and not the neighbourhood suburbs.',
        "PLACEHOLDER": "@:VIEW_MEALS.FILTERS.CITY.PLACEHOLDER",
        "ADD": "@:PROFILE.ABOUT_ME.SPOKEN_LANGUAGES.ADD"
      },
      "DIATERY_PREFERENCES": {
        "TITLE": 'Dietary preferences:',
        "OMNIVOROUS": 'Omnivorous',
        "VEGETARIAN": "@:CREATE_A_MEAL.FORM.VEGETARIAN",
        "VEGAN": "@:CREATE_A_MEAL.FORM.VEGAN",
      }
    },
    "ACTUALIZE": {
      "ACTION": 'Actualize',
      "MESSAGE_SUCCESS": 'Your profile was actualized',
      "MESSAGE_ERROR": 'We had a problem actualizing your profile. Please, get in touch with',
      "MESSAGE_ERROR_CELLPHONE_EMAIL": 'Email and cellphone are required to participate'
    },
    "YEARS_OLD": 'Years old',
    "COUNTRY_OF_ORIGIN": 'From {{country_of_origin_name}}',
    "PUBLIC_PROFILE": 'Public profile',
    'MEMBERSHIP': 'Member since {{member_since}}',
    "REVIEWS": {
      "TITLE": 'Reviews',
      "NO_REVIEWS_YET": '{{user_first_name}} does not have any reviews yet.',
      "NO_COMMENT": '{{review_fromUser_datas_first_name}} had a {{review_forUser_rating}} experience with {{user_first_name}}.'
    },
    "MEALS": {
      "TITLE": 'Meals'
    }
  },
  "LOGIN": {
    "PARAGRAPH": 'You need to sign in to keep going',
    "SIGN_IN": "@: VIEW_MEALS_DTLD.ACTION_BUTTON.SUBSCRIBE_NOT_CONNECTED_1"
  },
  "VIEW_MY_MEALS": {
    "INCOMING_MEALS": "@: VIEW_MEALS.TITLE",
    "PREVIOUS_MEALS": 'Previous meals',
    "VEGETARIAN_MEAL": "@: VIEW_MEALS.VEGETARIAN_MEAL",
    "VEGAN_MEAL": "@: VIEW_MEALS.VEGAN_MEAL",
    "HALAL_MEAL": "@: VIEW_MEALS.HALAL_MEAL",
    "KOSHER_MEAL": "@: VIEW_MEALS.KOSHER_MEAL",
    "PENDING_REQUEST": 'Pending request',
    "PENDING_REQUESTS": 'Pending requests',
    "PRICE_FROM": "@: VIEW_MEALS.FILTERS.PRICE.PLACEHOLDER_FROM",
    "STATUS": {
      "PENDING": "@: VIEW_MEALS.PENDING",
      "ATTENDING": "@: VIEW_MEALS.ATTENDING",
      "ATTENDED": "@: VIEW_MEALS.ATTENDED",
      "HOSTING": "@: VIEW_MEALS.HOSTING",
      "HOSTED": "@: VIEW_MEALS.HOSTED",
    },
    "NO_INCOMING_MEALS_1": 'You do not have incoming meals but you can',
    "NO_INCOMING_MEALS_2": "@: WELCOME.CREATE_A_MEAL",
    "NO_INCOMING_MEALS_3": 'or',
    "NO_INCOMING_MEALS_4": "@: WELCOME.BROWSE_A_MEAL",
    "NO_PARTICIPATION_YET": 'You didn\'t participate yet.'
  },
  "VIEW_MY_MEALS_DTLD": {
    "MESSAGE": {
      "WELL_DONE": 'Well done!',
      "SUBSCRIBED": 'You successfully subscribed to the meal.',
      "PUBLISHED": 'You successfully published your meal.',
      "INCOMPLETE_PROFILE_1": 'We advise you to',
      "INCOMPLETE_PROFILE_2": 'complete your',
      "INCOMPLETE_PROFILE_3": 'profile',
      "INCOMPLETE_PROFILE_4": 'in order to make your meal more friendly.',
    },
    "PENDING_REQUEST": {
      "TITLE": 'You have a pending request',
      "REQUESTED_ROLE": 'Requested role:',
      "HELP_COOKING": "@:WELCOME.DIFFERENT_ROLES.HELP_COOKING.NAME",
      "HELP_CLEANING": "@:WELCOME.DIFFERENT_ROLES.HELP_CLEANING.NAME",
      "SIMPLE_GUEST": "@:WELCOME.DIFFERENT_ROLES.SIMPLE_GUEST.NAME",
      "ACTION_BUTTON": {
        "ACCEPT": 'Accept',
        "REFUSE": 'Refuse',
      },
      "SEE_REVIEWS": 'see reviews'
    },
    "ACTION_BUTTON": {
      "DELETE": 'Delete',
      "EDIT": 'Edit',
      "UNSUBSCRIBE": 'Unsubscribe'
    },
    "MEAL_INFORMATIONS": {
      "TITLE": "Important information",
      "INVITE_FRIENDS": 'Invite friends',
      "INSCRIBED_AS": 'Inscribed as:',
      "TOTAL_GROCERIES": 'Total price of the groceries:',
      "TOTAL_PAYBACK": 'Total participants payback',
      "PRICE_MEAL_FULL": 'If the meal is full:',
      "PRICE_CURRENT": 'Currentyl:',
      "PRICE_MEAL": 'Price of your meal:',
      "PRICE_LEFT_TO_PAY": 'left to pay to {{meal_admin_first_name}} {{meal_admin_last_name}}',
      "SUBSCRIPTION_RECAPITULATORY": 'Subscription recapitulatory:',
      "VEGETARIAN_MEAL": "@: VIEW_MEALS.VEGETARIAN_MEAL",
      "VEGAN_MEAL": "@: VIEW_MEALS.VEGAN_MEAL",
      "HALAL_MEAL": "@: VIEW_MEALS.HALAL_MEAL",
      "KOSHER_MEAL": "@: VIEW_MEALS.KOSHER_MEAL",
      "HELP_COOKING": "@: VIEW_MEALS_DTLD.PARTICIPANTS.HELP_COOKING",
      "HELP_CLEANING": "@: VIEW_MEALS_DTLD.PARTICIPANTS.HELP_CLEANING",
      "SIMPLE_GUEST": "@: VIEW_MEALS_DTLD.PARTICIPANTS.SIMPLE_GUEST",
    },
    "PARTICIPANTS": {
      "TITLE": "@: CREATE_A_MEAL.FORM.PARTICIPANTS",
      "HOST": "@: VIEW_MEALS_DTLD.PARTICIPANTS.HOST",
      "LEAVE_REVIEWS": {
        "TITLE": 'How was your experience with {{participant_first_name}}?',
        "POSITIVE": 'Positive',
        "NEUTRAL": 'Neutral',
        "NEGATIVE": 'Negative',
        "PLACEHOLDER": 'Leave a review to {{first_name}}',
        "GRADE_FIRST": 'Grade {{first_name}} first',
        "SEND": 'send'
      },
      "PER_PERS": 'per pers',
      "REMAINING_PLACES": 'Remaining places: {{nb_remaining_places}}',
      "PENDING_REQUEST": "@: VIEW_MY_MEALS.PENDING_REQUEST"
    },
    "BACK_TO_MY_MEALS": 'Back to my meals',
    "MODAL": {
      "ACTION_BUTTON": {
        "NO": 'No',
        "YES": 'Yes'
      },
      "DELETE": {
        "TITLE": 'Cancel the meal',
        "PARAGRAPH": 'Are you sure that you want to cancel the event?',
      },
      "UNSUBSCRIBE": {
        "TITLE": 'Unsubscribe from the meal',
        "PARAGRAPH": 'Are you sure you want to unsubscribe from the meal?',
      },
      "EDIT": {
        "ERROR_COOKING_TIME": 'The arrival time for the helping cooks can not be after the beggining of the meal',
        "ACTION_BUTTON": {
          "CANCEL": 'Cancel',
          "EDIT": 'Edit'
        }
      }
    }
  },
  "VIEW_LEAVE_REVIEWS": {
    "LOADING": 'Loading, please wait...',
    "NO_REVIEWS": 'You do not have reviews to leave',
    "TITLE_1": 'How was your experience with',
    "TITLE_2": 'those {{dataForReview_length}} persons',
    "REVIEW_SENT": 'Your review was sent'
  },
  "VIEW_MANAGE_REQUESTS":{
    "LOADING": "@: VIEW_LEAVE_REVIEWS.LOADING",
    "NO_PENDING_REQUESTS": 'You do not have pending request',
    "TITLE_1": 'You have {{nbDifferentPendingRequest}} pending request',
    "TITLE_2": 'You have {{nbDifferentPendingRequest}} pending requests',
    "TITLE_3": 'for {{meals_length}} different meals',
  }
};









var translationsFR = {
  "WELCOME": {
    "CREATE_A_MEAL": 'create a meal',
    "BROWSE_A_MEAL": 'browse a meal',
    "HOW_IT_WORKS": 'How it works',
    "PUBLICATION": {
      "TITLE": 'Publication',
      "PARAGRAPH": 'A member publishes a meal, choosing the number of participants and their roles.'
    }
  },
  "CREATE_A_MEAL": {
    "TITLE": '- Create a new meal -',
    "FORM": {
      "PUBLIC_INFO": 'Public information',
      "MENU_TITLE": 'Title of your menu',
      "MENU_DESCRIPTION": 'Menu description (optional)',
      "SPECIAL_MEAL": {
        "TITLE": 'repas particulier? ',
        "TOOLTIP": 'ne pas chequer'
      }
    }
  }
};

var translationsES = {
  "WELCOME": {
    "CREATE_A_MEAL": 'create a meal',
    "BROWSE_A_MEAL": 'browse a meal',
    "HOW_IT_WORKS": 'How it works',
    "PUBLICATION": 'Publication'
  }
};

// Declare app level module which depends on views, and components
var app = angular.module('myApp', [
  'config',
  'angular-svg-round-progressbar',
  'ui.bootstrap',
  'ngAnimate',
  'ui.router',
  'satellizer',
  'myApp.viewCreateMeal',
  'myApp.viewMeals',
  'myApp.viewMyMeals',
  'myApp.viewLogin',
  'myApp.viewProfile',
  'myApp.welcome',
  'myApp.viewLeaveReviews',
  'myApp.viewManageRequests',
  'userServices',
  'angular-loading-bar',
  'ezfb',
  'getReviewService',
  'getAgeService',
  'angular.filter',
  'pascalprecht.translate'
]);

app.config(['$stateProvider', '$httpProvider', '$urlRouterProvider', '$authProvider', 'ENV', 'cfpLoadingBarProvider', 'ezfbProvider', '$translateProvider', function($stateProvider, $httpProvider, $urlRouterProvider, $authProvider, ENV, cfpLoadingBarProvider, ezfbProvider, $translateProvider) {

  if (!$httpProvider.defaults.headers.get) {
    $httpProvider.defaults.headers.common = {};
  }

  $httpProvider.defaults.headers.common["Cache-Control"] = "no-cache";
  $httpProvider.defaults.headers.common.Pragma = "no-cache"; // ajoute le header à chaque requête http pour que chrome n'utilse pas son cache pour sauvegarder les données (permet d'afficher correctement les pendings requests)

  //enlève le spinner de la loadingbar
  cfpLoadingBarProvider.includeSpinner = false;

  $stateProvider
    .state('welcome', {
      url: '/welcome',
      templateUrl: 'static/welcome/welcome.html',
      controller: 'WelcomeCtrl'
    });
  $stateProvider
    .state('login', {
      url: '/login',
      templateUrl: 'static/viewLogin/viewLogin.html',
      controller: 'ViewLoginCtrl'
    });
  $stateProvider
    .state('view_meals', {
      url: '/view_meals',
      templateUrl: 'static/viewMeals/viewMeals.html',
      controller: 'ViewMealsCtrl',
      resolve: {
        response: ['$http', function($http) {
          var date = new Date();
          var now = date.toISOString();
          return $http.get('/api/meals?where={"time": {"$gte": "' + now + '"}}').then(function successCallBack(response) {
            if (response.data['_items'].length > 0) {
              return response.data['_items'];
            }
            else {
              return $http.get('/api/meals').then(function successCallBack(responsewithoutfilter) {
                return responsewithoutfilter.data['_items'];
              }, function errorCallback(responsewithoutfilter) {
                console.log(responsewithoutfilter);
              });
            }
          }, function errorCallback(response) {
            console.log(response);
          });
        }]
      }
    });
  $stateProvider
    .state('view_meals.mealsMap', {
      views: {
        'mealsMap': {
          templateUrl: 'static/viewMeals/viewMealsContainer/mealsMap.html',
        }
      }
    })
    .state('view_meals.mealsList', {
      views: {
        'mealsList': {
          templateUrl: 'static/viewMeals/viewMealsContainer/mealsList.html',
        }
      }
    });
  $stateProvider
    .state('create_meal', {
      url: '/create_meal',
      templateUrl: 'static/viewCreateMeal/viewCreateMeal.html',
      controller: 'ViewCreateMealCtrl'
    });
  $stateProvider
    .state('my_meals', {
      url: '/my_meals',
      templateUrl: 'static/viewMyMeals/viewMyMeals.html',
      controller: 'ViewMyMealsCtrl',
      data: {
        requiredLogin: true
      },
      resolve: {
        response: ['$http', function($http) {
          return $http.get('/api/meals/private');
        }]
      }
    });
  $stateProvider
    .state('view_my_dtld_meals', {
      url: '/my_meals/:myMealId',
      templateUrl: 'static/viewMyMeals/viewMyMealsDtld/viewMyMealsDtld.html',
      controller: 'ViewMyMealsDtldCtrl',
      data: {
        requiredLogin: true
      },
      params: {
        successSubscribedMessage: null
      },
      resolve: {
        userResolve: ['userServicesFactory', function(userServicesFactory) {
          return userServicesFactory();
        }],
        meal: ['$http', '$stateParams', '$state', '$rootScope', function($http, $stateParams, $state, $rootScope) {
          return $http.get('/api/meals/private/' + $stateParams.myMealId).then(function successCallBack(response) {
            return response;
          }, function errorCallback() {
            $rootScope.toParamsMealId = {
              "myMealId": $stateParams.myMealId
            };
            $state.go("view_meals.mealsList", {
              reload: true,
              inherit: false,
              notify: false
            });
          });
        }]
      }
    });
  $stateProvider
    .state('footer_more_contact', {
      url: '/more/contact_us',
      templateUrl: 'static/footer/more/contact/contact_us.html',
    });
  $stateProvider
    .state('footer_information_team', {
      url: '/information/team',
      templateUrl: 'static/footer/information/team/team.html',
    });
  $stateProvider
    .state('footer_information_concept', {
      url: '/information/concept',
      templateUrl: 'static/footer/information/concept/concept.html'
    });
  $stateProvider
    .state('footer_information_FAQ', {
      url: '/information/FAQ',
      templateUrl: 'static/footer/information/FAQ/FAQ.html',
    });
  $stateProvider
    .state('footer_legal_terms_and_conditions', {
      url: '/legal/terms_and_conditions',
      templateUrl: 'static/footer/legal/termsAndConditions/terms_and_conditions.html'
    });
  $stateProvider
    .state('footer_legal_privacy_policy', {
      url: '/legal/privacy_policy',
      templateUrl: 'static/footer/legal/privacyPolicy/privacy_policy.html'
    });
  $stateProvider
    .state('footer_legal_general_policies', {
      url: '/legal/general_policies',
      templateUrl: 'static/footer/legal/generalPolicies/general_policies.html'
    });
  $stateProvider
    .state('footer_legal_guidelines', {
      url: '/legal/guidelines',
      templateUrl: 'static/footer/legal/guidelines/guidelines.html'
    });
  $stateProvider
    .state('footer_more_careers', {
      url: '/more/careers',
      templateUrl: 'static/footer/more/careers/careers.html',
    });
  $stateProvider
    .state('footer_more_photo_gallery', {
      url: '/more/photo_gallery',
      templateUrl: 'static/footer/more/photoGallery/photo_gallery.html',
    });
  $stateProvider
    .state('profile', {
      url: '/profile/:userId',
      templateUrl: 'static/profile/viewProfile.html',
      controller: 'ViewProfileCtrl',
      data: {
        requiredLogin: true
      },
      resolve: {
        userInfo: ['$http', '$stateParams', function($http, $stateParams) {
          return $http.get('/api/users/' + $stateParams.userId);
        }]
      }
    });
  $stateProvider.state('profile.mealsList', {
    views: {
      'mealsList': {
        templateUrl: 'static/viewMeals/viewMealsContainer/mealsList.html'
      }
    }
  });
  $stateProvider
    .state('manage_requests', {
      url: '/manage_requests',
      templateUrl: 'static/viewManageRequests/viewManageRequests.html',
      controller: 'ViewManageRequestsCtrl'
    });
  $stateProvider
    .state('leave_reviews', {
      url: '/leave_reviews',
      templateUrl: 'static/viewLeaveReviews/viewLeaveReviews.html',
      controller: 'ViewLeaveReviewsCtrl'
    });

  $urlRouterProvider.otherwise('welcome');

  $authProvider.facebook({
    clientId: ENV.fbClientID,
    redirectUri: ENV.fbRedirectURI,
    scope: ['email']
  });

  ezfbProvider.setInitParams({
    appId: ENV.appId,
    version: 'v2.6'
  });

  $translateProvider.useSanitizeValueStrategy('escape'); //change 'escape' to 'sanitize' when angular-translate v3 will be released
  $translateProvider.translations('en', translationsEN);
  $translateProvider.translations('fr', translationsFR);
  $translateProvider.translations('es', translationsES);
  $translateProvider.preferredLanguage('en');
  $translateProvider.fallbackLanguage('en');

}]);


app.run(['$rootScope', '$state', '$auth', '$transitions', function($rootScope, $state, $auth, $transitions) {
  var matchSuccess = {};
  $rootScope.$state = $state;

  var matchNotLogged = {
    to: function(state) {
      return state.data != null && state.data.requiredLogin === true;
    }
  };

  $transitions.onBefore(matchNotLogged, function(trans) { //on fait une redirection qui est du coup intercepté avant l'auth et donc on repart sur login. Besoin d'utiliser on start dedans onbefore?
    if ($auth.isAuthenticated() != true) {
      $rootScope.fromState = trans.$from();
      $rootScope.toState = trans.$to();
      if (trans.$to().name == "view_my_dtld_meals") {
        $rootScope.toParamsMealId = {
          "myMealId": trans._targetState._params.myMealId
        };
      }
      return trans.router.stateService.target("login");
    }
  });

  $transitions.onSuccess(matchSuccess, function($transitions) {
    document.body.scrollTop = document.documentElement.scrollTop = 0;
    if ($transitions.$to().name != "login") {
      $rootScope.fromState = $transitions.$from();
      $rootScope.toState = $transitions.$to();
    }
  });

  /* 
  $rootScope.$on('$stateChangeStart',
    function(event, toState, toParams, fromState, fromParams) {
      // when the state change, the user load the template at the top of the window
      document.body.scrollTop = document.documentElement.scrollTop = 0;
      $rootScope.fromState = fromState; // on récupère fromState pour l'apparition du plugin checkbox messenger dans create_meal
      var requiredLogin = false;
      // check if this state need login
      if (toState.data && toState.data.requiredLogin) {
        requiredLogin = true;
      }
      if ($auth.isAuthenticated() && requiredLogin == true) { // si on n'est pas connecté et qu'on souhaite accéder à une page privée, on actualise toState et on va sur login (utilisé dans viewMeals.js et viewCreateMeal.js)
        $rootScope.toState = toState; //permet de récupérer l'argument toState dans tous les childs scope
        $rootScope.toParams = toParams; //permet de récupérer l'argument toState dans tous les childs scope
      }
      // if yes and if this user is not logged in, redirect him to login page
      if (!$auth.isAuthenticated() && requiredLogin == true) { // si on n'est pas connecté et qu'on souhaite accéder à une page privée, on actualise toState et on va sur login (utilisé dans viewMeals.js et viewCreateMeal.js)
        $rootScope.toState = toState; //permet de récupérer l'argument toState dans tous les childs scope
        $rootScope.toParams = toParams; //permet de récupérer l'argument toState dans tous les childs scope
        event.preventDefault();
        $state.go('login');
      }
    });
*/
  // enable to get the state in the view


}]);

app.controller('AppCtrl', ['$scope', '$auth', '$state', 'userServicesFactory', '$http', '$rootScope', '$q', '$window', 'ezfb', '$timeout', '$translate', function($scope, $auth, $state, userServicesFactory, $http, $rootScope, $q, $window, ezfb, $timeout, $translate) {

  function isFacebookApp() {
    var ua = $window.navigator.userAgent || $window.navigator.vendor || $window.opera;
    return (ua.indexOf("FBAN") > -1) || (ua.indexOf("FBAV") > -1);
  }
  $rootScope.inApp = isFacebookApp();

  function authe(provider) {
    return $q(function(resolve, reject) {
      $auth.authenticate(provider)
        .then(function(response) {
          console.debug("success", response);
          if ($auth.isAuthenticated()) {
            resolve(userServicesFactory().then(function(data) {
              $rootScope.user = data;
            }));
          }
        })
        .catch(function(response) {
          console.debug("catch", response);
        });
    });
  }



  $rootScope.auth = function(provider, toState, toParams) {
    authe(provider).then(function successCallBack() {
      toState = toState || undefined;
      if (toState != undefined) { //permet à l'utilisateur de se retrouver sur la page qu'il a cliqué avant d'avoir besoin de s'identifier
        if (toState == "profile") {
          $state.go(toState, {
            "userId": $scope.user._id
          });
        }
        else {
          $state.go(toState, toParams);
        }
      }
      else {
        $state.reload();
      }
      initializeUserLabels();
    });
  };

  $rootScope.logout = function() {
      $auth.logout().then(function() {
        $http.get('/auth/logout').then(function(response) {
          console.log(response.data);
          delete $rootScope.user;
          $state.go("welcome");
        });
      });
    },

    $rootScope.isAuthenticated = function() {
      return $auth.isAuthenticated();
    },

    $rootScope.navbarCollapsed = true;

  var authVerification = function() { // fonction qui permet de vérifier que l'utilisateur est bien déconnecté. S'il ne l'est pas alors on récupère ses données
    if ($rootScope.isAuthenticated()) {
      userServicesFactory().then(function(data) {
        $rootScope.user = data;
        initializeUserLabels();
      });
    }
  };

  var initializeUserLabels = function() {
    $timeout(function() {
      //on récupère les pending requests et on le mets dans le rootscope
      $http.get('api/meals?where={"$and": [{"users._id": "' + $rootScope.user._id + '"}, {"users.status": "pending"} ]}').then(function(res) { // on récupère les meals de l'utilisateur dont on consulte le profil
        $rootScope.user.nbDifferentPendingRequest = 0;
        var meals = res.data._items;
        meals.forEach(function(meal) {
          meal.users.forEach(function(participant) {
            if (participant.status == "pending") {
              $rootScope.user.nbDifferentPendingRequest += 1;
            }
          });
        });
      });
      //on récupère les reviews qu'on a besoin de laisser et on les met dans rootscope
      var uniqueListForRequest = [];
      var now = new Date;
      $http.get('api/meals?where={"$and": [{"users._id": "' + $rootScope.user._id + '"}, {"users": {"$not": {"$size": 1}}}]}').then(function(resp) { // on récupère les meals de l'utilisateur dont on consulte le profile où il n'y a pas que lui d'inscrit
        resp.data._items.forEach(function(element) {
          var mealDate = new Date(element.time);
          if (mealDate < now) { // on ne peut laisser une review qu'à un meal qui s'est passé
            element.users.forEach(function(participant) {
              if (participant._id != $rootScope.user._id) { //on enlève les reviews pour moi même
                uniqueListForRequest.push('"' + (participant._id + $rootScope.user._id + element._id).toString() + '"');
              }
            });
          }
        });
        $http.get('api/reviews?where={"unique": {"$in":[' + uniqueListForRequest + ']}}').then(function successCallBack(response) {
          $rootScope.user.nbDifferentReviewsToLeave = uniqueListForRequest.length - response.data._items.length;
        });
      });
    }, 0);
  };

  authVerification();

  $scope.status = {
    isopen: false
  };

  $scope.sloganText = "When was the last time you met someone new?";

  $rootScope.changeLanguage = function(langKey) { // permet de changer la langue depuis index.html en cliquant sur un des drapeaux
    $translate.use(langKey);
  };

}]);


app.filter('ageFilter', ['getAgeServiceFactory', function(getAgeServiceFactory) {
  return function(birthdate) {
    return getAgeServiceFactory(birthdate);
  };
}]);

app.filter('capitalizeFirstLetter', function() {
  return function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
});