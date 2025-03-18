import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizStudentComponent } from './quiz-student.component';

describe('QuizStudentComponent', () => {
  let component: QuizStudentComponent;
  let fixture: ComponentFixture<QuizStudentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizStudentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuizStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
