import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAdvanced } from './admin-advanced';

describe('AdminAdvanced', () => {
  let component: AdminAdvanced;
  let fixture: ComponentFixture<AdminAdvanced>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAdvanced]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminAdvanced);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
