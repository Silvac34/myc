import { Component, OnInit, Input } from '@angular/core';
import { MealsService } from '../../../services/meals.service';

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
  
  constructor(public ms: MealsService) {
    navigator.geolocation.getCurrentPosition(pos => {
      this.userLat = pos.coords.latitude;
      this.userLng = pos.coords.longitude;
    });
  }

  ngOnInit() {
  }
}
