import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable()
export class MealsService {
    constructor(private auth: AuthService) {}
    
    datasUserForEachMeal(meal, userId) { //function qui retourne l'utilisateur s'il s'est inscrit --> récupérer l'utilisateur
        let state = null;
        let role = null;
        let pendingRequests = 0;
        let now = new Date();
        for (let i =0; i< meal.users.length; i++) {
          if(meal.users[i].id === userId) {
            if(meal.date >= now){
              state = meal.users[i].status;
            }
            else {
              state = "old";
            }
            role = meal.users[i].role;
          }
          if(meal.users[i].status === "pending") {
            pendingRequests += 1;
          }
        }
        return {"status": state,"role": role, "pendingRequests": pendingRequests};
    }
}
