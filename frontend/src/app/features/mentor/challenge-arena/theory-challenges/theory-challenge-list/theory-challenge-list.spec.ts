import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TheoryChallengeList } from './theory-challenge-list';

describe('TheoryChallengeList', () => {
  let component: TheoryChallengeList;
  let fixture: ComponentFixture<TheoryChallengeList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TheoryChallengeList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TheoryChallengeList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
