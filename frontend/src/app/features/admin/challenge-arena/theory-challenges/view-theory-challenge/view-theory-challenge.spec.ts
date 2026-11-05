import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTheoryChallenge } from './view-theory-challenge';

describe('ViewTheoryChallenge', () => {
  let component: ViewTheoryChallenge;
  let fixture: ComponentFixture<ViewTheoryChallenge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewTheoryChallenge]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewTheoryChallenge);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
