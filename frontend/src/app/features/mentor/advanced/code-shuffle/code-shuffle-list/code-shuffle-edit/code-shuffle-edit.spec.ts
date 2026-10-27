import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeShuffleEdit } from './code-shuffle-edit';

describe('CodeShuffleEdit', () => {
  let component: CodeShuffleEdit;
  let fixture: ComponentFixture<CodeShuffleEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodeShuffleEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodeShuffleEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
