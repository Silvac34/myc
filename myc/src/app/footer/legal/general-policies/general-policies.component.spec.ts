import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralPoliciesComponent } from './general-policies.component';

describe('GeneralPoliciesComponent', () => {
  let component: GeneralPoliciesComponent;
  let fixture: ComponentFixture<GeneralPoliciesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeneralPoliciesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralPoliciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
