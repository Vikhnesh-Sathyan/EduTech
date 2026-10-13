import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourceFilters } from './resource-filters';

describe('ResourceFilters', () => {
  let component: ResourceFilters;
  let fixture: ComponentFixture<ResourceFilters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResourceFilters]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResourceFilters);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
