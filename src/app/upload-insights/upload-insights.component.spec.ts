import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadInsightsComponent } from './upload-insights.component';

describe('UploadInsightsComponent', () => {
  let component: UploadInsightsComponent;
  let fixture: ComponentFixture<UploadInsightsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadInsightsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadInsightsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
