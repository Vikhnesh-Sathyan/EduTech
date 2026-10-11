import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentRecommendations } from './student-recommendations';

describe('StudentRecommendations', () => {
  let component: StudentRecommendations;
  let fixture: ComponentFixture<StudentRecommendations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentRecommendations]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentRecommendations);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
