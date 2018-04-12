import { Component, OnInit, Input, NgZone } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms' //on fait du reactive forms
import { AuthService } from '../../services/auth.service';
import { MessengerCheckboxService } from '../../services/messenger-checkbox.service';
import { environment } from '../../../environments/environment';
import { NgbdModalLoginContent } from '../../welcome/welcome.component'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
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
  public progress: number  = 0; //mesure le progrès de chargement de la page (permet de lancer le FB.XFBML.parse() après que la vue soit chargée
  
  constructor(
    public activeModal: NgbActiveModal,
    private formB: FormBuilder,
    public auth: AuthService,
    private ngZone: NgZone,
    private modalService: NgbModal,
    private afs: AngularFirestore,
    private messengerCheckbox: MessengerCheckboxService
    ) { }

  ngOnInit() {
    this.createForm();
    this.auth.user.subscribe(data => {
      if(data) {
        this.userCellphone = data.privateInfo.cellphone;
        if(data.privateInfo.user_ref) {
          this.messengerCheckbox.initializeFbMessenger();
        }
      }
    })
  }
  
  confirmOptIn() {
    window["FB"]["AppEvents"].logEvent('MessengerCheckboxUserConfirmation', null, {
      'app_id': this.app_id,
      'page_id': this.page_id,
      'ref': this.userId,
      'user_ref': this.user_ref
    });
  }
  
  availablePlaces(helpType) {
    let placesOccupied = 0;
    for(let i=0; i < this.meal.users.length; i++){
      if(this.meal.users[i].role === helpType){
        placesOccupied++;
      }
    }
    return this.meal["detailedInfo"]["requiredGuests"][helpType]["nbRqu" + helpType.replace(/\b\w/g, l => l.toUpperCase())] - placesOccupied;
  }
  
  createForm() {
    this.createRequestRoleForm = this.formB.group({
      "requestRoleInput": null,
      "requestMessage": null,
      "cellphone": this.userCellphone
    })
  }
  
  onSubmit(){
    console.log(this.createRequestRoleForm.get('requestRoleInput'))
    if (this.createRequestRoleForm.valid) {
      this.updateUser();
    } 
    else {
      //si le form n'est pas valide, on marque tous les controls comme touched et donc les validations fonctionnent
      //this.validateAllFormFields(this.createRequestRoleForm);
    }
  }
  
    
  updateUser() {
    let data = {};
    data = {"privateInfo.user_ref": this.user_ref, "privateInfo.cellphone": this.createRequestRoleForm.value.cellphone}//on ne met pas de if car de toute façon le téléphone est obligatoire
    this.afs.doc<User>(`users/${this.userId}`).update(data)
    .then(function(result){
      console.log(result);
    })
    .catch(function(error) {
      console.error(error);
    });
  }
  
  openModalLogin(content) {
    this.modalService.open(NgbdModalLoginContent).result.then(result => this.user_ref = Math.floor((Math.random() * 10000000000000) + 1).toString());
  }
}
