import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AptitudeQuestionsComponent } from './aptitude-questions.component';

describe('AptitudeQuestionsComponent', () => {
  let component: AptitudeQuestionsComponent;
  let fixture: ComponentFixture<AptitudeQuestionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AptitudeQuestionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AptitudeQuestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
