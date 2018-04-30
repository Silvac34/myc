import { TestBed, inject } from '@angular/core/testing';

import { GetMealService } from './get-meal.service';

describe('GetMealService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GetMealService]
    });
  });

  it('should be created', inject([GetMealService], (service: GetMealService) => {
    expect(service).toBeTruthy();
  }));
});
