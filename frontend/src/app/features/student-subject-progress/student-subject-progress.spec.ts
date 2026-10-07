import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentSubjectProgress } from './student-subject-progress';

describe('StudentSubjectProgress', () => {
  let component: StudentSubjectProgress;
  let fixture: ComponentFixture<StudentSubjectProgress>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentSubjectProgress]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentSubjectProgress);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
