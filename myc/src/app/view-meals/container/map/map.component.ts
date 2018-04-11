import { Component, OnInit, Input } from '@angular/core';
import { MealsService } from '../../../services/meals.service';
import { AuthService } from '../../../services/auth.service';
import { NgbdModalLoginContent } from '../../../welcome/welcome.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

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
  
  constructor(public ms: MealsService, private modalService: NgbModal, public auth: AuthService) {
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
}
