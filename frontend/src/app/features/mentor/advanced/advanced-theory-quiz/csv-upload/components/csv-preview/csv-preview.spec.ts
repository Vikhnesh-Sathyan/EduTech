import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CsvPreview } from './csv-preview';

describe('CsvPreview', () => {
  let component: CsvPreview;
  let fixture: ComponentFixture<CsvPreview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CsvPreview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CsvPreview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
