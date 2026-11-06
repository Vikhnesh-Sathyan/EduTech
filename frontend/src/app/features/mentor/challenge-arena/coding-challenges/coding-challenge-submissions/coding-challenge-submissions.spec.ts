import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodingChallengeSubmissions } from './coding-challenge-submissions';

describe('CodingChallengeSubmissions', () => {
  let component: CodingChallengeSubmissions;
  let fixture: ComponentFixture<CodingChallengeSubmissions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodingChallengeSubmissions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodingChallengeSubmissions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
