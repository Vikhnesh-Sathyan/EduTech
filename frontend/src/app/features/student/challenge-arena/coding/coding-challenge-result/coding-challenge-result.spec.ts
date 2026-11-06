import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodingChallengeResult } from './coding-challenge-result';

describe('CodingChallengeResult', () => {
  let component: CodingChallengeResult;
  let fixture: ComponentFixture<CodingChallengeResult>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodingChallengeResult]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodingChallengeResult);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
