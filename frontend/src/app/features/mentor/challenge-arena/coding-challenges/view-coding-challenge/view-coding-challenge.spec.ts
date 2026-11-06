import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCodingChallenge } from './view-coding-challenge';

describe('ViewCodingChallenge', () => {
  let component: ViewCodingChallenge;
  let fixture: ComponentFixture<ViewCodingChallenge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewCodingChallenge]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewCodingChallenge);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
