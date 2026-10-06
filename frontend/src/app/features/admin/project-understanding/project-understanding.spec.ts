import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectUnderstanding } from './project-understanding';

describe('ProjectUnderstanding', () => {
  let component: ProjectUnderstanding;
  let fixture: ComponentFixture<ProjectUnderstanding>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectUnderstanding]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectUnderstanding);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
