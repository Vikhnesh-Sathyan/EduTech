import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeShuffleTask } from './code-shuffle-task';

describe('CodeShuffleTask', () => {
  let component: CodeShuffleTask;
  let fixture: ComponentFixture<CodeShuffleTask>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodeShuffleTask]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodeShuffleTask);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
