import { Component, OnInit, Input } from '@angular/core';
import { MealsService } from '../../../services/meals.service';
import { AuthService } from '../../../services/auth.service';
import { NgbdModalLoginContent } from '../../../welcome/welcome.component';
import { ViewMealDtldComponent } from '../../view-meal-dtld/view-meal-dtld.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';

@Component({
  selector: 'meal-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  @Input() meals: any;
  @Input() userId: string;
  @Input() selectedFilter: any;
  public userLat: number = null;
  public userLng: number = null;
  
  constructor(public ms: MealsService, private modalService: NgbModal, public auth: AuthService, public router: Router) {
    navigator.geolocation.getCurrentPosition(pos => {
      this.userLat = pos.coords.latitude;
      this.userLng = pos.coords.longitude;
    });
  }

  ngOnInit() {
  }
  
  openModalLogin(content) {
    this.modalService.open(NgbdModalLoginContent)
  }
  
  openModalDtld(meal) {
    if(this.ms.datasUserForEachMeal(meal, this.userId).status === "accepted") {
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
