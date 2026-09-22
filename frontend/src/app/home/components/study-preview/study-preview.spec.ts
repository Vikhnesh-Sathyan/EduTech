import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyPreview } from './study-preview';

describe('StudyPreview', () => {
  let component: StudyPreview;
  let fixture: ComponentFixture<StudyPreview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudyPreview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudyPreview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
