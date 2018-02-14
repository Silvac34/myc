import { Component, OnInit, ElementRef, NgZone, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms' //on fait du reactive forms
//import { Meal, Menu, Address, PrivateInfo, AddressPrivate, DetailedInfo, RequiredGuests, Cooks, Cleaners, SimpleGuests } from './meal'; on en a plus besoin vu qu'on fait du reactive forms
//on importe le modèle de donnée pour ensuite pouvoir l'avoir comme variable pour le 2 way data binding
import { MapsAPILoader } from '@agm/core';
import { } from 'googlemaps';
import { GoogleMapService } from '../services/google-map.service';
import { CurrencyService } from '../services/currency.service';
import { AuthService } from "../services/auth.service";

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
    private currencyService: CurrencyService,
    public auth: AuthService
  ) { 
    this.createForm();
    this.setCurrencySymbol();
    console.log(this.createMealForm);
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
      "addressComplement": "",
      "cellphone": null
    })
  }

  ngOnInit() {
    this.auth.user.subscribe((data) => {
      if(data){
        if(data.privateInfo.cellphone){
          this.createMealForm.patchValue({"cellphone": data.privateInfo.cellphone});
        };
      }
    });
    //on initialise l'endroit où on se trouve :
    //this.setCurrentPosition();
    
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
                this.currencyService.getCurrencyFromCountryCode(place.address_components[i].short_name).subscribe((symbol) =>{
                  this.createMealForm.patchValue({"currency_symbol": symbol});
                });
              }
            }
          }
        });
      });
    });
  }
  
  setCurrencySymbol() { //à remplacer par les données du user.
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        let latlngInput = position.coords.latitude + "," + position.coords.longitude;
        this.currencyService.getCurrencyFromLatLng(latlngInput).subscribe((observable) => { 
          observable.subscribe((symbol) => { 
            this.createMealForm.patchValue({"currency_symbol": symbol});
          });
        });
      })
    }
  }
  
  onSubmit() {
    if (this.createMealForm.valid) {
      this.createMeal();
    } 
    else {
      this.validateAllFormFields(this.createMealForm); //si le form n'est pas valide, on marque tous les controls comme touched et donc les validations fonctionnent
    }
  }
  
  validateAllFormFields(formGroup: FormGroup) { //si le form n'est pas valide, on marque tous les controls comme touched et donc les validations fonctionnent
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }
  
  createMeal() {
    console.log("soumis")
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