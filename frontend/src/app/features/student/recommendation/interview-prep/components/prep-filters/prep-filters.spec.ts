import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrepFilters } from './prep-filters';

describe('PrepFilters', () => {
  let component: PrepFilters;
  let fixture: ComponentFixture<PrepFilters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrepFilters]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrepFilters);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
