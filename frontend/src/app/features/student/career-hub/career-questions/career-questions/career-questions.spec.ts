import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CareerQuestions } from './career-questions';

describe('CareerQuestions', () => {
  let component: CareerQuestions;
  let fixture: ComponentFixture<CareerQuestions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CareerQuestions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CareerQuestions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
