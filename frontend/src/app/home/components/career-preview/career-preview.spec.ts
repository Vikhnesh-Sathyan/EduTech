import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CareerPreview } from './career-preview';

describe('CareerPreview', () => {
  let component: CareerPreview;
  let fixture: ComponentFixture<CareerPreview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CareerPreview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CareerPreview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
