import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChallengeDetails } from './challenge-details';

describe('ChallengeDetails', () => {
  let component: ChallengeDetails;
  let fixture: ComponentFixture<ChallengeDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChallengeDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChallengeDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
