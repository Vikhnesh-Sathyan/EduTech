import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTeachingSkills } from './my-teaching-skills';

describe('MyTeachingSkills', () => {
  let component: MyTeachingSkills;
  let fixture: ComponentFixture<MyTeachingSkills>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyTeachingSkills]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyTeachingSkills);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
