import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmissionDetails } from './submission-details';

describe('SubmissionDetails', () => {
  let component: SubmissionDetails;
  let fixture: ComponentFixture<SubmissionDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmissionDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmissionDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
