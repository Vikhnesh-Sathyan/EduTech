import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizDetails } from './quiz-details';

describe('QuizDetails', () => {
  let component: QuizDetails;
  let fixture: ComponentFixture<QuizDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuizDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
