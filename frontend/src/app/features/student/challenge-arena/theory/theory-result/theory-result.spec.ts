import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TheoryResult } from './theory-result';

describe('TheoryResult', () => {
  let component: TheoryResult;
  let fixture: ComponentFixture<TheoryResult>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TheoryResult]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TheoryResult);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
