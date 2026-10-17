import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeAlgorithm } from './code-algorithm';

describe('CodeAlgorithm', () => {
  let component: CodeAlgorithm;
  let fixture: ComponentFixture<CodeAlgorithm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodeAlgorithm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodeAlgorithm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
