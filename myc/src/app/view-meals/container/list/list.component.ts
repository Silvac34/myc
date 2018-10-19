import { Component, Input, OnInit } from '@angular/core';
import { MealsService } from '../../../services/meals.service';
import { ViewMealDtldComponent } from '../../view-meal-dtld/view-meal-dtld.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';

@Component({
  selector: 'meal-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  @Input() meals: any;
  @Input() userId: string;
  @Input() reverseOrderMeal: boolean;
  @Input() selectedFilter: any;
  
  constructor(public ms: MealsService, private modalService: NgbModal, public router: Router) {
    
  }

  ngOnInit() {
  }
  
  openModalDtld(meal) {
    console.log(this.ms.datasUserForEachMeal(meal, this.userId));
    if(this.ms.datasUserForEachMeal(meal, this.userId).status === "accepted" || (this.ms.datasUserForEachMeal(meal, this.userId).status === "old" && this.router.url === "/my_meals")) {
      this.router.navigate(["/my_meals/"+meal.id]);
    }
    else{
      const modalRef = this.modalService.open(ViewMealDtldComponent, { "centered": true, "size": "lg" });
      modalRef.componentInstance.meal = meal;
      modalRef.componentInstance.userId = this.userId;
      modalRef.componentInstance.userMealDatas = this.ms.datasUserForEachMeal(meal, this.userId);
    }
  }
  

}
