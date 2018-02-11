import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GoogleMapService } from './google-map.service'
import { forkJoin } from "rxjs/observable/forkJoin";

@Injectable()
export class CurrencyService { //on prend un code_pays en entrée et on obtient la monnaie
  
  constructor(private http: HttpClient, private gMap: GoogleMapService) { 

  }
  
    currency = this.http.get('../../assets/currency/currency.json');
    currency_symbol = this.http.get('../../assets/currency/currency_symbol.json');
    
    getCurrencyFromCountryCode(country_code: string){
        return forkJoin([this.currency, this.currency_symbol]).map((results) => { return results[1][results[0][country_code]]["symbol"] });   
      }
      
    getCurrencyFromLatLng(latlng: string){
        return this.gMap.ReverseGeocoding(latlng).map((data) => {
          let country_code = "";
          for (var i = 0; i < data.results[0].address_components.length; i++) {
            if (data.results[0].address_components[i].types[0] == "country") {
              country_code = data.results[0].address_components[i].short_name;
              return this.getCurrencyFromCountryCode(country_code);
            }
          }
        });
      }
  
}
/*
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GoogleMapService } from './google-map.service'
import { forkJoin } from "rxjs/observable/forkJoin";

@Injectable()
export class CurrencyService { //on prend un code_pays en entrée et on obtient la monnaie
  
  constructor(private http: HttpClient, private gMap: GoogleMapService) { 

  }
    
    
    currency = this.http.get('../../assets/currency/currency.json');
    currency_symbol = this.http.get('../../assets/currency/currency_symbol.json');
    
    getCurrency(latlngInput: string){
      this.gMap.ReverseGeocoding(latlngInput).subscribe((data) => {
        
      });
        forkJoin([this.currency, this.currency_symbol]).subscribe(results => {
        //results[0] is our character
        // results[1] is our character homeworld
        console.log(results[0]);
        console.log(results[1]);
        });   
      }
  
}*/