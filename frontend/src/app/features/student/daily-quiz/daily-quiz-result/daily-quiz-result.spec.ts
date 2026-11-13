import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyQuizResult } from './daily-quiz-result';

describe('DailyQuizResult', () => {
  let component: DailyQuizResult;
  let fixture: ComponentFixture<DailyQuizResult>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailyQuizResult]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DailyQuizResult);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
