import { Component, OnInit, ElementRef, NgZone, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms' //on fait du reactive forms
import { Meal, Menu, Address, PrivateInfo, AddressPrivate, DetailedInfo, RequiredGuests, Cooks, Cleaners, SimpleGuests } from './meal';
//on importe le modèle de donnée pour ensuite pouvoir l'avoir comme variable pour le 2 way data binding
import { } from 'googlemaps';
import { MapsAPILoader } from '@agm/core';

const now = new Date();

@Component({
  selector: 'app-create-meal',
  templateUrl: './create-meal.component.html',
  styleUrls: ['./create-meal.component.scss']
})

export class CreateMealComponent {
  
  createMealForm: FormGroup;
  
  public latitude: number;
  public longitude: number;
  public zoom: number;

  @ViewChild("autocompleteAddress")
  public searchElementRef: ElementRef;

  constructor(
    private formB: FormBuilder,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone
  ) { 
    this.createForm();
  }
  
  createForm() {
    this.createMealForm = this.formB.group({
      "menu": this.formB.group({
        "title": ["", Validators.required],
        "description": ""
      }),
      "vegan": false,
      "kosher": false,
      "halal": false,
      "veggies": false,
      "date": "",
      "hour": "",
      "detailedInfo": this.formB.group({
        "requiredGuests": this.formB.group({
          "cooks": this.formB.group({
            "nbRquCooks": null,
            "timeCooking": new Date()
          }),
          "cleaners": this.formB.group({
            "nbRquCleaners": null,
            "timeCleaning": new Date()
          }),
          "simpleGuests": this.formB.group({
            "nbRquSimpleGuests": null
          })
        })
      }),
      "price": null,
      "automaticSubscription": false,
      "currency_symbol": "",
      "address": "",
      "addressComplement": "",
      "automaticSubscription": false
      /*"address": this.formB.group({
          "town": "",
          "country": "",
          "lng": null,
          "postalCode": "",
          "lat": null
      }),
      "privateInfo": this.formB.group({
        "address": this.formB.group({
            "lat": null,
            "utc_offset": null,
            "name": "",
            "lng": null
        })
       
      }),*/
    })
  }
  /*menu: Menu = {
     "title": "",
     "description": ""
  };
  address: Address = {
    "town": "",
    "country": "",
    "lng": null,
    "postalCode": "",
    "lat": null
  };
  addressPrivate: AddressPrivate = {
    "lat": null,
    "utc_offset": null,
    "name": "",
    "lng": null
  };
  privateInfo: PrivateInfo = {
    "address": this.addressPrivate
  };
  cleaners: Cleaners = {
    "nbRquCleaners": null,
    "timeCleaning": new Date()
  };
  cooks: Cooks = {
    "nbRquCooks": null,
    "timeCooking": new Date()
  };
  simpleGuests: SimpleGuests = {
    "nbRquSimpleGuests": null,
  };
  requiredGuests: RequiredGuests = {
    "cleaners": this.cleaners,
    "cooks": this.cooks,
    "simpleGuests": this.simpleGuests
  };
  detailedInfo: DetailedInfo = {
    "requiredGuests": this.requiredGuests
  };
  editedMeal : Meal = {
      "menu": this.menu,
      "price": null,
      "address": this.address,
      "privateInfo": this.privateInfo,
      "detailedInfo": this.detailedInfo,
      "automaticSubscription": false,
      "vegan": false,
      "kosher": false,
      "hallal": false,
      "veggies": false,
      "time": new Date(),
      "currency_symbol": ""
  };
  hour : Object = {
    "hour": 20,
    "minute": 30,
    "second": 0
  };
  date : Object = {
    "year": now.getFullYear(),
    "month": now.getMonth() + 1,
    "day": now.getDate()
  };*/

  ngOnInit() {
    //set google maps defaults
    this.zoom = 4;
    this.latitude = 39.8282;
    this.longitude = -98.5795;

    //set current position
    this.setCurrentPosition();

    //load Places Autocomplete
    this.mapsAPILoader.load().then(() => {
      let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, {
        types: ["address"]
      });
      autocomplete.addListener("place_changed", () => {
        this.ngZone.run(() => {
          //get the place result
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();

          //verify result
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }
          console.log(place);//faire en sorte que le control address soit associé correctement au model
          //set latitude, longitude and zoom
          this.latitude = place.geometry.location.lat();
          this.longitude = place.geometry.location.lng();
          this.zoom = 12;
        });
      });
    });
  }

  private setCurrentPosition() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.zoom = 12;
      });
    }
  }
}