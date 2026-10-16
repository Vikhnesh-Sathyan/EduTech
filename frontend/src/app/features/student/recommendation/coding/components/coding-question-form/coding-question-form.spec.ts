
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodingQuestionFormComponent } from './coding-question-form';

describe('CodingQuestionFormComponent', () => {
  let component: CodingQuestionFormComponent;
  let fixture: ComponentFixture<CodingQuestionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodingQuestionFormComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CodingQuestionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
