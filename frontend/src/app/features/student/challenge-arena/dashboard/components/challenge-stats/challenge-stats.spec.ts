import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChallengeStats } from './challenge-stats';

describe('ChallengeStats', () => {
  let component: ChallengeStats;
  let fixture: ComponentFixture<ChallengeStats>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChallengeStats]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChallengeStats);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
