import { Component, Input, OnInit } from '@angular/core';
import { MealsService } from '../../../services/meals.service';

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
  
  constructor(public ms: MealsService) {
    
  }

  ngOnInit() {
  }

}
