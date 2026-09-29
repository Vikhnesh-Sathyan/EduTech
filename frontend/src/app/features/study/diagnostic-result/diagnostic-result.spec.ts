import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiagnosticResult } from './diagnostic-result';

describe('DiagnosticResult', () => {
  let component: DiagnosticResult;
  let fixture: ComponentFixture<DiagnosticResult>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiagnosticResult]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiagnosticResult);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
