import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentgeneratedComponent } from './studentgenerated.component';

describe('StudentgeneratedComponent', () => {
  let component: StudentgeneratedComponent;
  let fixture: ComponentFixture<StudentgeneratedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentgeneratedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentgeneratedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
