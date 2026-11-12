import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutomationSettings } from './automation-settings';

describe('AutomationSettings', () => {
  let component: AutomationSettings;
  let fixture: ComponentFixture<AutomationSettings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutomationSettings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AutomationSettings);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
