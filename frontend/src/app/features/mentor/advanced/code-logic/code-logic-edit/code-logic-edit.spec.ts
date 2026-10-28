import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeLogicEdit } from './code-logic-edit';

describe('CodeLogicEdit', () => {
  let component: CodeLogicEdit;
  let fixture: ComponentFixture<CodeLogicEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodeLogicEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodeLogicEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
