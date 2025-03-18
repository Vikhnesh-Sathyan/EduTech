import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminjobComponent } from './adminjob.component';

describe('AdminjobComponent', () => {
  let component: AdminjobComponent;
  let fixture: ComponentFixture<AdminjobComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminjobComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminjobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
