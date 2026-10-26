import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConceptComparisonRows } from './concept-comparison-rows';

describe('ConceptComparisonRows', () => {
  let component: ConceptComparisonRows;
  let fixture: ComponentFixture<ConceptComparisonRows>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConceptComparisonRows]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConceptComparisonRows);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
