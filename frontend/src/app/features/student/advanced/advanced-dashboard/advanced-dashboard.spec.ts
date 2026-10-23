import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancedDashboard } from './advanced-dashboard';

describe('AdvancedDashboard', () => {
  let component: AdvancedDashboard;
  let fixture: ComponentFixture<AdvancedDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvancedDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdvancedDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
