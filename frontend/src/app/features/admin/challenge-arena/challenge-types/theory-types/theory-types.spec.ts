import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TheoryTypes } from './theory-types';

describe('TheoryTypes', () => {
  let component: TheoryTypes;
  let fixture: ComponentFixture<TheoryTypes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TheoryTypes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TheoryTypes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
