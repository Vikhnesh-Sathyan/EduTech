import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyLearningSkills } from './my-learning-skills';

describe('MyLearningSkills', () => {
  let component: MyLearningSkills;
  let fixture: ComponentFixture<MyLearningSkills>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyLearningSkills]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyLearningSkills);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
