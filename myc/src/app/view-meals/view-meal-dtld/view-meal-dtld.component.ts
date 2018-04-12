import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms' //on fait du reactive forms
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-view-meal-dtld',
  templateUrl: './view-meal-dtld.component.html',
  styleUrls: ['./view-meal-dtld.component.scss']
})
export class ViewMealDtldComponent implements OnInit {
  @Input() meal: any;
  @Input() userMealDatas: any;
  public createRequestRoleForm: FormGroup;
  public activePanel: string;
  public now = new Date();
  constructor(
    public activeModal: NgbActiveModal,
    private formB: FormBuilder,
    public auth: AuthService
  ) { }

  ngOnInit() {
    this.createForm();
    console.log(this.userMealDatas);
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
    let firstHelpType = null;
    if(this.meal.detailedInfo.requiredGuests.cooks.nbRquCooks > 0){
      firstHelpType = "cook";
      this.activePanel = "cookInput";
    }
    else if(this.meal.detailedInfo.requiredGuests.cleaners.nbRquCleaners > 0){
      firstHelpType = "cleaner";
      this.activePanel = "cleanerInput";
    }
    else if(this.meal.detailedInfo.requiredGuests.simpleGuests.nbRquSimpleGuests > 0){
      firstHelpType = "simpleGuest";
      this.activePanel = "simpleGuestInput";
    }
    this.createRequestRoleForm = this.formB.group({
      "requestRoleInput": firstHelpType,
      "requestMessage": null
    })
  }
  
  getUserStatus() {
    //for(let i=0; i < this.meal.users.length; i++) {
      
    //}
  }
}
