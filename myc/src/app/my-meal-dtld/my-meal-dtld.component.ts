import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Meal } from '../data-model/meal';
import { MealsService } from '../services/meals.service';
import { AuthService } from '../services/auth.service';
import { MessengerCheckboxService } from '../services/messenger-checkbox.service';

@Component({
  selector: 'app-my-meal-dtld',
  templateUrl: './my-meal-dtld.component.html',
  styleUrls: ['./my-meal-dtld.component.scss']
})
export class MyMealDtldComponent implements OnInit {
  now = new Date();
  meal: Meal;
  userId: string;
  data_href: string;
  //@ViewChild(FBCommentsComponent) commentBox: FBCommentsComponent;
  
  constructor(
    private route: ActivatedRoute,
    public ms: MealsService,
    public auth: AuthService,
    private messengerCheckbox: MessengerCheckboxService
  ) { }

  ngOnInit() {
    this.route.data
    .subscribe((data: { meal: Meal }) => {
      this.meal = data.meal;
      this.meal["currentPricePayback"] = 0;
      this.meal["pricePaybackIfFull"] = 0;
    });
    this.auth.userMeta.subscribe(results => {
      if(results){
        this.userId = results.payload.id;
      }
      else {
        this.userId = null;
      }
    });
    //permet d'attendre que la view soit chargée pour faire un parse de FB pour obtenir le fb-comment plugin
    this.messengerCheckbox.initializeFbMessenger();
  }
  
  openModalDeleteUnsubscribe() {
    if (this.ms.datasUserForEachMeal(this.meal, this.userId).role ==='admin') {
      //delete
    }
    else {
      //unsubscribe
    }
  }
}
