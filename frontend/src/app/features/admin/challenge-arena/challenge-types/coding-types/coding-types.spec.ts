import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodingTypes } from './coding-types';

describe('CodingTypes', () => {
  let component: CodingTypes;
  let fixture: ComponentFixture<CodingTypes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodingTypes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodingTypes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
