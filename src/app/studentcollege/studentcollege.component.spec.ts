import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentcollegeComponent } from './studentcollege.component';

describe('StudentcollegeComponent', () => {
  let component: StudentcollegeComponent;
  let fixture: ComponentFixture<StudentcollegeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentcollegeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentcollegeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
