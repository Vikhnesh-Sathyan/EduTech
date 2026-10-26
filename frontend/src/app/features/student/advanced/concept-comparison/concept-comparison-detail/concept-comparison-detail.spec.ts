import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConceptComparisonDetail } from './concept-comparison-detail';

describe('ConceptComparisonDetail', () => {
  let component: ConceptComparisonDetail;
  let fixture: ComponentFixture<ConceptComparisonDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConceptComparisonDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConceptComparisonDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
