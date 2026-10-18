import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeAnimation } from './code-animation';

describe('CodeAnimation', () => {
  let component: CodeAnimation;
  let fixture: ComponentFixture<CodeAnimation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodeAnimation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodeAnimation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
