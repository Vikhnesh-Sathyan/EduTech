import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancedModuleCard } from './advanced-module-card';

describe('AdvancedModuleCard', () => {
  let component: AdvancedModuleCard;
  let fixture: ComponentFixture<AdvancedModuleCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvancedModuleCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdvancedModuleCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
