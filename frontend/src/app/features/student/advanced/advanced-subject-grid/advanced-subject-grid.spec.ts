import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancedSubjectGrid } from './advanced-subject-grid';

describe('AdvancedSubjectGrid', () => {
  let component: AdvancedSubjectGrid;
  let fixture: ComponentFixture<AdvancedSubjectGrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvancedSubjectGrid]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdvancedSubjectGrid);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
