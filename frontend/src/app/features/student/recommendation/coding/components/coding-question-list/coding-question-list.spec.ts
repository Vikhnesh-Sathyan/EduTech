import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodingQuestionList } from './coding-question-list';

describe('CodingQuestionList', () => {
  let component: CodingQuestionList;
  let fixture: ComponentFixture<CodingQuestionList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodingQuestionList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodingQuestionList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
