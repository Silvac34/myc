import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-create-meal',
  templateUrl: './create-meal.component.html',
  styleUrls: ['./create-meal.component.scss']
})
export class CreateMealComponent implements OnInit {
  editedMeal = {
        "menu": {
            "title": String,
            "description": String
        },
        "price": Number,
        "address": {
            "town": String,
            "country": String,
            "lng": Number,
            "postalCode": String,
            "lat": Number
        },
        "privateInfo": {
            "address": {
                "lat": Number,
                "utc_offset": Number,
                "name": String,
                "lng": Number
            }
        },
        "detailedInfo": {
            "requiredGuests": {
                "cleaners": {
                    "nbRquCleaners": Number,
                    "timeCleaning": Date
                },
                "cooks": {
                    "nbRquCooks": Number,
                    "inputTimeCooking": Date
                }
            }
        },
        "automaticSubscription": Boolean,
        "vegan": Boolean,
        "kosher": Boolean,
        "hallal": Boolean,
        "veggies": Boolean,
        "time": Date,
        "currency_symbol": String
    };
    
  constructor() { }

  ngOnInit() { }

}
