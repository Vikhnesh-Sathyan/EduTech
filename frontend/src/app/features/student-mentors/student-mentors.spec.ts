import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentMentors } from './student-mentors';

describe('StudentMentors', () => {
  let component: StudentMentors;
  let fixture: ComponentFixture<StudentMentors>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentMentors]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentMentors);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
