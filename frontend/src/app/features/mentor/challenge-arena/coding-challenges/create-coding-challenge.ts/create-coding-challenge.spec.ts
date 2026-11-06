import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCodingChallengeTs } from './create-coding-challenge.js';

describe('CreateCodingChallengeTs', () => {
  let component: CreateCodingChallengeTs;
  let fixture: ComponentFixture<CreateCodingChallengeTs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateCodingChallengeTs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateCodingChallengeTs);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
