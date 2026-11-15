import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportantPointsPanel } from './important-points-panel';

describe('ImportantPointsPanel', () => {
  let component: ImportantPointsPanel;
  let fixture: ComponentFixture<ImportantPointsPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportantPointsPanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportantPointsPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
