import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskSubmissions } from './task-submissions';

describe('TaskSubmissions', () => {
  let component: TaskSubmissions;
  let fixture: ComponentFixture<TaskSubmissions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskSubmissions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskSubmissions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
