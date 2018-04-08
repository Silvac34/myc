import { Component, OnInit, Input, ElementRef, NgZone, ViewChild } from '@angular/core';
import { NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { GoogleMapService } from '../../services/google-map.service';
import { MapsAPILoader } from '@agm/core';
import { } from 'googlemaps';

const equals = (one: NgbDateStruct, two: NgbDateStruct) =>
  one && two && two.year === one.year && two.month === one.month && two.day === one.day;

const before = (one: NgbDateStruct, two: NgbDateStruct) =>
  !one || !two ? false : one.year === two.year ? one.month === two.month ? one.day === two.day
    ? false : one.day < two.day : one.month < two.month : one.year < two.year;

const after = (one: NgbDateStruct, two: NgbDateStruct) =>
  !one || !two ? false : one.year === two.year ? one.month === two.month ? one.day === two.day
    ? false : one.day > two.day : one.month > two.month : one.year > two.year;

@Component({
  selector: 'app-filter-view-meals',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
})
export class FilterComponent implements OnInit {
  //permet de faire apparaître tous les filtres lors du chargement de la page
  @Input() filter: any;
  dateRangeSeparator: string = "";
  
  isCollapsed = {
    "weekDays": false,
    "preference": false,
    "period": false,
    "price": false,
    "place": false,
    "helpType": false
  };

  @ViewChild("autocompleteCities")
  public searchElementRef: ElementRef;
  
  constructor(
    public calendar: NgbCalendar,
    private googleMapService: GoogleMapService,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    private gMap: GoogleMapService
    ) {}
  
  ngOnInit() {
    //load Places Autocomplete
    this.mapsAPILoader.load().then(() => {
      let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, {
        types: ["(cities)"]
      });
      autocomplete.addListener("place_changed", () => {
        this.ngZone.run(() => {
          //get the place result
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();
  
          //verify result
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }
          if (place != undefined) {
            if ("vicinity" in place) {
              this.filter.cityFilter.town = place.vicinity;
            }
            else {
              this.filter.cityFilter.town = place.formatted_address.split(",")[0];
            }
            for (var i = 0; i < place.address_components.length; i++) {
              if (place.address_components[i].types[0] == "country") {
                this.filter.cityFilter.country_code = place.address_components[i].short_name;
              }
            //Si on veut supprimer la valeur qu'on voit dans le filtre après l'avoir renseigné
            //this.searchElementRef.nativeElement.value = null;
            }
          }
        });
      });
    });
  }
  
  isFilterSelected(filterType) {
    let isSelected = false;
    this.filter[filterType].forEach((item) => {
      if (item.selected === true) {
        isSelected = true;
      }
    });
    return isSelected;
  }
  
  resetFilter(filterType) {
    this.filter[filterType].forEach((item) => {
      item.selected = false;
    });
  }
  
  hoveredDate: NgbDateStruct;

  fromDate: NgbDateStruct;
  toDate: NgbDateStruct;

  onDateSelection(date: NgbDateStruct, datePicker: any) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
      this.filter.dateFilterMin = new Date(this.fromDate.year,this.fromDate.month-1,this.fromDate.day, 0, 0, 0);
    } else if (this.fromDate && !this.toDate && after(date, this.fromDate)) {
      this.toDate = date;
      this.filter.dateFilterMax = new Date(this.toDate.year,this.toDate.month-1,this.toDate.day, 11, 59, 59);
      this.dateRangeSeparator = "-";
      datePicker.close();
    } else {
      this.toDate = null;
      this.fromDate = date;
      this.filter.dateFilterMin = new Date(this.fromDate.year,this.fromDate.month-1,this.fromDate.day, 0, 0, 0);
    }
  }

  isHovered = date => this.fromDate && !this.toDate && this.hoveredDate && after(date, this.fromDate) && before(date, this.hoveredDate);
  isInside = date => after(date, this.fromDate) && before(date, this.toDate);
  isFrom = date => equals(date, this.fromDate);
  isTo = date => equals(date, this.toDate);


}
