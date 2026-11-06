import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TheoryDetails } from './theory-details';

describe('TheoryDetails', () => {
  let component: TheoryDetails;
  let fixture: ComponentFixture<TheoryDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TheoryDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TheoryDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
