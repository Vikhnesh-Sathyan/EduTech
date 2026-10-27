import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeShuffleTopics } from './code-shuffle-topics';

describe('CodeShuffleTopics', () => {
  let component: CodeShuffleTopics;
  let fixture: ComponentFixture<CodeShuffleTopics>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodeShuffleTopics]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodeShuffleTopics);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
