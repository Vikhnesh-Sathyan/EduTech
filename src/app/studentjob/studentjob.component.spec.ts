import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentjobComponent } from './studentjob.component';

describe('StudentjobComponent', () => {
  let component: StudentjobComponent;
  let fixture: ComponentFixture<StudentjobComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentjobComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentjobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
