import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogicToCodeDashboard } from './logic-to-code-dashboard';

describe('LogicToCodeDashboard', () => {
  let component: LogicToCodeDashboard;
  let fixture: ComponentFixture<LogicToCodeDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogicToCodeDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogicToCodeDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
