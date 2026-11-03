import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExecutionResults } from './execution-results';

describe('ExecutionResults', () => {
  let component: ExecutionResults;
  let fixture: ComponentFixture<ExecutionResults>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExecutionResults]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExecutionResults);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
