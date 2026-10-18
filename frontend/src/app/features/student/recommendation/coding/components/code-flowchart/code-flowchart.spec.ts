import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeFlowchart } from './code-flowchart';

describe('CodeFlowchart', () => {
  let component: CodeFlowchart;
  let fixture: ComponentFixture<CodeFlowchart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodeFlowchart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodeFlowchart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
