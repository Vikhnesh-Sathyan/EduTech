import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TheoryHistory } from './theory-history';

describe('TheoryHistory', () => {
  let component: TheoryHistory;
  let fixture: ComponentFixture<TheoryHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TheoryHistory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TheoryHistory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
