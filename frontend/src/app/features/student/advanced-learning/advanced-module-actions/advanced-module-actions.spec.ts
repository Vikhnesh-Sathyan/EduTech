import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancedModuleActions } from './advanced-module-actions';

describe('AdvancedModuleActions', () => {
  let component: AdvancedModuleActions;
  let fixture: ComponentFixture<AdvancedModuleActions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvancedModuleActions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdvancedModuleActions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
