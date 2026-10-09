import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentPreviousMentors } from './student-previous-mentors';

describe('StudentPreviousMentors', () => {
  let component: StudentPreviousMentors;
  let fixture: ComponentFixture<StudentPreviousMentors>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentPreviousMentors]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentPreviousMentors);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
