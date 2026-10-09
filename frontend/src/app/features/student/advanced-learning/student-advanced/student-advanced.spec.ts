import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentAdvanced } from './student-advanced';

describe('StudentAdvanced', () => {
  let component: StudentAdvanced;
  let fixture: ComponentFixture<StudentAdvanced>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentAdvanced]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentAdvanced);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
