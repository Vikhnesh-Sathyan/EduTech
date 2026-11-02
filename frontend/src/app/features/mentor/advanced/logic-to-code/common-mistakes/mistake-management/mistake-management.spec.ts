import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MistakeManagement } from './mistake-management';

describe('MistakeManagement', () => {
  let component: MistakeManagement;
  let fixture: ComponentFixture<MistakeManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MistakeManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MistakeManagement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
