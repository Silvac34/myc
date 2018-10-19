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
    
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): any {
        let id = route.paramMap.get('id');
        return this.getMealFromId(id).take(1).map(meal => {
          if (meal) {
            console.log(this.mealDoc);
            return this.mealDoc;
          } else { // id not found
            this.router.navigate(['/view_meals']);
            return null;
          }
        });
    }
    
    getMealFromId(mealId: string) {
        this.mealDoc = this.afs.doc<Meal>('meals/' + mealId);
        return this.meal = this.mealDoc.valueChanges();
    }
}