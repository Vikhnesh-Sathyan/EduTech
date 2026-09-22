import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillGapPreview } from './skill-gap-preview';

describe('SkillGapPreview', () => {
  let component: SkillGapPreview;
  let fixture: ComponentFixture<SkillGapPreview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkillGapPreview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkillGapPreview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
