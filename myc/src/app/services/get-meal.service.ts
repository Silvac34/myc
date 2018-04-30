import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { Meal } from '../data-model/meal';
import { GetUserService } from './get-user.service';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import { Router, Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';

@Injectable()
export class GetMealService implements Resolve<Meal> {
    private mealDoc: AngularFirestoreDocument<Meal>;
    meal: Observable<Meal>;

    constructor(private afs: AngularFirestore, private getUserService: GetUserService, private router: Router) { }
    
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Meal> {
        let id = route.paramMap.get('id');
        return this.getMealFromId(id).take(1).map(meal => {
          if (meal) {
            return meal;
          } else { // id not found
            this.router.navigate(['/view_meals']);
            return null;
          }
        });
    }
    
    getMealFromId(mealId: string) {
        this.mealDoc = this.afs.doc<Meal>('meals/' + mealId);
        return this.meal = this.mealDoc.valueChanges().map(actions => {
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
                  }
            }
            return actions;
        });
    }
}