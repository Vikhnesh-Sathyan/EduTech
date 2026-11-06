import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChallengeHero } from './challenge-hero';

describe('ChallengeHero', () => {
  let component: ChallengeHero;
  let fixture: ComponentFixture<ChallengeHero>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChallengeHero]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChallengeHero);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
