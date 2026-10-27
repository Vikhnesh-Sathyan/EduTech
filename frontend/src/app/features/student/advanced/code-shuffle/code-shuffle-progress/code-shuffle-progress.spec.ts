import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeShuffleProgress } from './code-shuffle-progress';

describe('CodeShuffleProgress', () => {
  let component: CodeShuffleProgress;
  let fixture: ComponentFixture<CodeShuffleProgress>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodeShuffleProgress]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodeShuffleProgress);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
