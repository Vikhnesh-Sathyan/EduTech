import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyQuizHistory } from './daily-quiz-history';

describe('DailyQuizHistory', () => {
  let component: DailyQuizHistory;
  let fixture: ComponentFixture<DailyQuizHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailyQuizHistory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DailyQuizHistory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
