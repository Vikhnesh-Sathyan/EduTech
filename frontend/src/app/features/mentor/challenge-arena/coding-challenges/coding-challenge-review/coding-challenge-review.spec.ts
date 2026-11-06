import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodingChallengeReview } from './coding-challenge-review';

describe('CodingChallengeReview', () => {
  let component: CodingChallengeReview;
  let fixture: ComponentFixture<CodingChallengeReview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodingChallengeReview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodingChallengeReview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
