import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancedLearningContent } from './advanced-learning-content';

describe('AdvancedLearningContent', () => {
  let component: AdvancedLearningContent;
  let fixture: ComponentFixture<AdvancedLearningContent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvancedLearningContent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdvancedLearningContent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
