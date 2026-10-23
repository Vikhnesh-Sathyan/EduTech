import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancedModuleRenderer } from './advanced-module-renderer';

describe('AdvancedModuleRenderer', () => {
  let component: AdvancedModuleRenderer;
  let fixture: ComponentFixture<AdvancedModuleRenderer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvancedModuleRenderer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdvancedModuleRenderer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
