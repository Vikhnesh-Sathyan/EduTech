import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewExperiences } from './interview-experiences';

describe('InterviewExperiences', () => {
  let component: InterviewExperiences;
  let fixture: ComponentFixture<InterviewExperiences>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterviewExperiences]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterviewExperiences);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
