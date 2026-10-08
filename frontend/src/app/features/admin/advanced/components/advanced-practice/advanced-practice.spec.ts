import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancedPractice } from './advanced-practice';

describe('AdvancedPractice', () => {
  let component: AdvancedPractice;
  let fixture: ComponentFixture<AdvancedPractice>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvancedPractice]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdvancedPractice);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
