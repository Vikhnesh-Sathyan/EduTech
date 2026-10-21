import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillSuggestions } from './skill-suggestions';

describe('SkillSuggestions', () => {
  let component: SkillSuggestions;
  let fixture: ComponentFixture<SkillSuggestions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkillSuggestions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkillSuggestions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
