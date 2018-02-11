export class Meal {
    "menu": Menu;
    "price": Number;
    "address": Address;
    "privateInfo": PrivateInfo;
    "detailedInfo": DetailedInfo;
    "automaticSubscription": Boolean;
    "vegan": Boolean;
    "kosher": Boolean;
    "hallal": Boolean;
    "veggies": Boolean;
    "time": Date;
    "currency_symbol": String;
}

export class Menu {
    "title": String;
    "description": String;
}

export class Address {
    "town": String;
    "country": String;
    "country_code": String;
    "lng": Number;
    "postalCode": String;
    "lat": Number;
    "complement": String;
}

export class PrivateInfo {
    "address": AddressPrivate;
}

export class AddressPrivate {
    "lat": Number;
    "utc_offset": Number;
    "name": String;
    "lng": Number; 
}

export class DetailedInfo {
    "requiredGuests": RequiredGuests;
}

export class RequiredGuests {
    "cleaners": Cleaners;
    "cooks": Cooks;
    "simpleGuests": SimpleGuests;
}

export class Cleaners {
    "nbRquCleaners": Number;
    "timeCleaning": Date;
}

export class Cooks {
    "nbRquCooks": Number;
    "timeCooking": Date;
}

export class SimpleGuests {
    "nbRquSimpleGuests": Number;
}

