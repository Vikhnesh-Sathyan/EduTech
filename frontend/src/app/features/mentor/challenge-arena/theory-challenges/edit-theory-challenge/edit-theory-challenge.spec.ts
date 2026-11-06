import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTheoryChallenge } from './edit-theory-challenge';

describe('EditTheoryChallenge', () => {
  let component: EditTheoryChallenge;
  let fixture: ComponentFixture<EditTheoryChallenge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditTheoryChallenge]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditTheoryChallenge);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
