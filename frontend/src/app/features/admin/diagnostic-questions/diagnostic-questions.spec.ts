import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiagnosticQuestions } from './diagnostic-questions';

describe('DiagnosticQuestions', () => {
  let component: DiagnosticQuestions;
  let fixture: ComponentFixture<DiagnosticQuestions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiagnosticQuestions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiagnosticQuestions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
