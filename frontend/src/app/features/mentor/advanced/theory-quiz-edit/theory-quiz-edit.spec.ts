import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TheoryQuizEdit } from './theory-quiz-edit';

describe('TheoryQuizEdit', () => {
  let component: TheoryQuizEdit;
  let fixture: ComponentFixture<TheoryQuizEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TheoryQuizEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TheoryQuizEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
