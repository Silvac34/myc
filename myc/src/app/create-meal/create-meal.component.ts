import { Component, OnInit } from '@angular/core';
import { Meal } from './meal';
//on importe le modèle de donnée pour ensuite pouvoir l'avoir comme variable pour le 2 way data binding
// par la suite on utilisera import { Meal } from './meal', qui correspondra au modèle de donnée final
@Component({
  selector: 'app-create-meal',
  templateUrl: './create-meal.component.html',
  styleUrls: ['./create-meal.component.scss']
})

export class CreateMealComponent {
    
   editedMeal : Meal = {
      "menu": {
        "title": "",
        "description": ""
      },
      "price": null,
      "address": {
        "town": "",
        "country": "",
        "lng": null,
        "postalCode": "",
        "lat": null
      },
      "privateInfo": {
        "address": {
          "lat": null,
          "utc_offset": null,
          "name": "",
          "lng": null
        }
      },
      "detailedInfo": {
        "requiredGuests": {
          "cleaners": {
            "nbRquCleaners": null,
            "timeCleaning": new Date()
          },
          "cooks": {
            "nbRquCooks": null,
            "timeCooking": new Date()
          },
          "simpleGuests": {
            "nbRquSimpleGuests": null
          }
        }
      },
      "automaticSubscription": false,
      "vegan": false,
      "kosher": false,
      "hallal": false,
      "veggies": false,
      "time": new Date(),
      "currency_symbol": ""
    };
}
