import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeShuffleCreate } from './code-shuffle-create';

describe('CodeShuffleCreate', () => {
  let component: CodeShuffleCreate;
  let fixture: ComponentFixture<CodeShuffleCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodeShuffleCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodeShuffleCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
