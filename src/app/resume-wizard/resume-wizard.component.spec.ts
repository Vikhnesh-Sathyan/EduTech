import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResumeWizardComponent } from './resume-wizard.component';

describe('ResumeWizardComponent', () => {
  let component: ResumeWizardComponent;
  let fixture: ComponentFixture<ResumeWizardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResumeWizardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResumeWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
