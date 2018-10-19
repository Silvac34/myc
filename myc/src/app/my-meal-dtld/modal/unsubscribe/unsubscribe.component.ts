import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AngularFirestore } from 'angularfire2/firestore';
import { Meal } from '../../../data-model/meal';
import { MealsService } from '../../../services/meals.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-unsubscribe',
  templateUrl: './unsubscribe.component.html',
  styleUrls: ['./unsubscribe.component.scss']
})
export class UnsubscribeComponent {
  @Input() meal: any;
  @Input() mealId: string;
  @Input() userId: string;
  
  constructor(public activeModal: NgbActiveModal, private afs: AngularFirestore, public router: Router, private ms: MealsService) { }
  
  unsubscribe() {
   //fonction pour se désinscrire qui serait faîtes des les cloud funciton 
  }
}