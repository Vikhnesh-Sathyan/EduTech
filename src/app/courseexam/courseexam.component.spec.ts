import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseexamComponent } from './courseexam.component';

describe('CourseexamComponent', () => {
  let component: CourseexamComponent;
  let fixture: ComponentFixture<CourseexamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseexamComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseexamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
