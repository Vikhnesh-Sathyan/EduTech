import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeepDive } from './deep-dive';

describe('DeepDive', () => {
  let component: DeepDive;
  let fixture: ComponentFixture<DeepDive>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeepDive]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeepDive);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
