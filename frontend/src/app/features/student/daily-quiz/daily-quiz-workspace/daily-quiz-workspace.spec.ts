import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyQuizWorkspace } from './daily-quiz-workspace';

describe('DailyQuizWorkspace', () => {
  let component: DailyQuizWorkspace;
  let fixture: ComponentFixture<DailyQuizWorkspace>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailyQuizWorkspace]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DailyQuizWorkspace);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
