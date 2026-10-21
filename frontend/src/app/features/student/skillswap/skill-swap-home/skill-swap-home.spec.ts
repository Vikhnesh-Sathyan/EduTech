import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillSwapHome } from './skill-swap-home';

describe('SkillSwapHome', () => {
  let component: SkillSwapHome;
  let fixture: ComponentFixture<SkillSwapHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkillSwapHome]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkillSwapHome);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
