import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherRegisterComponent } from './teacher-register.component';

describe('TeacherRegisterComponent', () => {
  let component: TeacherRegisterComponent;
  let fixture: ComponentFixture<TeacherRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherRegisterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeacherRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
