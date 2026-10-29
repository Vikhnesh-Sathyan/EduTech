import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeLogicQuestions } from './code-logic-questions';

describe('CodeLogicQuestions', () => {
  let component: CodeLogicQuestions;
  let fixture: ComponentFixture<CodeLogicQuestions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodeLogicQuestions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodeLogicQuestions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
