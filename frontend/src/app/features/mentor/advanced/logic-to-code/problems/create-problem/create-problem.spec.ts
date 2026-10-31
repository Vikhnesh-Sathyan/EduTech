import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateProblem } from './create-problem';

describe('CreateProblem', () => {
  let component: CreateProblem;
  let fixture: ComponentFixture<CreateProblem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateProblem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateProblem);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
