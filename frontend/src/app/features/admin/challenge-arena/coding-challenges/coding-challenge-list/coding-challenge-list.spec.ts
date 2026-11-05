import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodingChallengeList } from './coding-challenge-list';

describe('CodingChallengeList', () => {
  let component: CodingChallengeList;
  let fixture: ComponentFixture<CodingChallengeList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodingChallengeList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodingChallengeList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
