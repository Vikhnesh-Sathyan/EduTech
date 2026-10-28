import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeLogicList } from './code-logic-list';

describe('CodeLogicList', () => {
  let component: CodeLogicList;
  let fixture: ComponentFixture<CodeLogicList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodeLogicList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodeLogicList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
