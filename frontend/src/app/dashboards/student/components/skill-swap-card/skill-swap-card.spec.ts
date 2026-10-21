import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillSwapCard } from './skill-swap-card';

describe('SkillSwapCard', () => {
  let component: SkillSwapCard;
  let fixture: ComponentFixture<SkillSwapCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkillSwapCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkillSwapCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
