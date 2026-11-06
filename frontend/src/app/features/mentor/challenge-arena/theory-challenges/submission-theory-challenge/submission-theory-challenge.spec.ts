import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmissionTheoryChallenge } from './submission-theory-challenge';

describe('SubmissionTheoryChallenge', () => {
  let component: SubmissionTheoryChallenge;
  let fixture: ComponentFixture<SubmissionTheoryChallenge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmissionTheoryChallenge]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmissionTheoryChallenge);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
