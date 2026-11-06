import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TheoryList } from './theory-list';

describe('TheoryList', () => {
  let component: TheoryList;
  let fixture: ComponentFixture<TheoryList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TheoryList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TheoryList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
