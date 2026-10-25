import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CsvFileUpload } from './csv-file-upload';

describe('CsvFileUpload', () => {
  let component: CsvFileUpload;
  let fixture: ComponentFixture<CsvFileUpload>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CsvFileUpload]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CsvFileUpload);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
