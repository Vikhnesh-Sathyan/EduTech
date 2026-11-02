import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HintManagement } from './hint-management';

describe('HintManagement', () => {
  let component: HintManagement;
  let fixture: ComponentFixture<HintManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HintManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HintManagement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
