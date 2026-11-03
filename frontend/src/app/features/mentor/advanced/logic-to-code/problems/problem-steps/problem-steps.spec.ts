import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProblemSteps } from './problem-steps';

describe('ProblemSteps', () => {
  let component: ProblemSteps;
  let fixture: ComponentFixture<ProblemSteps>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProblemSteps]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProblemSteps);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
