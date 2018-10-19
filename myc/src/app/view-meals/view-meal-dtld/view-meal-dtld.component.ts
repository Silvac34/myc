import { Component, OnInit, Input, NgZone } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms' //on fait du reactive forms
import { AuthService } from '../../services/auth.service';
import { MessengerCheckboxService } from '../../services/messenger-checkbox.service';
import { environment } from '../../../environments/environment';
import { AngularFirestore } from 'angularfire2/firestore';
import { User } from '../../data-model/user';

@Component({
  selector: 'app-view-meal-dtld',
  templateUrl: './view-meal-dtld.component.html',
  styleUrls: ['./view-meal-dtld.component.scss']
})
export class ViewMealDtldComponent implements OnInit {
  @Input() meal: any;
  @Input() userMealDatas: any;
  @Input() userId: any;
  public createRequestRoleForm: FormGroup;
  private userCellphone: string;
  public now = new Date();
  public app_id: string = environment.facebookConfig.appId;
  public page_id: string = environment.pageId;
  public origin: string = environment.fbRedirectURI.concat("view_meals");
  public user_ref: string = Math.floor((Math.random() * 10000000000000) + 1).toString();
  public listHelpType = ["admin"];
  
  constructor(
    public activeModal: NgbActiveModal,
    private formB: FormBuilder,
    public auth: AuthService,
    private ngZone: NgZone,
    private afs: AngularFirestore,
    private messengerCheckbox: MessengerCheckboxService
    ) { }

  ngOnInit() {
    this.createForm();
    this.auth.user.subscribe(data => {
      if(data) {
        this.userCellphone = data.privateInfo.cellphone;
        if(!data.privateInfo.user_ref) {
          this.messengerCheckbox.initializeFbMessenger();
        }
      }
    });
    if(this.meal.detailedInfo.requiredGuests.cooks.nbRquCooks > 0) {
      this.listHelpType.push("cook");
    }
    if(this.meal.detailedInfo.requiredGuests.cleaners.nbRquCleaners > 0) {
      this.listHelpType.push("cleaner");
    }
    if(this.meal.detailedInfo.requiredGuests.simpleGuests.nbRquSimpleGuests > 0) {
      this.listHelpType.push("simpleGuest");
    }
  }
  
  availablePlaces(helpType) {
    if(helpType === "cooks" || helpType === "cleaners" || helpType === "simpleGuests"){
      let placesOccupied = 0;
      for(let i=0; i < this.meal.users.length; i++){
        if(this.meal.users[i].role === helpType){
          placesOccupied++;
        }
      }
      return this.meal["detailedInfo"]["requiredGuests"][helpType]["nbRqu" + helpType.replace(/\b\w/g, l => l.toUpperCase())] - placesOccupied;
    }
    else{
      return null;
    }
  }
  
  isTypeOccupied(helpType) {
    return this.meal.users.map(r=>r.role).indexOf(helpType) !== -1;
  }
  
  createForm() {
    this.createRequestRoleForm = this.formB.group({
      "requestRoleInput": null,
      "requestMessage": null,
      "cellphone": this.userCellphone
    })
  }
  
  onSubmit(){
    if (this.createRequestRoleForm.valid) {
      this.updateUser();
    } 
    else {
      //si le form n'est pas valide, on marque tous les controls comme touched et donc les validations fonctionnent
      //this.validateAllFormFields(this.createRequestRoleForm);
    }
  }
  
  unsubscribe() {
    //fonction pour se désinscrire du repas si on est en pending
  }
    
  updateUser() {
    let data = {};
    data = {"privateInfo.user_ref": this.user_ref, "privateInfo.cellphone": this.createRequestRoleForm.value.cellphone}//on ne met pas de if car de toute façon le téléphone est obligatoire
    this.afs.doc<User>(`users/${this.userId}`).update(data)
    .then(function(result){
    })
    .catch(function(error) {
      console.error(error);
    });
  }
}
