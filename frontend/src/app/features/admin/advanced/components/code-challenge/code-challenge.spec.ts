import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeChallenge } from './code-challenge';

describe('CodeChallenge', () => {
  let component: CodeChallenge;
  let fixture: ComponentFixture<CodeChallenge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodeChallenge]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodeChallenge);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
