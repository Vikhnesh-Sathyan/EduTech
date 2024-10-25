import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherReviewComponent } from './teacher-review.component';

describe('TeacherReviewComponent', () => {
  let component: TeacherReviewComponent;
  let fixture: ComponentFixture<TeacherReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherReviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeacherReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
