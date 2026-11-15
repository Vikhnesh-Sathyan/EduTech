import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryGenerator } from './summary-generator';

describe('SummaryGenerator', () => {
  let component: SummaryGenerator;
  let fixture: ComponentFixture<SummaryGenerator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SummaryGenerator]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SummaryGenerator);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
