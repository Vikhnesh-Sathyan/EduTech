import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyCompanionPage } from './study-companion-page';

describe('StudyCompanionPage', () => {
  let component: StudyCompanionPage;
  let fixture: ComponentFixture<StudyCompanionPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudyCompanionPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudyCompanionPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
