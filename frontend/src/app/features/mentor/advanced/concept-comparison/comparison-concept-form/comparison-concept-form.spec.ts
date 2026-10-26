import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComparisonConceptForm } from './comparison-concept-form';

describe('ComparisonConceptForm', () => {
  let component: ComparisonConceptForm;
  let fixture: ComponentFixture<ComparisonConceptForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComparisonConceptForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComparisonConceptForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
