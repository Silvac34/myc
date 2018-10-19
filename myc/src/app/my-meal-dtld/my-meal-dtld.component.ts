import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Meal } from '../data-model/meal';
import { MealsService } from '../services/meals.service';
import { AuthService } from '../services/auth.service';
import { GetUserService } from '../services/get-user.service';
import { MessengerCheckboxService } from '../services/messenger-checkbox.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DeleteComponent } from './modal/delete/delete.component';
import { EditComponent } from './modal/edit/edit.component';
import { UnsubscribeComponent } from './modal/unsubscribe/unsubscribe.component';
import { Observable } from 'rxjs/Observable';
import { AngularFirestoreDocument } from 'angularfire2/firestore';

@Component({
  selector: 'app-my-meal-dtld',
  templateUrl: './my-meal-dtld.component.html',
  styleUrls: ['./my-meal-dtld.component.scss']
})
export class MyMealDtldComponent implements OnInit {
  now = new Date();
  mealObs: Observable<Meal>;
  meal: Meal;
  mealId: string;
  userId: string;
  data_href: string;
  //@ViewChild(FBCommentsComponent) commentBox: FBCommentsComponent;
  
  constructor(
    private route: ActivatedRoute,
    public ms: MealsService,
    public auth: AuthService,
    private messengerCheckbox: MessengerCheckboxService,
    private modalService: NgbModal,
    private getUserService: GetUserService
  ) { }

  ngOnInit() {
    this.route.data.subscribe((data: { meal: AngularFirestoreDocument<Meal> }) => {
      this.mealObs = data.meal.valueChanges().map(actions => {
            if(actions) {
              for (let i = 0; i < actions.users.length; i++) {
                this.getUserService.getPrivateUserFromId(actions.users[i].id).subscribe(results => {
                  actions.users[i]["detail"] = results ;
                });
                //on définit le prix à afficher par repas
                if (actions.users[i].role === "cooks") {
                  actions["mealPrice"] = actions.detailedInfo.requiredGuests.cooks.price;
                }
                else if (actions.users[i].role === "cleaners") {
                  actions["mealPrice"] = actions.detailedInfo.requiredGuests.cleaners.price;
                }
                else if (actions.users[i].role === "simpleGuests") {
                  actions["mealPrice"] = actions.detailedInfo.requiredGuests.simpleGuests.price;
                }
                else  {
                  actions["mealPrice"] = actions.detailedInfo.requiredGuests.hosts.price;
                }
                actions["priceUnit"] = (Math.ceil(10 * actions.price / actions.nbGuests) / 10);
                actions["currentPricePayback"] = 0;
                actions["pricePaybackIfFull"] = 0;
              };
              return actions;
            }
        });
    });
    this.route.paramMap.subscribe((paramMap: Params) => {
      this.mealId = paramMap.get('id');
    })
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
  
  openModalDeleteUnsubscribe(meal) {
    if (this.ms.datasUserForEachMeal(meal, this.userId).role ==='admin') {
      //delete
      const modalRefDelete = this.modalService.open(DeleteComponent);
      modalRefDelete.componentInstance.mealId = this.mealId;
    }
    else {
      const modalRefUnsubscribe = this.modalService.open(UnsubscribeComponent);
      modalRefUnsubscribe.componentInstance.mealId = this.mealId;
      modalRefUnsubscribe.componentInstance.meal = meal;
      modalRefUnsubscribe.componentInstance.userId = this.userId;
    }
  }
}
