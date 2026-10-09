import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentMentorRecommendations } from './student-mentor-recommendations';

describe('StudentMentorRecommendations', () => {
  let component: StudentMentorRecommendations;
  let fixture: ComponentFixture<StudentMentorRecommendations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentMentorRecommendations]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentMentorRecommendations);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
