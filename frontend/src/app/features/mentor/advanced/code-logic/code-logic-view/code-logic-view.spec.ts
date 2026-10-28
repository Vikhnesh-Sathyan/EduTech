import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeLogicView } from './code-logic-view';

describe('CodeLogicView', () => {
  let component: CodeLogicView;
  let fixture: ComponentFixture<CodeLogicView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodeLogicView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodeLogicView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
