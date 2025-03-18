import { TestBed } from '@angular/core/testing';

import { InterviewInsightsService } from './interview-insights.service';

describe('InterviewInsightsService', () => {
  let service: InterviewInsightsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InterviewInsightsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
