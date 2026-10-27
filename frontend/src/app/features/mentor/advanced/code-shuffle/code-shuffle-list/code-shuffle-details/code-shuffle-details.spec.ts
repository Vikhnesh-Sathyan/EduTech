import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeShuffleDetails } from './code-shuffle-details';

describe('CodeShuffleDetails', () => {
  let component: CodeShuffleDetails;
  let fixture: ComponentFixture<CodeShuffleDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodeShuffleDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodeShuffleDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
