import { TestBed, inject } from '@angular/core/testing';

import { GetCountryService } from './get-country.service';

describe('GetCountryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GetCountryService]
    });
  });

  it('should be created', inject([GetCountryService], (service: GetCountryService) => {
    expect(service).toBeTruthy();
  }));
});
