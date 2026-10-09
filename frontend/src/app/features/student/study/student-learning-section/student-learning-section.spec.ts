import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentLearningSection } from './student-learning-section';

describe('StudentLearningSection', () => {
  let component: StudentLearningSection;
  let fixture: ComponentFixture<StudentLearningSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentLearningSection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentLearningSection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
