import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Grade10DashboardComponent } from './grade-10-dashboard.component';

describe('Grade10DashboardComponent', () => {
  let component: Grade10DashboardComponent;
  let fixture: ComponentFixture<Grade10DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Grade10DashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Grade10DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
