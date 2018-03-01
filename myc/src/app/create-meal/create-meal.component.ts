import { Component, OnInit, ElementRef, NgZone, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms' //on fait du reactive forms
//import { Meal, Menu, Address, PrivateInfo, AddressPrivate, DetailedInfo, RequiredGuests, Cooks, Cleaners, SimpleGuests } from './meal'; on en a plus besoin vu qu'on fait du reactive forms
//on importe le modèle de donnée pour ensuite pouvoir l'avoir comme variable pour le 2 way data binding
import { MapsAPILoader } from '@agm/core';
import { } from 'googlemaps';
import { GoogleMapService } from '../services/google-map.service';
import { CurrencyService } from '../services/currency.service';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Meal } from '../data-model/meal';
import { User } from '../data-model/user';
import { Router } from '@angular/router';

const now = new Date();

@Component({
  selector: 'app-create-meal',
  templateUrl: './create-meal.component.html',
  styleUrls: ['./create-meal.component.scss']
})

export class CreateMealComponent {
  //définition des variabes
  public createMealForm: FormGroup;
  public zoom: number;
  public app_id: string = environment.facebookConfig.appId;
  public page_id: string = environment.pageId;
  public origin: string = environment.fbRedirectURI.concat("create_meal");
  public user_ref: string = Math.floor((Math.random() * 10000000000000) + 1).toString();
  private userId: string;
  public addressPublicToUpdate = {    
    "town": "",
    "country": "",
    "country_code": "",
    "lng": null,
    "postal_code": "",
    "lat": null,
    "complement": ""
  };
  public addressPrivateToUpdate = {
    "lat": null,
    "utc_offset": null,
    "name": "",
    "lng": null 
  };
  public progress: number  = 0; //mesure le progrès de chargement de la page (permet de lancer le FB.XFBML.parse() après que la vue soit chargée

  
  @ViewChild("autocompleteAddress")
  public searchElementRef: ElementRef;
  
  constructor(
    private formB: FormBuilder,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    private gMap: GoogleMapService,
    private currencyService: CurrencyService,
    private afs: AngularFirestore,
    public auth: AuthService
  ) { 
    this.createForm();
    this.setCurrencySymbol();
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
      "date": [null, Validators.required],
      "time": [null, Validators.required],
      "detailedInfo": this.formB.group({
        "requiredGuests": this.formB.group({
          "cooks": this.formB.group({
            "nbRquCooks": null,
            "timeCooking": null
          }),
          "cleaners": this.formB.group({
            "nbRquCleaners": null,
            "timeCleaning": null
          }),
          "simpleGuests": this.formB.group({
            "nbRquSimpleGuests": null
          })
        })
      }),
      "price": [null, Validators.required],
      "automaticSubscription": false,
      "currency_symbol": "$",
      "address": ["", Validators.required],
      "addressComplement": "",
      "cellphone": [null, Validators.required]
    })
  }

  ngOnInit() {

    this.auth.user.subscribe((data) => {
      if(data){
        if(data.privateInfo.cellphone){
          this.createMealForm.patchValue({"cellphone": data.privateInfo.cellphone});
        };
      };
    });
    
    this.auth.userMeta.subscribe(data => {
      if(data){
        this.userId = data.payload.id;
      }
    })
    
    //on initialise la valeur du téléphone selon si l'utilisateur a déjà rentré cette info dans le serveur
    //permet d'attendre que la view soit chargée pour faire un parse de FB pour obtenir le fb-checkbox-plugin
    this.ngZone.runOutsideAngular(() => {
      this.increaseProgress(() => {
        // reenter the Angular zone and display done
        this.ngZone.run(() => {
          console.log("ready to publish");
        });
      });
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
                this.addressPublicToUpdate.postal_code = place.address_components[i].long_name;
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
    
  //défini le symbole de monnaie selon la position de l'utilisateur
  setCurrencySymbol() {
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
  
  //si le form n'est pas valide, on marque tous les controls comme touched et donc les validations fonctionnent
  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  //fonction qui permet de valider l'heure d'arrivés des helps cooking dans le template
  timeCookingValidation() {
    if(this.createMealForm.value.detailedInfo.requiredGuests.cooks.nbRquCooks > 0) {
      return true
    }
    else {
      return false
    }
  }

  //fonction qui permet de mesurer (et d'augmenter) le progrès de chargement de la page
  increaseProgress(doneCallback: () => void) {
    this.progress += 1;
    if (this.progress < 100) {
      window.setTimeout(() => this.increaseProgress(doneCallback), 10);
    } else {
      if (window["FB"]) {
        window["FB"]["XFBML"].parse(); //on parse le plugin checkbox pour qu'il apparaisse
      };
      doneCallback();
    }
  }
  
  confirmOptIn() {
    window["FB"]["AppEvents"].logEvent('MessengerCheckboxUserConfirmation', null, {
      'app_id': this.app_id,
      'page_id': this.page_id,
      'ref': this.userId,
      'user_ref': this.user_ref
    });
  }
  
  //pour que cela fonctionne vraiment, il faut rajouter une conversion via google maps API des coordonnées en adresse et ensuite le rajouter dans les controls du form
  /*setCurrentPosition() {
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
  
  connectCreateMeal(provider) {
    if(provider === "facebook.com"){
     this.auth.facebookLogin()
      .then(() => this.onSubmit()); 
    }
    else if(provider === "google.com") {
      this.auth.googleLogin()
      .then(() => this.onSubmit());
    }
  }
  
  
  onSubmit() {
    if (this.createMealForm.valid) {
      this.updateUser();
      this.createMeal();
    } 
    else {
      //si le form n'est pas valide, on marque tous les controls comme touched et donc les validations fonctionnent
      this.validateAllFormFields(this.createMealForm);
    }
  }
  
  createMeal() {
    let newMeal = Object.assign({}, this.createMealForm.value);
    newMeal["address"] = this.addressPublicToUpdate;
    newMeal["address"]["complement"] = this.createMealForm.value.addressComplement;
    newMeal["users"] = [{
      "status": "accepted",
      "id": this.userId,
      "role": "admin"
    }]
    delete newMeal["addressComplement"];
    newMeal["privateInfo"] = {
      "address": this.addressPrivateToUpdate
    };
    delete newMeal["cellphone"];
    this.afs.collection('meals').add(newMeal)
    .then(function(docRef) {
      //this.confirmOptIn(); //ne marche pas : pas de AppEvents dans window.FB
      console.log("Document written with ID: ", docRef.id);
      this.router.navigate(['/']);
    })
    .catch(function(error) {
      console.error(error);
    });
  }
  
  updateUser() {
    let data = {};
    data = {"privateInfo.user_ref": this.user_ref, "privateInfo.cellphone": this.createMealForm.value.cellphone}//on ne met pas de if car de toute façon le téléphone est obligatoire
    this.afs.doc<User>(`users/${this.userId}`).update(data)
    .then(function(result){
      console.log(result);
    })
    .catch(function(error) {
      console.error(error);
    });
  }
}