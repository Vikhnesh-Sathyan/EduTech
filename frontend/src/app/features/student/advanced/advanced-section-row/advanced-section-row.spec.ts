import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancedSectionRow } from './advanced-section-row';

describe('AdvancedSectionRow', () => {
  let component: AdvancedSectionRow;
  let fixture: ComponentFixture<AdvancedSectionRow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvancedSectionRow]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdvancedSectionRow);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
