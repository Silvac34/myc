import { TestBed, inject } from '@angular/core/testing';

import { MessengerCheckboxService } from './messenger-checkbox.service';

describe('MessengerCheckboxService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MessengerCheckboxService]
    });
  });

  it('should be created', inject([MessengerCheckboxService], (service: MessengerCheckboxService) => {
    expect(service).toBeTruthy();
  }));
});
