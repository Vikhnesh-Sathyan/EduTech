import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportantPointsGenerator } from './important-points-generator';

describe('ImportantPointsGenerator', () => {
  let component: ImportantPointsGenerator;
  let fixture: ComponentFixture<ImportantPointsGenerator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportantPointsGenerator]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportantPointsGenerator);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
