import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeShuffleList } from './code-shuffle-list';

describe('CodeShuffleList', () => {
  let component: CodeShuffleList;
  let fixture: ComponentFixture<CodeShuffleList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodeShuffleList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodeShuffleList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
