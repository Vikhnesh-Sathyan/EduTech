import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageSkills } from './manage-skills';

describe('ManageSkills', () => {
  let component: ManageSkills;
  let fixture: ComponentFixture<ManageSkills>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageSkills]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageSkills);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
