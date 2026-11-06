import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChallengeCategories } from './challenge-categories';

describe('ChallengeCategories', () => {
  let component: ChallengeCategories;
  let fixture: ComponentFixture<ChallengeCategories>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChallengeCategories]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChallengeCategories);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
