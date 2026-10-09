import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicChallenge } from './basic-challenge';

describe('BasicChallenge', () => {
  let component: BasicChallenge;
  let fixture: ComponentFixture<BasicChallenge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BasicChallenge]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BasicChallenge);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
