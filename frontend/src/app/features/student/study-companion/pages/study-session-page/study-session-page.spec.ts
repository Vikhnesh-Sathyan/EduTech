import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudySessionPage } from './study-session-page';

describe('StudySessionPage', () => {
  let component: StudySessionPage;
  let fixture: ComponentFixture<StudySessionPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudySessionPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudySessionPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
