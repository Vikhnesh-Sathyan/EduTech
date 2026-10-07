import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MentorStudentProfile } from './mentor-student-profile';

describe('MentorStudentProfile', () => {
  let component: MentorStudentProfile;
  let fixture: ComponentFixture<MentorStudentProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MentorStudentProfile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MentorStudentProfile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
