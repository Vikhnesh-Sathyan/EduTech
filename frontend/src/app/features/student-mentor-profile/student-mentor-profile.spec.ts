import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentMentorProfile } from './student-mentor-profile';

describe('StudentMentorProfile', () => {
  let component: StudentMentorProfile;
  let fixture: ComponentFixture<StudentMentorProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentMentorProfile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentMentorProfile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
