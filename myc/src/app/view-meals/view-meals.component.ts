import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FilterComponent } from './filter/filter.component';
import { AngularFirestore } from 'angularfire2/firestore';
import { GetUserService } from '../services/get-user.service';
import { AuthService } from '../services/auth.service';
import { NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
    
const now = new Date;

@Component({
  selector: 'app-view-meals',
  templateUrl: './view-meals.component.html',
  styleUrls: ['./view-meals.component.scss']
})
export class ViewMealsComponent implements OnInit {
  
  public meals: any;
  public oldMeals: any;
  public userId: string = null;
  public incomingMeals: boolean;
  public displayMealList: boolean = true;
  public arrowDirection: string = "down";
  public reverseOrderMeal: number = 0;
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
  public hoveredDate: NgbDateStruct;
  public fromDate: NgbDateStruct;
  public toDate: NgbDateStruct;
  
  constructor(private modalService: NgbModal, private afs: AngularFirestore, private getUserService: GetUserService, public auth: AuthService) {

  }
  
  ngOnInit() {
    this.auth.userMeta.subscribe(results => {
      if(results){
        this.userId = results.payload.id;
      }
      else {
        this.userId = null;
      }
    });
    this.getMeals(now);
    this.meals.subscribe(result => {
      if(result.length === 0) { 
        this.getOldMeals(now);
      }
      /*else {
        this.getMeals(now);
      }*/
    })
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
  
  getMealDetailedFunction(actions) {
    return actions.map(a => {
      const data = a.payload.doc.data();
      //on récupère les détails de chacun de utilisateurs
      for (let i = 0; i < data.users.length; i++) {
        this.getUserService.getUserFromId(data.users[i].id).subscribe(results => {
          data.users[i]["detail"] = results ;
        });
        //on définit le prix à afficher par repas
        data["priceUnit"] = Math.ceil(10 * data.price / data.nbGuests) / 10;
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
          data["mealPrice"] = data.detailedInfo.requiredGuests.hosts ? data.detailedInfo.requiredGuests.hosts.price : data["priceUnit"];
        }
      }
      
      const id = a.payload.doc.id;
      return { id, ...data };
    })
  }
  
  getMeals(now) {
    //on définit par order desc par défaut puisque le filtre pour inverser l'ordre des repas s'initialise et le fait 1 fois par défaut. Il faut donc charger les meals à l'envers.
    this.meals = this.afs.collection("meals", ref => ref.where('date','>=',now).orderBy('date','desc')).snapshotChanges().map(actions => this.getMealDetailedFunction(actions));
  }
  
  getOldMeals(now) {
    this.meals = this.afs.collection("meals", ref => ref.where('date','<',now).orderBy('date', 'asc')).snapshotChanges().map(actions => this.getMealDetailedFunction(actions));
  }
    
  InitializeMealsMap() {
    console.log("initializing");
  }
  
};