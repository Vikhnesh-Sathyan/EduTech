import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditProblem } from './edit-problem';

describe('EditProblem', () => {
  let component: EditProblem;
  let fixture: ComponentFixture<EditProblem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditProblem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditProblem);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
