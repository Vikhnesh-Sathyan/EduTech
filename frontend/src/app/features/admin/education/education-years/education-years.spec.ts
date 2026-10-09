import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EducationYears } from './education-years';

describe('EducationYears', () => {
  let component: EducationYears;
  let fixture: ComponentFixture<EducationYears>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EducationYears]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EducationYears);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
