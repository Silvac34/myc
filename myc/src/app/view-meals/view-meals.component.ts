import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FilterComponent } from './filter/filter.component';
import { AngularFirestore } from 'angularfire2/firestore';
import { GetUserService } from '../services/get-user.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-view-meals',
  templateUrl: './view-meals.component.html',
  styleUrls: ['./view-meals.component.scss']
})
export class ViewMealsComponent implements OnInit {
  
  public meals: any;
  public oldMeals: any;
  public userId: string = null;
  public displayMealList: boolean = true;
  public arrowDirection: string = "down";
  public reverseOrderMeal: number = 0;
  public selectedFilter = {
    weekDays: [{
      "label": "VIEW_MEALS.FILTERS.DAY.MONDAY",
      "selected": false,
    }, {
      "label": "VIEW_MEALS.FILTERS.DAY.TUESDAY",
      "selected": false,
    }, {
      "label": "VIEW_MEALS.FILTERS.DAY.WEDNESDAY",
      "selected": false,
    }, {
      "label": "VIEW_MEALS.FILTERS.DAY.THURSDAY",
      "selected": false,
    }, {
      "label": "VIEW_MEALS.FILTERS.DAY.FRIDAY",
      "selected": false,
    }, {
      "label": "VIEW_MEALS.FILTERS.DAY.SATURDAY",
      "selected": false,
    }, {
      "label": "VIEW_MEALS.FILTERS.DAY.SUNDAY",
      "selected" : false,
    }],
    dateFilterMin: {
      opened: false,
      value: null
    },
    dateFilterMax: {
      opened: false,
      value: null
    },
    priceFilterMin: {
      value: null
    },
    priceFilterMax: {
      value: null
    },
    cityFilter: "",
    preferenceFilter: [{ 
        "label": "VIEW_MEALS.FILTERS.PREFERENCES.VEGETARIAN",
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
    helpTypeFilter: [{ 
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
  
  constructor(private modalService: NgbModal, private afs: AngularFirestore, private getUserService: GetUserService, public auth: AuthService) { }
  
  ngOnInit() {
    this.auth.userMeta.subscribe(results => {
      this.userId = results.payload.id;
    });
    this.getMeals();
  }

  openModalFilter(content) {
    this.modalService.open(content)
  }
  
  changeArrow() {
    if (this.arrowDirection === "down"){
      this.arrowDirection = "up";
    }
    else {
      this.arrowDirection = "down";
    }
    this.reverseOrderMeal++;
  }
  
  getMeals() {
    let now = new Date;
    this.meals = this.afs.collection("meals", ref => ref.where('date','>=',now).orderBy('date')).snapshotChanges().map(actions => {
      return actions.map(a => {
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
      })
    });
    
    this.oldMeals = this.afs.collection("meals", ref => ref.where('date','<',now).orderBy('date', 'desc')).snapshotChanges().map(actions => {
      return actions.map(a => {
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
      })
    });
  }

  InitializeMealsMap() {
    console.log("initializing");
  }
  
  //faire une fonction qui applique les filtres
};