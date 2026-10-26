import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConceptComparison } from './concept-comparison';

describe('ConceptComparison', () => {
  let component: ConceptComparison;
  let fixture: ComponentFixture<ConceptComparison>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConceptComparison]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConceptComparison);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
