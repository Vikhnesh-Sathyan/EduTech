import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTheoryChallenge } from './create-theory-challenge';

describe('CreateTheoryChallenge', () => {
  let component: CreateTheoryChallenge;
  let fixture: ComponentFixture<CreateTheoryChallenge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateTheoryChallenge]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateTheoryChallenge);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
