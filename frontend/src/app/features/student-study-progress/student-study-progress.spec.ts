import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentStudyProgress } from './student-study-progress';

describe('StudentStudyProgress', () => {
  let component: StudentStudyProgress;
  let fixture: ComponentFixture<StudentStudyProgress>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentStudyProgress]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentStudyProgress);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
