import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfSummarizeComponent } from './pdf-summarize.component';

describe('PdfSummarizeComponent', () => {
  let component: PdfSummarizeComponent;
  let fixture: ComponentFixture<PdfSummarizeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdfSummarizeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PdfSummarizeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
