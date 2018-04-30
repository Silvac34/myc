export class Meal {
    "menu": Menu;
    "price": number;
    "address": Address;
    "privateInfo": PrivateInfo;
    "detailedInfo": DetailedInfo;
    "automaticSubscription": Boolean;
    "vegan": Boolean;
    "kosher": Boolean;
    "hallal": Boolean;
    "veggies": Boolean;
    "time": Date;
    "currency_symbol": string;
    "users": Users[];
    "nbGuests": number;
}

export class Menu {
    "title": string;
    "description": string;
}

export class Address {
    "town": string;
    "country": string;
    "country_code": string;
    "lng": number;
    "postal_code": string;
    "lat": number;
    "complement": string;
}

export class PrivateInfo {
    "address": AddressPrivate;
}

export class AddressPrivate {
    "lat": number;
    "utc_offset": number;
    "name": string;
    "lng": number; 
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
    "nbRquCleaners": number;
    "timeCleaning": Date;
    "price": number;
}

export class Cooks {
    "nbRquCooks": number;
    "timeCooking": Date;
    "price": number;
}

export class SimpleGuests {
    "nbRquSimpleGuests": number;
    "price": number;
}

export class Hosts {
    "price": number;
}

export class Users {
    "status": string;
    "id": string;
    "role": string;
}

