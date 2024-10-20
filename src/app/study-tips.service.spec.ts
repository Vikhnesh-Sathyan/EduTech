import { TestBed } from '@angular/core/testing';

import { StudyTipsService } from './study-tips.service';

describe('StudyTipsService', () => {
  let service: StudyTipsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudyTipsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
