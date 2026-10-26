import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConceptComparisonList } from './concept-comparison-list';

describe('ConceptComparisonList', () => {
  let component: ConceptComparisonList;
  let fixture: ComponentFixture<ConceptComparisonList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConceptComparisonList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConceptComparisonList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
