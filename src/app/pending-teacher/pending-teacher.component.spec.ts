import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingTeacherComponent } from './pending-teacher.component';

describe('PendingTeacherComponent', () => {
  let component: PendingTeacherComponent;
  let fixture: ComponentFixture<PendingTeacherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingTeacherComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PendingTeacherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
