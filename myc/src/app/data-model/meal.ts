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
    "users": Users[];
    "nbGuests": Number;
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
    "postal_code": String;
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
    "hosts": Hosts
    "cleaners": Cleaners;
    "cooks": Cooks;
    "simpleGuests": SimpleGuests;
}

export class Cleaners {
    "nbRquCleaners": Number;
    "timeCleaning": Date;
    "price": Number;
}

export class Cooks {
    "nbRquCooks": Number;
    "timeCooking": Date;
    "price": Number;
}

export class SimpleGuests {
    "nbRquSimpleGuests": Number;
    "price": Number;
}

export class Hosts {
    "price": Number;
}

export class Users {
    "status": String;
    "id": String;
    "role": String;
}

