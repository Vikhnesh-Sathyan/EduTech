import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComparisonRowForm } from './comparison-row-form';

describe('ComparisonRowForm', () => {
  let component: ComparisonRowForm;
  let fixture: ComponentFixture<ComparisonRowForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComparisonRowForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComparisonRowForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
