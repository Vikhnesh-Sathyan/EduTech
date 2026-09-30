import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminLearningSections } from './admin-learning-sections';

describe('AdminLearningSections', () => {
  let component: AdminLearningSections;
  let fixture: ComponentFixture<AdminLearningSections>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminLearningSections]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminLearningSections);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
