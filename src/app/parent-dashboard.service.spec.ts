import { TestBed } from '@angular/core/testing';

import { ParentDashboardService } from './parent-dashboard.service';

describe('ParentDashboardService', () => {
  let service: ParentDashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ParentDashboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
