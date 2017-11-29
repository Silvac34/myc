import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewMealsComponent } from './view-meals.component';

describe('ViewMealsComponent', () => {
  let component: ViewMealsComponent;
  let fixture: ComponentFixture<ViewMealsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewMealsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewMealsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
