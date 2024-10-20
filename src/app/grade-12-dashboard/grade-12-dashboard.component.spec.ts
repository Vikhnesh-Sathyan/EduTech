import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Grade12DashboardComponent } from './grade-12-dashboard.component';

describe('Grade12DashboardComponent', () => {
  let component: Grade12DashboardComponent;
  let fixture: ComponentFixture<Grade12DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Grade12DashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Grade12DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
