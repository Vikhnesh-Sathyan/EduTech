import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryDisplay } from './summary-display';

describe('SummaryDisplay', () => {
  let component: SummaryDisplay;
  let fixture: ComponentFixture<SummaryDisplay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SummaryDisplay]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SummaryDisplay);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
