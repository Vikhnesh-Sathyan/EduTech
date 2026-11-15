import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportantPointsDisplay } from './important-points-display';

describe('ImportantPointsDisplay', () => {
  let component: ImportantPointsDisplay;
  let fixture: ComponentFixture<ImportantPointsDisplay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportantPointsDisplay]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportantPointsDisplay);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
