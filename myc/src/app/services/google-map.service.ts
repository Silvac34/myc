import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

const GOOGLE_MAP_URL = "https://maps.googleapis.com/maps/api/";
 // Initialize Params Object
let PARAMS = new HttpParams();
// Begin assigning parameters
PARAMS = PARAMS.append('key', environment.googleMapKey);//A variabiliser selon l'environnement de travail

@Injectable()
export class GoogleMapService {
  
  constructor(private http: HttpClient) { }
  
  ReverseGeocoding(latlngInput : string) {
    return this.http.get<any>(GOOGLE_MAP_URL + "geocode/json", {params: PARAMS.append('latlng', latlngInput)});      
  }
}