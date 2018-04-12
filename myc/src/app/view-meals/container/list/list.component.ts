import { Component, Input, OnInit } from '@angular/core';
import { MealsService } from '../../../services/meals.service';
import { ViewMealDtldComponent } from '../../view-meal-dtld/view-meal-dtld.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

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
  
  constructor(public ms: MealsService, private modalService: NgbModal,) {
    
  }

  ngOnInit() {
  }
  
  openModalDtld(meal, userCellphone) {
    const modalRef = this.modalService.open(ViewMealDtldComponent, { "centered": true });
    modalRef.componentInstance.meal = meal;
    modalRef.componentInstance.userId = this.userId;
    modalRef.componentInstance.userMealDatas = this.ms.datasUserForEachMeal(meal, this.userId);
  }
  

}
