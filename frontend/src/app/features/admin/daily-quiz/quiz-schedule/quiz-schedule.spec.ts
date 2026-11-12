import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizSchedule } from './quiz-schedule';

describe('QuizSchedule', () => {
  let component: QuizSchedule;
  let fixture: ComponentFixture<QuizSchedule>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizSchedule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuizSchedule);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
