import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TheoryQuizView } from './theory-quiz-view';

describe('TheoryQuizView', () => {
  let component: TheoryQuizView;
  let fixture: ComponentFixture<TheoryQuizView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TheoryQuizView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TheoryQuizView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
