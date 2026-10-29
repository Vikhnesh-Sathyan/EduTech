import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskEdit } from './task-edit';

describe('TaskEdit', () => {
  let component: TaskEdit;
  let fixture: ComponentFixture<TaskEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
