import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSectionLearning } from './admin-section-learning';

describe('AdminSectionLearning', () => {
  let component: AdminSectionLearning;
  let fixture: ComponentFixture<AdminSectionLearning>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminSectionLearning]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminSectionLearning);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
