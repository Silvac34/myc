import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { GetUserService } from '../services/get-user.service';
import { GetCountryService } from '../services/get-country.service';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { User } from '../data-model/user';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms' //on fait du reactive forms
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';

const now = new Date();

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  public createProfileForm: FormGroup;
  public user: User;
  private minDate= {"year": 1900, "month": 1, "day": 1};
  private startDate= {"year": ((new Date()).getFullYear() - 28), "month": 1, "day": 1};
  private maxDate= {"year": ((new Date()).getFullYear() - 18), "month": 12, "day": 31}; //on limite l'accès aux majeurs
  formatMatches = (value: any) => value.name || '';
  public country_list: Observable<Object>;

  constructor(
    private route: ActivatedRoute,
    public auth: AuthService,
    private getUserService: GetUserService,
    private _getCountryService: GetCountryService,
    private formB: FormBuilder
  ) { }
  
  ngOnInit() {
    this.route.paramMap.subscribe((paramMap: Params) => {
      this.getUserService.getPrivateUserFromId(paramMap.get('id')).subscribe(result => {
        this.user = result;
        this.createForm();
      })
    })
  }

  createForm() {
    this.createProfileForm = this.formB.group({
      "birthdate": this.user.birthdate ? {"year": this.user.birthdate.getFullYear(), "month": this.user.birthdate.getMonth(), "day": this.user.birthdate.getDate()} : null,
      "gender": this.user.gender || null,
      "email": this.user.privateInfo ? (this.user.privateInfo.email || null)  : null, //récupérer email de l'user
      "cellphone": this.user.privateInfo ? (this.user.privateInfo.cellphone || null)  : null, //récupérer le cellphone de l'user
      "country_of_origin": this.user.spoken_languages || null,
      "presentation": this.user.presentation || null
    })
  }
  
  onSubmit() {
    //rajouter la fonction qui actualise les données de l'utilisateur
  }
  
  //permet de récupérer la liste des pays en lien avec ce qu'à taper l'utilisateur dans le typeahead
  search = (text$: Observable<string>) =>
  text$.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(term => this._getCountryService.search(term))
  )
    
}
