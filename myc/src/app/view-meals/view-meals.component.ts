import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FilterComponent } from './filter/filter.component';
import { AngularFirestore } from 'angularfire2/firestore';
import { GetUserService } from '../services/get-user.service';

@Component({
  selector: 'app-view-meals',
  templateUrl: './view-meals.component.html',
  styleUrls: ['./view-meals.component.scss']
})
export class ViewMealsComponent {
  
  public meals: any;
  public displayMealList: boolean = true;
  public arrowDirection: string = "down";
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
  
  constructor(private modalService: NgbModal, private afs: AngularFirestore, private getUserService: GetUserService) { }
  
  ngOnInit() {
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
  }
  
  getMeals() {
    let now = new Date;
    this.meals = this.afs.collection("meals", ref => ref.where('date','>=',now).orderBy('date')).snapshotChanges().map(actions => {
      return actions.map(a => {
        const data = a.payload.doc.data();
        for (let i = 0; i < data.users.length; i++) {
          this.getUserService.getUserFromId(data.users[i].id).subscribe(results => {
            data.users[i]["detail"] = results ;
          });
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