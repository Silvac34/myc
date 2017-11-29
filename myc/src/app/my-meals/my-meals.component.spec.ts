import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyMealsComponent } from './my-meals.component';

describe('MyMealsComponent', () => {
  let component: MyMealsComponent;
  let fixture: ComponentFixture<MyMealsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyMealsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyMealsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
