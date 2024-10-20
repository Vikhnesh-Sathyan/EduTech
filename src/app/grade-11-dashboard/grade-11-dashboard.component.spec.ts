import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Grade11DashboardComponent } from './grade-11-dashboard.component';

describe('Grade11DashboardComponent', () => {
  let component: Grade11DashboardComponent;
  let fixture: ComponentFixture<Grade11DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Grade11DashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Grade11DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
