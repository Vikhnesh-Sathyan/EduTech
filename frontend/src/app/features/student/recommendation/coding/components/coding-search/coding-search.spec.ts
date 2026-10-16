import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodingSearch } from './coding-search';

describe('CodingSearch', () => {
  let component: CodingSearch;
  let fixture: ComponentFixture<CodingSearch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodingSearch]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodingSearch);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
