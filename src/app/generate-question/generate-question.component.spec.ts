import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateQuestionComponent } from './generate-question.component';

describe('GenerateQuestionComponent', () => {
  let component: GenerateQuestionComponent;
  let fixture: ComponentFixture<GenerateQuestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerateQuestionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerateQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
