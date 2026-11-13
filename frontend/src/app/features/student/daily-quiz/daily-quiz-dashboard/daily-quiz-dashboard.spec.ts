import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyQuizDashboard } from './daily-quiz-dashboard';

describe('DailyQuizDashboard', () => {
  let component: DailyQuizDashboard;
  let fixture: ComponentFixture<DailyQuizDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailyQuizDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DailyQuizDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
