import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LearningPanel } from './learning-panel';

describe('LearningPanel', () => {
  let component: LearningPanel;
  let fixture: ComponentFixture<LearningPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LearningPanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LearningPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
