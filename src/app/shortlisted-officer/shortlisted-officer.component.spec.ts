import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShortlistedOfficerComponent } from './shortlisted-officer.component';

describe('ShortlistedOfficerComponent', () => {
  let component: ShortlistedOfficerComponent;
  let fixture: ComponentFixture<ShortlistedOfficerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShortlistedOfficerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShortlistedOfficerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
