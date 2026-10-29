import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmissionStatus } from './submission-status';

describe('SubmissionStatus', () => {
  let component: SubmissionStatus;
  let fixture: ComponentFixture<SubmissionStatus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmissionStatus]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmissionStatus);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
