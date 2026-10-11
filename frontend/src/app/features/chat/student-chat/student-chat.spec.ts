import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentChat } from './student-chat';

describe('StudentChat', () => {
  let component: StudentChat;
  let fixture: ComponentFixture<StudentChat>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentChat]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentChat);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
