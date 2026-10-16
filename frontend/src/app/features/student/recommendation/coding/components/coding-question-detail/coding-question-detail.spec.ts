import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodingQuestionDetail } from './coding-question-detail';

describe('CodingQuestionDetail', () => {
  let component: CodingQuestionDetail;
  let fixture: ComponentFixture<CodingQuestionDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodingQuestionDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodingQuestionDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
