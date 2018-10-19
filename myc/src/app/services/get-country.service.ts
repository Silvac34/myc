import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs/observable/of';
import { map } from 'rxjs/operators';

@Injectable()
export class GetCountryService {
//adresse pour récupérer le drapeau du pays http://flagpedia.net/data/flags/w580/{{code pays en miniscule).png
  constructor(private http: HttpClient) {}
  
  country_json = this.http.get('../../assets/countries/country_list.json');
  
  search(term: string) {
    if (term === '') {
      return of([]);
    }
   this.country_json.map((data: Array<Object>) => data.map(newdata => newdata["name"]).filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1)).subscribe(res=>console.log(res));
    return this.http.get('../../assets/countries/country_list.json')
      .map((data: Array<Object>) => data.map(newdata => newdata["name"])
      .filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1))
  }
}
