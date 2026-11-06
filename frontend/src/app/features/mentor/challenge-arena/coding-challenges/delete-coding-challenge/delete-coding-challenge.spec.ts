import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteCodingChallenge } from './delete-coding-challenge';

describe('DeleteCodingChallenge', () => {
  let component: DeleteCodingChallenge;
  let fixture: ComponentFixture<DeleteCodingChallenge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteCodingChallenge]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteCodingChallenge);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
