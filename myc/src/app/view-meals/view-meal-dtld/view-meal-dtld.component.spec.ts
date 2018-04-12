import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewMealDtldComponent } from './view-meal-dtld.component';

describe('ViewMealDtldComponent', () => {
  let component: ViewMealDtldComponent;
  let fixture: ComponentFixture<ViewMealDtldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewMealDtldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewMealDtldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
