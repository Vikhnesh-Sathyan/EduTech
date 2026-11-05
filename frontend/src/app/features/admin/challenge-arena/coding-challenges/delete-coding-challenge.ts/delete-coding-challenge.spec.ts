import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteCodingChallengeTs } from './delete-coding-challenge.js';

describe('DeleteCodingChallengeTs', () => {
  let component: DeleteCodingChallengeTs;
  let fixture: ComponentFixture<DeleteCodingChallengeTs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteCodingChallengeTs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteCodingChallengeTs);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
