import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EducationPrograms } from './education-programs';

describe('EducationPrograms', () => {
  let component: EducationPrograms;
  let fixture: ComponentFixture<EducationPrograms>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EducationPrograms]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EducationPrograms);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
