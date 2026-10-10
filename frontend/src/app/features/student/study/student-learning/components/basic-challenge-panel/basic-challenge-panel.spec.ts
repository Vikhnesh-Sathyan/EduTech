import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicChallengePanel } from './basic-challenge-panel';

describe('BasicChallengePanel', () => {
  let component: BasicChallengePanel;
  let fixture: ComponentFixture<BasicChallengePanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BasicChallengePanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BasicChallengePanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
