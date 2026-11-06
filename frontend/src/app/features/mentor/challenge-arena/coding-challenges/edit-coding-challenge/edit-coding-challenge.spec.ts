import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCodingChallenge } from './edit-coding-challenge';

describe('EditCodingChallenge', () => {
  let component: EditCodingChallenge;
  let fixture: ComponentFixture<EditCodingChallenge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditCodingChallenge]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditCodingChallenge);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
