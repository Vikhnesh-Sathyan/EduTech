import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LearningHome } from './learning-home';

describe('LearningHome', () => {
  let component: LearningHome;
  let fixture: ComponentFixture<LearningHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LearningHome]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LearningHome);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
