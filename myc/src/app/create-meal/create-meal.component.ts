import { Component, OnInit, ElementRef, NgZone, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms' //on fait du reactive forms
//import { Meal, Menu, Address, PrivateInfo, AddressPrivate, DetailedInfo, RequiredGuests, Cooks, Cleaners, SimpleGuests } from './meal'; on en a plus besoin vu qu'on fait du reactive forms
//on importe le modèle de donnée pour ensuite pouvoir l'avoir comme variable pour le 2 way data binding
import { MapsAPILoader } from '@agm/core';
import { } from 'googlemaps';
import { GoogleMapService } from '../services/google-map.service';
import { CurrencyService } from '../services/currency.service';

const now = new Date();

@Component({
  selector: 'app-create-meal',
  templateUrl: './create-meal.component.html',
  styleUrls: ['./create-meal.component.scss']
})

export class CreateMealComponent {
  
  createMealForm: FormGroup;

  public zoom: number;
  public addressPublicToUpdate = {    
    "town": "",
    "country": "",
    "country_code": "",
    "lng": null,
    "postalCode": "",
    "lat": null,
    "complement": ""
  };
  public addressPrivateToUpdate = {
    "lat": null,
    "utc_offset": null,
    "name": "",
    "lng": null 
  };
  
  @ViewChild("autocompleteAddress")
  public searchElementRef: ElementRef;

  constructor(
    private formB: FormBuilder,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    private gMap: GoogleMapService,
    private currencyService: CurrencyService 
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
      "currency_symbol": "$",
      "address": "",
      "addressComplement": ""
      /*"address": this.formB.group({
          "town": "",
          "country": "",
          "lng": null,
          "postalCode": "",
          "lat": null,
          "complement": ""
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
    
    //on initialise l'endroit où on se trouve :
    //this.setCurrentPosition();
    console.log(this.setCurrencySymbol());
    //load Places Autocomplete
    this.mapsAPILoader.load().then(() => {
      let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, {
        types: ["address"]
      });
      autocomplete.addListener("place_changed", () => {
        this.ngZone.run(() => {
          //get the place result
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();
          let precision_needed_for_rounding_lat_lng = 100;
          //verify result
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }
          if (place != undefined) {
            if ("vicinity" in place) {
              this.addressPublicToUpdate.town = place.vicinity;
            }
            else {
              this.addressPublicToUpdate.town = place.formatted_address.split(",")[0];
            }
            this.addressPrivateToUpdate.name = place.name;
            this.addressPrivateToUpdate.utc_offset = place.utc_offset;
            this.addressPrivateToUpdate.lat = place.geometry.location.lat();
            this.addressPrivateToUpdate.lng = place.geometry.location.lng();
            this.addressPublicToUpdate.lat = Math.round(place.geometry.location.lat() * precision_needed_for_rounding_lat_lng) / precision_needed_for_rounding_lat_lng;
            this.addressPublicToUpdate.lng = Math.round(place.geometry.location.lng() * precision_needed_for_rounding_lat_lng) / precision_needed_for_rounding_lat_lng;
            for (var i = 0; i < place.address_components.length; i++) {
              if (place.address_components[i].types[0] == "postal_code") {
                this.addressPublicToUpdate.postalCode = place.address_components[i].long_name;
              }
              if (place.address_components[i].types[0] == "country") {
                this.addressPublicToUpdate.country = place.address_components[i].long_name;
                this.addressPublicToUpdate.country_code = place.address_components[i].short_name;
              }
            }
          }
        });
      });
    });
  }
  
  setCurrencySymbol() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        let latlngInput = position.coords.latitude + "," + position.coords.longitude;
        this.currencyService.getCurrencyFromLatLng(latlngInput).subscribe((observable) => { 
          observable.subscribe((symbol) => { 
            console.log(this.createMealForm.value.currency_symbol);
            this.createMealForm.value.currency_symbol = symbol;
          });
        });
      })
    }
  }
  
  getCountryCode() {//on rentre latlng en input et on obtient le symbol associé
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.gMap.ReverseGeocoding(position.coords.latitude + "," + position.coords.longitude).subscribe(
          (data) => {
            let country_code = "";
            for (var i = 0; i < data.results[0].address_components.length; i++) {
              if (data.results[0].address_components[i].types[0] == "country") {
                country_code = data.results[0].address_components[i].short_name;
              }
            }
        });
      });
    }
  }

  /*setCurrentPosition() { //pour que cela fonctionne vraiment, il faut rajouter une conversion via google maps API des coordonnées en adresse et ensuite le rajouter dans les controls du form
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        let precision_needed_for_rounding_lat_lng = 100;
        this.addressPublicToUpdate.lat = position.coords.latitude;
        this.addressPublicToUpdate.lng = position.coords.longitude;
        this.addressPrivateToUpdate.lat = position.coords.latitude;
        this.addressPrivateToUpdate.lng = position.coords.longitude;
        this.addressPublicToUpdate.lat = Math.round(position.coords.latitude * precision_needed_for_rounding_lat_lng) / precision_needed_for_rounding_lat_lng;
        this.addressPublicToUpdate.lng = Math.round(position.coords.longitude * precision_needed_for_rounding_lat_lng) / precision_needed_for_rounding_lat_lng;
        this.createMealForm.value.currency_symbol = "";
        this.gMap.ReverseGeocoding(position.coords.latitude + "," + position.coords.longitude).subscribe(
            data => { console.log(data.results) },
            err => console.error(err)
          );
      });
    } 
  }*/
}