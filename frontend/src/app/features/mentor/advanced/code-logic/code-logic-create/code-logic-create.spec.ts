import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeLogicCreate } from './code-logic-create';

describe('CodeLogicCreate', () => {
  let component: CodeLogicCreate;
  let fixture: ComponentFixture<CodeLogicCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodeLogicCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodeLogicCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
