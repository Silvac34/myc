import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyMealDtldComponent } from './my-meal-dtld.component';

describe('MyMealDtldComponent', () => {
  let component: MyMealDtldComponent;
  let fixture: ComponentFixture<MyMealDtldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyMealDtldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyMealDtldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
