import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyQuizActivity } from './daily-quiz-activity';

describe('DailyQuizActivity', () => {
  let component: DailyQuizActivity;
  let fixture: ComponentFixture<DailyQuizActivity>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailyQuizActivity]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DailyQuizActivity);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
