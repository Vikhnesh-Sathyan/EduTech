import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProblemDetails } from './problem-details';

describe('ProblemDetails', () => {
  let component: ProblemDetails;
  let fixture: ComponentFixture<ProblemDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProblemDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProblemDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
