import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewTheoryChallenge } from './review-theory-challenge';

describe('ReviewTheoryChallenge', () => {
  let component: ReviewTheoryChallenge;
  let fixture: ComponentFixture<ReviewTheoryChallenge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewTheoryChallenge]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReviewTheoryChallenge);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
