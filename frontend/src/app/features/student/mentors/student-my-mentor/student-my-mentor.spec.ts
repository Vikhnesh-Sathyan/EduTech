import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentMyMentor } from './student-my-mentor';

describe('StudentMyMentor', () => {
  let component: StudentMyMentor;
  let fixture: ComponentFixture<StudentMyMentor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentMyMentor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentMyMentor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
