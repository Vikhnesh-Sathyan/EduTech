import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeLogicDetails } from './code-logic-details';

describe('CodeLogicDetails', () => {
  let component: CodeLogicDetails;
  let fixture: ComponentFixture<CodeLogicDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodeLogicDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodeLogicDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
