import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizImportDetails } from './quiz-import-details';

describe('QuizImportDetails', () => {
  let component: QuizImportDetails;
  let fixture: ComponentFixture<QuizImportDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizImportDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuizImportDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
