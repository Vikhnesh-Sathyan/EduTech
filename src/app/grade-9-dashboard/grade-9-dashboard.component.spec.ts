import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Grade9DashboardComponent } from './grade-9-dashboard.component';

describe('Grade9DashboardComponent', () => {
  let component: Grade9DashboardComponent;
  let fixture: ComponentFixture<Grade9DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Grade9DashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Grade9DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
