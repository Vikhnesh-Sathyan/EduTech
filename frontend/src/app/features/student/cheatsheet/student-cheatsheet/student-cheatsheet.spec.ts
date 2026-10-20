import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentCheatsheet } from './student-cheatsheet';

describe('StudentCheatsheet', () => {
  let component: StudentCheatsheet;
  let fixture: ComponentFixture<StudentCheatsheet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentCheatsheet]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentCheatsheet);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
