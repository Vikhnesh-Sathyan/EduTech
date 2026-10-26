import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConceptComparisonManagement } from './concept-comparison-management';

describe('ConceptComparisonManagement', () => {
  let component: ConceptComparisonManagement;
  let fixture: ComponentFixture<ConceptComparisonManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConceptComparisonManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConceptComparisonManagement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
