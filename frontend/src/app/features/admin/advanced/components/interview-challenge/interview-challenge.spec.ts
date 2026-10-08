import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewChallenge } from './interview-challenge';

describe('InterviewChallenge', () => {
  let component: InterviewChallenge;
  let fixture: ComponentFixture<InterviewChallenge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterviewChallenge]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterviewChallenge);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
