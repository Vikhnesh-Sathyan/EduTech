import { TestBed } from '@angular/core/testing';

import { ShortlistedstudentsService } from './shortlistedstudents.service';

describe('ShortlistedstudentsService', () => {
  let service: ShortlistedstudentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShortlistedstudentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
