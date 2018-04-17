import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { GetUserService } from '../services/get-user.service';
import { AuthService } from '../services/auth.service';
import { MealsService } from '../services/meals.service';

const now = new Date();

@Component({
  selector: 'app-my-meals',
  templateUrl: './my-meals.component.html',
  styleUrls: ['./my-meals.component.scss']
})
export class MyMealsComponent implements OnInit {
  public incomingMeals: any;
  public oldMeals: any;
  public userId: string;
  public selectedFilter = {
    "weekDays": [{
      "label": "VIEW_MEALS.FILTERS.DAY.MONDAY",
      "selected": false,
      "ind": 1
    }, {
      "label": "VIEW_MEALS.FILTERS.DAY.TUESDAY",
      "selected": false,
      "ind": 2
    }, {
      "label": "VIEW_MEALS.FILTERS.DAY.WEDNESDAY",
      "selected": false,
      "ind": 3
    }, {
      "label": "VIEW_MEALS.FILTERS.DAY.THURSDAY",
      "selected": false,
      "ind": 4
    }, {
      "label": "VIEW_MEALS.FILTERS.DAY.FRIDAY",
      "selected": false,
      "ind": 5
    }, {
      "label": "VIEW_MEALS.FILTERS.DAY.SATURDAY",
      "selected": false,
      "ind": 6
    }, {
      "label": "VIEW_MEALS.FILTERS.DAY.SUNDAY",
      "selected" : false,
      "ind": 0
    }],
    "dateFilterMin": null,
    "dateFilterMax": null,
    "priceFilterMin": null,
    "priceFilterMax": null,
    "cityFilter": {
      "town": null,
      "country_code": null
    },
    "preferenceFilter": [{ 
        "label": "VIEW_MEALS.FILTERS.PREFERENCES.VEGGIES",
        "selected": false 
      }, {
        "label": "VIEW_MEALS.FILTERS.PREFERENCES.VEGAN",
        "selected": false 
      }, { 
        "label": "VIEW_MEALS.FILTERS.PREFERENCES.HALAL",
        "selected": false 
      }, { 
        "label": "VIEW_MEALS.FILTERS.PREFERENCES.KOSHER",
        "selected": false 
    }],
    "helpTypeFilter": [{ 
        "label": "VIEW_MEALS.FILTERS.HELP_TYPE.HELP_COOKING",
        "selected": false 
      }, {
        "label": "VIEW_MEALS.FILTERS.HELP_TYPE.HELP_CLEANING",
        "selected": false 
      }, {
        "label": "VIEW_MEALS.FILTERS.HELP_TYPE.SIMPLE_GUEST",
        "selected": false 
    }]
  };
  
  constructor(private afs: AngularFirestore, private getUserService: GetUserService, public auth: AuthService, public ms: MealsService) { }

  ngOnInit() {
    this.auth.userMeta.subscribe(results => {
      if(results){
        this.userId = results.payload.id;
        // Lorsque AngularFirstore le permettra, corriger la requête pour que n'apparaisse que les repas où id contenu dans l'array users === userId. Pour le moment on ne peut faire de requête sur des arrays
        this.incomingMeals = this.afs.collection("meals", ref => ref.where('date','>=',now).orderBy('date','desc')).snapshotChanges().map(actions => this.getMealDetailedFunctionFiltered(actions, this.userId));
        this.oldMeals = this.afs.collection("meals", ref => ref.where('date','<',now).orderBy('date', 'asc')).snapshotChanges().map(actions => this.getMealDetailedFunctionFiltered(actions, this.userId, "old"));
      }
    });
  }

  countMealWithPendingRequest() {
    return 0;
  }
  
   getMealDetailedFunctionFiltered(actions, userId, dateType?) {
    let meals = actions.map(a => {
      const data = a.payload.doc.data();
      //on récupère les détails de chacun de utilisateurs
      for (let i = 0; i < data.users.length; i++) {
        this.getUserService.getUserFromId(data.users[i].id).subscribe(results => {
          data.users[i]["detail"] = results ;
        });
        //on définit le prix à afficher par repas
        if (data.users[i].role === "cooks") {
          data["mealPrice"] = data.detailedInfo.requiredGuests.cooks.price;
        }
        else if (data.users[i].role === "cleaners") {
          data["mealPrice"] = data.detailedInfo.requiredGuests.cleaners.price;
        }
        else if (data.users[i].role === "simpleGuests") {
          data["mealPrice"] = data.detailedInfo.requiredGuests.simpleGuests.price;
        }
        else  {
          data["mealPrice"] = data.detailedInfo.requiredGuests.hosts.price;
        }
        data["priceUnit"] = Math.ceil(10 * data.price / data.nbGuests) / 10;
      }
      
      const id = a.payload.doc.id;
      return { id, ...data };
    });
    meals.forEach((element, index, array) => {
      let msDataUser = this.ms.datasUserForEachMeal(element, userId);
      if (!msDataUser.role || (dateType === "old" && msDataUser.status !== "old") || (dateType !== "old" && msDataUser.status === "old")) {
        delete array[index];
      }
    })
    return meals;
  }
  
}
