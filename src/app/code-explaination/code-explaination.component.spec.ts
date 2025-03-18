import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeExplainationComponent } from './code-explaination.component';

describe('CodeExplainationComponent', () => {
  let component: CodeExplainationComponent;
  let fixture: ComponentFixture<CodeExplainationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodeExplainationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodeExplainationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
