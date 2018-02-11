import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

const GOOGLE_MAP_URL = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
 // Initialize Params Object
let PARAMS = new HttpParams();
// Begin assigning parameters
PARAMS = PARAMS.append('key', 'AIzaSyBwwM-TMFz42n8ZDaGHF-8rGt76cdoXN8M');//A variabiliser selon l'environnement de travail

@Injectable()
export class GoogleMapService {
  
  constructor(private http: HttpClient) { }
  
  ReverseGeocoding(latlngInput : string) {
    return this.http.get<any>('https://maps.googleapis.com/maps/api/geocode/json', {params: PARAMS.append('latlng', latlngInput)});      
  }
}