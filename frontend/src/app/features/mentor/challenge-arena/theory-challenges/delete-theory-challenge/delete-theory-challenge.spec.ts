import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteTheoryChallenge } from './delete-theory-challenge';

describe('DeleteTheoryChallenge', () => {
  let component: DeleteTheoryChallenge;
  let fixture: ComponentFixture<DeleteTheoryChallenge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteTheoryChallenge]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteTheoryChallenge);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
