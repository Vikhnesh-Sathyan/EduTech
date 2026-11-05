import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCodingChallenge } from './create-coding-challenge';

describe('CreateCodingChallenge', () => {
  let component: CreateCodingChallenge;
  let fixture: ComponentFixture<CreateCodingChallenge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateCodingChallenge]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateCodingChallenge);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
