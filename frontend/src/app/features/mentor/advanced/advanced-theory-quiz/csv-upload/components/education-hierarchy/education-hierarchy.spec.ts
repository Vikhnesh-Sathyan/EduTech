import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EducationHierarchy } from './education-hierarchy';

describe('EducationHierarchy', () => {
  let component: EducationHierarchy;
  let fixture: ComponentFixture<EducationHierarchy>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EducationHierarchy]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EducationHierarchy);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
